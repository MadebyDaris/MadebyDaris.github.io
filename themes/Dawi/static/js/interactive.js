document.addEventListener('DOMContentLoaded', function () {
    initCommandPalette();
    initSpotlightCards();
    initTypewriter();
});

/* ---------------------------------------------------------------
   Command palette (Ctrl+K / Cmd+K) — fuzzy-ish search over the
   site's posts, projects and renders, built from /search-index.json
   --------------------------------------------------------------- */
function initCommandPalette() {
    const overlay = document.getElementById('command-palette-overlay');
    const input = document.getElementById('command-palette-input');
    const results = document.getElementById('command-palette-results');
    const trigger = document.getElementById('command-palette-trigger');
    if (!overlay || !input || !results) return;

    let index = null;
    let activeIndex = -1;
    let currentItems = [];

    function loadIndex() {
        if (index !== null) return Promise.resolve(index);
        return fetch(window.location.origin + '/search-index.json')
            .then(r => r.ok ? r.json() : [])
            .catch(() => [])
            .then(data => { index = data; return index; });
    }

    function open() {
        overlay.hidden = false;
        document.body.style.overflow = 'hidden';
        loadIndex().then(() => {
            input.value = '';
            render('');
            setTimeout(() => input.focus(), 0);
        });
    }

    function close() {
        overlay.hidden = true;
        document.body.style.overflow = '';
        activeIndex = -1;
    }

    function sectionLabel(section) {
        if (section === 'posts') return 'Post';
        if (section === 'projects') return 'Project';
        if (section === 'renders') return 'Render';
        return 'Page';
    }

    function render(query) {
        const q = query.trim().toLowerCase();
        const data = index || [];
        let items;
        if (!q) {
            items = data.slice(0, 8);
        } else {
            items = data
                .map(item => ({ item, score: matchScore(item, q) }))
                .filter(x => x.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 8)
                .map(x => x.item);
        }
        currentItems = items;
        activeIndex = items.length ? 0 : -1;

        if (!items.length) {
            results.innerHTML = '<div class="command-palette-empty">No matches. Try a different word.</div>';
            return;
        }

        results.innerHTML = items.map((item, i) => `
            <a href="${item.url}" class="command-palette-item${i === 0 ? ' is-active' : ''}" data-index="${i}">
                <span class="cp-item-section">${sectionLabel(item.section)}</span>
                <span class="cp-item-body">
                    <span class="cp-item-title">${escapeHtml(item.title)}</span>
                    <span class="cp-item-desc">${escapeHtml(item.description || '')}</span>
                </span>
            </a>
        `).join('');
    }

    function matchScore(item, q) {
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const tags = (item.tags || []).join(' ').toLowerCase();
        if (title.startsWith(q)) return 100;
        if (title.includes(q)) return 60;
        if (tags.includes(q)) return 30;
        if (desc.includes(q)) return 15;
        return 0;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function setActive(newIndex) {
        const els = results.querySelectorAll('.command-palette-item');
        if (!els.length) return;
        activeIndex = (newIndex + els.length) % els.length;
        els.forEach((el, i) => el.classList.toggle('is-active', i === activeIndex));
        els[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    if (trigger) {
        trigger.addEventListener('click', (e) => { e.preventDefault(); open(); });
    }

    document.addEventListener('keydown', (e) => {
        const isK = e.key === 'k' || e.key === 'K';
        if ((e.metaKey || e.ctrlKey) && isK) {
            e.preventDefault();
            overlay.hidden ? open() : close();
            return;
        }
        if (!overlay.hidden && e.key === 'Escape') {
            close();
            return;
        }
        if (!overlay.hidden && e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(activeIndex + 1);
        }
        if (!overlay.hidden && e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(activeIndex - 1);
        }
        if (!overlay.hidden && e.key === 'Enter') {
            const active = results.querySelector('.command-palette-item.is-active');
            if (active) window.location.href = active.getAttribute('href');
        }
    });

    overlay.addEventListener('mousedown', (e) => {
        if (e.target === overlay) close();
    });

    input.addEventListener('input', () => render(input.value));
}

/* ---------------------------------------------------------------
   Cursor-tracked spotlight glow on card-shaped elements
   --------------------------------------------------------------- */
function initSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
        });
    });
}

/* ---------------------------------------------------------------
   Typewriter effect for the homepage hero subtitle
   --------------------------------------------------------------- */
function initTypewriter() {
    const el = document.getElementById('typewriter-target');
    if (!el) return;

    const raw = el.getAttribute('data-phrases') || '';
    const phrases = raw.split('|').map(s => s.trim()).filter(Boolean);
    if (phrases.length < 2) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '|';
    el.appendChild(document.createTextNode(''));
    el.appendChild(cursor);

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const phrase = phrases[phraseIndex];
        if (!deleting) {
            charIndex++;
            el.firstChild.textContent = phrase.slice(0, charIndex);
            if (charIndex === phrase.length) {
                deleting = true;
                setTimeout(tick, 1600);
                return;
            }
        } else {
            charIndex--;
            el.firstChild.textContent = phrase.slice(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
            }
        }
        setTimeout(tick, deleting ? 35 : 55);
    }

    setTimeout(tick, 400);
}
