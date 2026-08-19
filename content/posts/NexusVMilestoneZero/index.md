---
title: "Giving NexusV a Memory, A look into Scratchpads, AXI, and the Small Protocols That Hold It Together"
date: 2026-08-10
description: "This post is a deep dive into the specific engineering choices I made while designing the NexusV processor, focusing on the memory system that connects the CPU core to its surrounding hardware."
tags: ["RISC-V", "Computer Architecture", "AXI", "Chipyard", "Open Source", "Verification"]
type: post
weight: 2
katex: true
showTableOfContents: true
---


For a while, every accelerator in [NexusV](https://github.com/MadebyDaris/NexusV) shared the same
contract, following the RISCV Custom Instruction ISA, take `rs1` and `rs2`, two 32-bit numbers, and a few cycles later it hands back `rd`.
Multiply-accumulate, saturating add, CRC, modular reduction. All of them worked perfectly with this model. 

Then I tried to build anything that needed to *remember* something between instructions, and the whole
model fell apart. This post is about what broke, what I had to learn about on-chip buses to fix it, and the three pieces that ended up doing the work: a **scratchpad SRAM**, an **AXI-Lite master**, and a tiny
but critical piece of plumbing called a **skid buffer**.

If you're not from a hardware background, that's fine, this was written by someone who's an amateur as well.

## The problem: two registers isn't a lot of bandwidth

Every custom instruction NexusV's coprocessor executes comes in through the CPU's decode stage carrying,
at most, two 32-bit operands and a 3-bit `funct3` field to say which accelerator to route to. That's the
entire budget for *one instruction*. It's plenty for `c = a + b`. It is nowhere near enough for "here's an
8-element array, run an NTT over it," because there's no register wide enough to carry an array, or any 
kind of memory to store the incoming data for the operation.

In the end, the only fix is: don't try to send the data in one instruction. Send it in *several*, and give the
accelerator somewhere to store it in between.

## What a scratchpad SRAM actually is

If you're used to software, "memory" usually means something the OS manages for you, for instance in C you may `malloc` and
don't think about where the bytes physically live. A **scratchpad SRAM** is the hardware version of a much
blunter and finicky idea: a fixed, small block of on-chip SRAM that is
*explicitly addressed* by whatever's talking to it. No cache, no virtual memory, no automatic eviction,
if you want word 17, you drive address `17` onto the address bus and read whatever's there.

The reason accelerators use scratchpads instead of, say, a bigger register file is that SRAM is cheap and
dense per bit, while registers are expensive and fast. A scratchpad gives you a chunk of local, low-latency
storage that's *big enough* to hold real working data
without paying for a full register file at that size.

NexusV's scratchpad, is **dual-port**: two independent address/data interfaces into
the same underlying memory array, Port A and Port B. If there were only one port, the CPU writing configuration data in and the datapath reading its operands
out would have to take turns leading to a resource-contention bug in waiting.
The moment both sides want the memory in the same cycle. Two ports means the CPU can be loading the *next*
operand into the scratchpad while the datapath is still crunching the *current* one.

```systemverilog
module nexus_scratchpad #(
    parameter int WORDS      = 256,
    parameter int DATA_WIDTH = 32
) (
    // Port A — read/write (the CPU's config path, via AXI)
    input  logic [ADDR_WIDTH-1:0] a_addr_i,
    input  logic                  a_we_i,
    input  logic [DATA_WIDTH-1:0] a_wdata_i,
    output logic [DATA_WIDTH-1:0] a_rdata_o,

    // Port B — the datapath's own access, driven by the mux
    input  logic [ADDR_WIDTH-1:0] b_addr_i,
    output logic [DATA_WIDTH-1:0] b_rdata_o
    // ...
);
```

In the current wiring, Port A belongs to the CPU (arriving over AXI, more on that below) and Port B
belongs to whatever stateful datapath is active. The CPU fills memory; the accelerator drains it.

## Teaching the dispatcher a three-word vocabulary

A scratchpad on its own doesn't solve the "only two operands per instruction" problem it just gives you
somewhere to put data hence the terminoly scratchpad. The dispatcher, a tiny command protocol so a sequence of ordinary custom instructions can act like one
longer "load array, then go" operation, solves that.

```systemverilog
localparam logic [2:0] CMD_WRITE_ADDR = 3'd0;
localparam logic [2:0] CMD_WRITE_DATA = 3'd1;
localparam logic [2:0] CMD_START      = 3'd2;
```

So instead of one instruction, the brand new stateful accelerator call becomes a short sequence, it has a few quirks:

1. **`CMD_WRITE_ADDR`**: "the next value goes at this scratchpad address"
2. **`CMD_WRITE_DATA`**: "here's the value, write it, and bump the address"
3. **`CMD_START`**: "you have everything, go compute"

It's a three-instruction-minimum finite state machine hiding behind what looks, from the CPU's side, like
just three more custom instructions issued back-to-back. Nothing about this is exotic, it's the same
load-then-fire pattern you'd recognize from configuring any memory-mapped peripheral, but designing it
myself.

## What an AXI master is, and why I needed one

Port A of the scratchpad had to be reachable from software, the RISC-V core needs to write configuration
data into it like it would write to any other memory-mapped device. The standard way to expose an
on-chip block like that is **AXI** (Advanced eXtensible Interface), which is, practically speaking, *the*
industry-standard bus protocol for connecting components on a chip. If you've ever wondered how a CPU,
a DMA engine, and a dozen peripherals all talk to the same interconnect without hardcoding wires between
every pair of them, its all in the **AXI** protocol.

AXI splits communication into up to five independent channels, write address, write data, write
response, read address, read data, each with its own `valid`/`ready` handshake. A transfer only happens
on a clock edge where both sides raise `valid` and `ready` at the same time, either side can stall the
other for any number of cycles, and that's *by design*, not a bug to work around.

I only needed a small slice of full AXI4, no bursts yet, and no out-of-order IDs, so I resorted to building my own **AXI-Lite master**.

```systemverilog
case (state)
  IDLE: begin
    if (skid_req_valid)
      next_state = skid_req_we ? WRITE_ADDR_DATA : READ_ADDR;
  end

  WRITE_ADDR_DATA: begin
    axi_awvalid_o = ~aw_done;   // address channel
    axi_wvalid_o  = ~w_done;    // data channel — independent handshake!
    // both must complete (possibly on different cycles) before advancing
    if ((aw_done || (axi_awvalid_o && axi_awready_i)) &&
        (w_done  || (axi_wvalid_o  && axi_wready_i)))
      next_state = WRITE_RESP;
  end
  // ...
```

The detail that actually taught me something: the write-address and write-data channels are *independent*. AXI doesn't guarantee they complete on the same cycle, or even in address-then-data order.

## The piece that made it all not fall over: skid buffers

Here's the problem I didn't see coming. My internal request/response interface, the simple one before it gets translated into AXI, also uses a `valid`/`ready` handshake. But the AXI FSM above needs *multiple cycles* to walk a single request through `WRITE_ADDR_DATA → WRITE_RESP`. If the upstream side (the scratchpad's Port A wiring, ultimately the CPU) sends a new request while the FSM is still mid-transfer, where does that request go? Dropping it is wrong.

That's what a **skid buffer** is: a small FIFO, in our case, just a circular buffer 2–4 entries deep, sitting between two `valid`/`ready` interfaces. Its entire job is to absorb exactly this kind of timing mismatch.

```systemverilog
assign m_valid = (count > 0);
assign m_data  = buffer[head];
assign s_ready = (count < BUFFER_DEPTH);   // still room? keep accepting.

always_ff @(posedge clk_i) begin
  if (s_valid && s_ready) begin buffer[tail] <= s_data; tail <= tail + 1; end
  if (m_valid && m_ready) begin head <= head + 1; end
  // count += push, -= pop, both in the same cycle if both happen
end
```

The AXI master wraps *both* its request and response paths in a skid buffer (`req_skid`, `resp_skid`), precisely so the multi-cycle AXI FSM can decouple its own timing from whatever's driving it upstream and whatever's consuming its output downstream.

## What's next

The scratchpad's Port A is wired to the AXI master now, and Port B to the mux's stateful path, but the
CV-X-IF memory/memory-result channels.The
next real milestone is wiring the scratchpad up to those channels so accelerators can pull larger working
sets directly, instead of relying entirely on the write-address/write-data command sequence described
above. The compute pipelines exist and pass their unit tests, but they haven't earned "verified"
until they're exercised through the full stack, not just standalone.


Read more here !
**[github.com/MadebyDaris/NexusV](https://github.com/MadebyDaris/NexusV)**.