
'use strict';

const CONFIG = {
    BOOT_DURATION: 4000,
    MOBILE_BOOT_DURATION: 3000,
    CLOCK_UPDATE_INTERVAL: 1000,
    COUNTDOWN_UPDATE_INTERVAL: 30000,
    GREETING_UPDATE_INTERVAL: 60000,
    QUOTE_ROTATION_INTERVAL: 6000,
    MOBILE_BREAKPOINT: 768,
    BIRTHDAY: { month: 9, day: 16 }, 
    WINDOW_OFFSET: 30, 
    TASKBAR_HEIGHT: 50,
    LOCK_PIN: '1610'
};


const Utils = {
   
    qs(selector, parent = document) {
        return parent.querySelector(selector);
    },

   
    qsAll(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },

  
    padZero(num) {
        return String(num).padStart(2, '0');
    },

   
    getGreeting(name = 'Sakshi') {
        const hour = new Date().getHours();
        if (hour < 12) return `Good morning, ${name} 🌅`;
        if (hour < 17) return `Good afternoon, ${name} ☀️`;
        return `Good evening, ${name} 🌙`;
    },

  
    getDaysUntilBirthday() {
        const now = new Date();
        let year = now.getFullYear();
        const birthday = new Date(year, CONFIG.BIRTHDAY.month, CONFIG.BIRTHDAY.day, 0, 0, 0);
        
        if (now > birthday) {
            year += 1;
        }
        
        const target = new Date(year, CONFIG.BIRTHDAY.month, CONFIG.BIRTHDAY.day, 0, 0, 0);
        const diffMs = target - now;
        const totalMins = Math.floor(diffMs / 60000);
        const days = Math.floor(totalMins / (60 * 24));
        const hours = Math.floor((totalMins % (60 * 24)) / 60);
        const mins = totalMins % 60;
        
        return { days, hours, mins, totalDays: Math.ceil(diffMs / (1000 * 60 * 60 * 24)) };
    },

  
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format time in Asia/Kolkata (IST)
    formatTimeIST(date = new Date()) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    },

    // Format date in Asia/Kolkata (IST)
    formatDateIST(date = new Date()) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
    },

    // Lightweight toast notification
    showToast(message, duration = 2000) {
        if (!message) return;
        // Remove existing toast if present
        const existing = document.querySelector('.toast-message');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;

        // Adjust bottom offset for mobile vs desktop
        const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
        toast.style.bottom = isMobile ? '90px' : '70px';

        document.body.appendChild(toast);
        // Trigger transition
        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 350);
        }, duration);
    }
};

const openWhenLetters = {
    happy: {
        title: "When You're Happy",
        content: `I love seeing you happy. You're  happiness makes me happy. I love spending time with you, I love talking with you, I love listening to you. I love knowing how your day was, I love everything, I love YOU, not in a romantic way, erm`
    },
    sad: {
        title: "When You're Sad",
        content: `It's okay to not be okay. But just know that I'll always be there to listen to you, to be your therapist, to be ears, to advise you, to let you know that you're not alone, I'll always be on your side`
    },
    stressed: {
        title: "When You're Stressed",
        content: `Breathe. Seriously, take a deep breath right now. Don't go stressing over stuff, it doesn't matter, what matters is that you're okay. Everything else can wait. Just take care of yourself, and let me know if you ever need anything, even at 3 AM, I'll reply next morning.`
    },
    proud: {
        title: "When You Need to Feel Proud",
        content: `Look at you, what all you've overcome, if I was you, I'd stop talking to everyone, everyone. Losing people you loved so much, but you, you never didn't, you're just amazing, you're Sakshi, you're just him.`
    },
    lonely: {
        title: "When You Feel Alone",
        content: `You're not alone, even when it feels that way. I'm here. I might not always know the right thing to say, but I'm always on your side. If you ever go depression mode and think no one loves you, just think, I'm here, but if none truly doesn't love you, I died.`
    },
    brave: {
        title: "When You Need Courage",
        content: `Just dm 1059770507546861609, i.e basedshura, i.e, me.`
    }
};

const inspirationQuotes = [
    { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", note: "Your potential is limitless." },
    { quote: "The best way to predict the future is to create it.", author: "Peter Drucker", note: "Every step counts." },
    { quote: "You are enough just as you are.", author: "Me", note: "Never forget your worth." },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", note: "Find your passion." }
];

const RotatingInspiration = {
    quotes: inspirationQuotes,
    currentIndex: 0,
    
    init(container) {
        this.container = container;
        this.display();
        setInterval(() => this.next(), 10000); // Change every 10 seconds
    },
    
    display() {
        const quote = this.quotes[this.currentIndex];
        this.container.innerHTML = `
            <div class="inspiration-icon" aria-hidden="true">✨</div>
            <blockquote class="inspiration-quote">"${quote.quote}"</blockquote>
            <p class="inspiration-author">— ${quote.author}</p>
            <p class="inspiration-note">${quote.note}</p>
        `;
    },
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.quotes.length;
        this.display();
    }
};

// Lock Screen Module
const LockScreen = {
    isLocked: false,
    el: null,
    timeInterval: null,

    init() {
        this.injectStyles();
        this.buildDOM();
        this.bindGlobalTriggers();
    },

    injectStyles() {
        if (document.querySelector('style[data-lockscreen]')) return;
        const css = `
#lock-screen { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(236,72,153,0.85), rgba(244,114,182,0.75), rgba(251,207,232,0.65)); backdrop-filter: blur(18px); z-index: 20000; color: #fff; }
#lock-screen.lock-hidden { display: none; }
#lock-screen .lock-container { text-align: center; padding: 28px 24px; border-radius: 20px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 20px 60px rgba(0,0,0,0.35); min-width: 280px; max-width: 90vw; }
#lock-screen .lock-time { font-size: 54px; font-weight: 800; text-shadow: 0 6px 18px rgba(0,0,0,0.35); margin-bottom: 6px; }
#lock-screen .lock-date { font-size: 16px; opacity: 0.95; margin-bottom: 14px; text-shadow: 0 3px 10px rgba(0,0,0,0.35); }
#lock-screen .lock-greeting { margin: 8px 0 10px; font-size: 18px; font-weight: 700; text-shadow: 0 3px 10px rgba(0,0,0,0.35); }
#lock-screen .lock-instruction { margin: 0 0 16px; font-size: 14px; opacity: 0.95; }
#lock-screen .lock-unlock-btn { background: rgba(255,255,255,0.22); color: #fff; border: 1px solid rgba(255,255,255,0.35); border-radius: 12px; padding: 10px 16px; font-weight: 700; font-size: 15px; box-shadow: 0 10px 28px rgba(0,0,0,0.25); transition: transform .2s ease, background .2s ease, box-shadow .2s ease; }
#lock-screen .lock-unlock-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.3); box-shadow: 0 14px 34px rgba(0,0,0,0.28); }
#lock-screen .lock-unlock-btn:active { transform: translateY(0); }
#lock-screen .lock-pin { width: 200px; padding: 10px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.45); background: rgba(255,255,255,0.15); color: #fff; font-size: 18px; text-align: center; outline: none; box-shadow: 0 6px 18px rgba(0,0,0,0.2); }
#lock-screen .lock-pin::placeholder { color: rgba(255,255,255,0.85); }
#lock-screen .lock-error { color: #fff; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.35); min-height: 18px; margin: 10px 0; }
        `;
        const style = document.createElement('style');
        style.setAttribute('data-lockscreen', '');
        style.textContent = css;
        document.head.appendChild(style);
    },

    buildDOM() {
        if (document.getElementById('lock-screen')) {
            this.el = document.getElementById('lock-screen');
            return;
        }
        const el = document.createElement('div');
        el.id = 'lock-screen';
        el.className = 'lock-hidden';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-hidden', 'true');
        el.setAttribute('aria-labelledby', 'lock-title');
        el.setAttribute('aria-describedby', 'lock-subtitle');
        el.innerHTML = `
            <div class="lock-container">
                <div class="lock-time" aria-live="polite"></div>
                <div class="lock-date"></div>
                <h2 id="lock-title" class="lock-greeting">Hi Sakshi 💖</h2>
                <p id="lock-subtitle" class="lock-instruction">Enter PIN to unlock</p>
                <input class="lock-pin" type="password" maxlength="6" inputmode="numeric" pattern="[0-9]*" aria-label="Enter PIN" placeholder="•••" />
                <div class="lock-error" aria-live="assertive" role="alert" style="min-height:18px;"></div>
                <button class="lock-unlock-btn" aria-label="Unlock">Unlock</button>
            </div>
        `;
        document.body.appendChild(el);
        this.el = el;

        const unlockBtn = this.el.querySelector('.lock-unlock-btn');
        unlockBtn.addEventListener('click', () => this.tryUnlock());
    },

    updateTime() {
        const now = new Date();
        const time = Utils.formatTimeIST(now);
        const date = Utils.formatDateIST(now);
        const timeEl = this.el.querySelector('.lock-time');
        const dateEl = this.el.querySelector('.lock-date');
        if (timeEl) timeEl.textContent = time.replace(' IST','');
        if (dateEl) dateEl.textContent = date;
    },

    startClock() {
        this.updateTime();
        this.timeInterval = setInterval(() => this.updateTime(), CONFIG.CLOCK_UPDATE_INTERVAL);
    },

    stopClock() {
        if (this.timeInterval) clearInterval(this.timeInterval);
        this.timeInterval = null;
    },

    showError(msg) {
        const err = this.el.querySelector('.lock-error');
        if (err) {
            err.textContent = msg || '';
        }
    },

    clearError() {
        const err = this.el.querySelector('.lock-error');
        if (err) {
            err.textContent = '';
        }
    },

    validatePin(input) {
        return String(input) === String(CONFIG.LOCK_PIN);
    },

    tryUnlock() {
        const pinEl = this.el.querySelector('.lock-pin');
        const val = pinEl?.value?.trim() ?? '';
        if (this.validatePin(val)) {
            this.clearError();
            this.unlock();
        } else {
            this.showError('Incorrect PIN');
            if (pinEl) {
                pinEl.value = '';
                pinEl.focus();
            }
        }
    },

    lock() {
        if (this.isLocked) return;
        this.isLocked = true;
        this.el.classList.remove('lock-hidden');
        this.el.setAttribute('aria-hidden', 'false');
        this.startClock();
        const pinEl = this.el.querySelector('.lock-pin');
        if (pinEl) {
            pinEl.value = '';
            pinEl.focus();
        }
        this.clearError();
    },

    unlock() {
        if (!this.isLocked) return;
        this.isLocked = false;
        this.el.classList.add('lock-hidden');
        this.el.setAttribute('aria-hidden', 'true');
        this.stopClock();
        const pinEl = this.el.querySelector('.lock-pin');
        if (pinEl) pinEl.value = '';
    },

    bindGlobalTriggers() {
        document.addEventListener('keydown', (e) => {
            if (!this.isLocked) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.tryUnlock();
            } else if (/^[0-9]$/.test(e.key)) {
                const pinEl = this.el.querySelector('.lock-pin');
                if (pinEl) pinEl.focus();
            }
        });
    }
};

// Photo Memory Module: renders images from the "photo memory" folder
const PhotoMemory = {
    basePath: 'photo memory/',
    photos: [
        'saksi small.jpeg',
        'saksi.webp',
        'Screenshot_20251007-112530_Discord.jpg',
        'Screenshot 2024-06-30 135650.png',
        '2025-10-14_19-02.png',
        '2025-10-14_19-04.png',
        'B00B75FA-FDD8-446A-96C3-1DE83F9D5CE3.jpeg',
        'image (6).jpg'
    ],
    labels: { young: 'Then', now: 'Now' },
    // Files that need a left rotation (90deg CCW)
    rotateLeft: [
        '2025-10-14_19-02.png',
        '2025-10-14_19-04.png',
        'B00B75FA-FDD8-446A-96C3-1DE83F9D5CE3.jpeg',
        'image (6).jpg',
        'Screenshot 2024-06-30 135650.png'
    ],

    ensureStyles() {
        if (document.querySelector('style[data-photo-memory]')) return;
        const css = `
.app-photo-memory .photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}
.pm-item {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(244,114,182,0.28);
  background: rgba(251,207,232,0.12);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  cursor: zoom-in;
  transition: transform .2s ease, box-shadow .2s ease;
  aspect-ratio: 16 / 9;
}
.pm-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pm-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.12);
}
.pm-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #666;
}
/* Comparison layout */
.pm-compare { 
  display: grid; 
  grid-template-columns: 1fr auto 1fr; 
  align-items: center; 
  gap: 12px; 
  margin-bottom: 14px; 
}
.pm-compare-item { 
  margin: 0; 
  border-radius: 14px; 
  overflow: hidden; 
  border: 1px solid rgba(244,114,182,0.28); 
  background: rgba(251,207,232,0.12); 
  box-shadow: 0 6px 16px rgba(0,0,0,0.08); 
  cursor: zoom-in; 
}
.pm-compare-item img { 
  width: 100%; 
  height: 220px; 
  object-fit: cover; 
  display: block; 
}
.pm-compare-item figcaption { 
  text-align: center; 
  padding: 6px 8px; 
  font-weight: 600; 
  font-size: 12px; 
  color: #444; 
}
.pm-compare-sep { 
  color: #999; 
  font-size: 18px; 
  user-select: none; 
}
@media (max-width: 768px) {
  .pm-compare { grid-template-columns: 1fr; }
  .pm-compare-sep { display: none; }
  .pm-compare-item img { width: 100%; height: auto; object-fit: contain; }
  }
/* Rotate-left helper for mis-oriented images */
.pm-rotate-left { display: grid; place-items: center; }
.pm-rotate-left img { transform: rotate(-90deg); transform-origin: center center; object-fit: cover; }
#pm-lightbox {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,0.35);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  z-index: 20000;
  opacity: 0;
  transition: opacity .25s ease;
}
#pm-lightbox.show { opacity: 1; }
#pm-lightbox .pm-lightbox-content {
  position: relative;
  margin: 0;
  max-width: 90vw;
  max-height: 85vh;
  box-shadow: 0 20px 60px rgba(0,0,0,.35);
}
#pm-lightbox img {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 12px;
  display: block;
  object-fit: contain;
}
#pm-lightbox img.pm-rot-left { transform: rotate(-90deg); transform-origin: center center; }
#pm-lightbox .pm-lightbox-close {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  color: #111;
  font-size: 20px;
  line-height: 1;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 10px 22px rgba(0,0,0,0.2);
}
`;
        const style = document.createElement('style');
        style.setAttribute('data-photo-memory', '');
        style.textContent = css;
        document.head.appendChild(style);
    },

    init(root) {
        try {
            this.ensureStyles();
            const gallery = root.querySelector('.photo-gallery');
            if (!gallery) return;

            gallery.innerHTML = '';

            this.renderComparison(root);

            if (!this.photos.length) {
                const empty = document.createElement('p');
                empty.className = 'pm-empty';
                empty.textContent = 'No photos yet. Add images to the photo memory folder.';
                gallery.appendChild(empty);
                return;
            }

            this.photos.forEach((name) => {
                if (name === 'saksi small.jpeg' || name === 'saksi.webp') return;
                const src = this.basePath + name;
                const fig = document.createElement('figure');
                fig.className = 'pm-item';
                if (this.rotateLeft && this.rotateLeft.includes(name)) {
                    fig.classList.add('pm-rotate-left');
                }
                const img = document.createElement('img');
                img.loading = 'lazy';
                img.src = src;
                img.alt = this.altFromName(name);
                img.onerror = () => { fig.style.display = 'none'; };
                fig.appendChild(img);
                fig.addEventListener('click', () => this.openLightbox(src, img.alt));
                gallery.appendChild(fig);
            });
        } catch (e) {
            console.error('PhotoMemory init error:', e);
        }
    },

    renderComparison(root) {
        try {
            const smallName = 'saksi small.jpeg';
            const currentName = 'saksi.webp';
            if (!this.photos.includes(smallName) || !this.photos.includes(currentName)) return;
            const gallery = root.querySelector('.photo-gallery');
            if (!gallery) return;

            // Labels from HTML data-attributes if present
            const appRoot = root.querySelector('.app-photo-memory') || root;
            const youngLabel = appRoot.getAttribute('data-young-label') || this.labels.young || 'Young';
            const nowLabel = appRoot.getAttribute('data-now-label') || this.labels.now || 'Now';

            const cmp = document.createElement('div');
            cmp.className = 'pm-compare';

            const makeItem = (name, label) => {
                const fig = document.createElement('figure');
                fig.className = 'pm-compare-item';
                const img = document.createElement('img');
                img.loading = 'lazy';
                img.src = this.basePath + name;
                img.alt = `${label} - ${this.altFromName(name)}`;
                img.onerror = () => { fig.style.display = 'none'; };
                const cap = document.createElement('figcaption');
                cap.textContent = label;
                fig.appendChild(img);
                fig.appendChild(cap);
                fig.addEventListener('click', () => this.openLightbox(img.src, img.alt));
                return fig;
            };

            const young = makeItem(smallName, youngLabel);
            const now = makeItem(currentName, nowLabel);
            // Do not rotate saksi.webp anymore as requested

            const sep = document.createElement('div');
            sep.className = 'pm-compare-sep';
            sep.textContent = '↔';

            cmp.appendChild(young);
            cmp.appendChild(sep);
            cmp.appendChild(now);

            gallery.before(cmp);
        } catch (e) {
            console.error('PhotoMemory renderComparison error:', e);
        }
    },

    altFromName(name) {
        return name
            .replace(/[_.-]+/g, ' ')
            .replace(/\.[^.]+$/, '')
            .trim();
    },

    openLightbox(src, alt) {
        this.ensureStyles();
        let overlay = document.getElementById('pm-lightbox');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'pm-lightbox';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.innerHTML = `
                <figure class="pm-lightbox-content">
                    <img alt="" />
                    <figcaption class="sr-only"></figcaption>
                    <button class="pm-lightbox-close" aria-label="Close">×</button>
                </figure>
            `;
            document.body.appendChild(overlay);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay || e.target.classList.contains('pm-lightbox-close')) {
                    overlay.classList.remove('show');
                    setTimeout(() => overlay.remove(), 250);
                }
            });
            document.addEventListener('keydown', (e) => {
                if (overlay && e.key === 'Escape') {
                    overlay.classList.remove('show');
                    setTimeout(() => overlay.remove(), 250);
                }
            });
        }
        const img = overlay.querySelector('img');
        const cap = overlay.querySelector('figcaption');
        if (img) {
            img.classList.remove('pm-rot-left');
            const filename = (src || '').split('/').pop();
            if (this.rotateLeft && this.rotateLeft.includes(filename)) {
                img.classList.add('pm-rot-left');
            }
            img.src = src;
            img.alt = alt || '';
        }
        if (cap) cap.textContent = alt || '';
        requestAnimationFrame(() => overlay.classList.add('show'));
    }
};

// Desktop Application Logic
const DesktopApp = {
    windowCount: 0,
    openWindows: [],
    initialized: false,


    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.hideBootScreen();
        this.initDailyWidget();
        this.initIcons();
        this.initClock();
        this.initStartMenu();
        this.initClockPopup();
        this.initKeyboardNavigation();
        this.initSwitchToMobile();
    },

    /**
     * Hide boot screen after animation
     */
    hideBootScreen() {
        setTimeout(() => {
            const bootScreen = Utils.qs('#boot-screen');
            if (bootScreen) {
                bootScreen.style.display = 'none';
            }
        }, CONFIG.BOOT_DURATION);
    },

    /**
     * Initialize daily widget
     */
    initDailyWidget() {
        const widget = Utils.qs('#daily-widget');
        if (!widget) return;

        // Build widget HTML
        widget.innerHTML = `
            <div class="dw-header">
                <div class="dw-greeting">Hi Sakshi 💖</div>
                <button class="dw-toggle" aria-label="Expand widget" aria-expanded="true">▼</button>
            </div>
            <div class="dw-body">
                <div class="dw-countdown">
                    <div class="dw-count-label">Birthday in</div>
                    <div class="dw-count-values">
                        <span class="dw-days">--</span><span class="dw-unit">d</span>
                        <span class="dw-hours">--</span><span class="dw-unit">h</span>
                        <span class="dw-mins">--</span><span class="dw-unit">m</span>
                    </div>
                </div>
                <div class="dw-quote">"You make the world brighter. ✨"</div>
            </div>
            <div class="dw-footer">
                <button class="dw-action dw-love" aria-label="Send love">Send Love 💌</button>
                <button class="dw-action dw-open" aria-label="Open birthday vault">Open Birthday Vault 🎂</button>
            </div>
        `;

        const toggleBtn = Utils.qs('.dw-toggle', widget);
        const bodyEl = Utils.qs('.dw-body', widget);
        const footerEl = Utils.qs('.dw-footer', widget);
        let expanded = true;

        // Toggle expansion
        const setExpanded = (state) => {
            expanded = state;
            toggleBtn.setAttribute('aria-expanded', state);
            if (expanded) {
                bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';
                footerEl.style.maxHeight = footerEl.scrollHeight + 'px';
                toggleBtn.textContent = '▼';
            } else {
                bodyEl.style.maxHeight = '0px';
                footerEl.style.maxHeight = '0px';
                toggleBtn.textContent = '▲';
            }
        };

        // Initial expansion
        setTimeout(() => setExpanded(true), 50);

        toggleBtn.addEventListener('click', () => setExpanded(!expanded));

        // Quote rotation
        const quotes = [
            'You make the world brighter. ✨',
            'I will always care for you',
            'I will always be there for you',
            'I will never hurt you',
            'You are enough as you are'
        ];
        let quoteIdx = 0;

        const rotateQuote = () => {
            quoteIdx = (quoteIdx + 1) % quotes.length;
            const quoteEl = Utils.qs('.dw-quote', widget);
            if (quoteEl) {
                quoteEl.style.opacity = '0';
                setTimeout(() => {
                    quoteEl.textContent = quotes[quoteIdx];
                    quoteEl.style.opacity = '1';
                }, 300);
            }
        };

        setInterval(rotateQuote, CONFIG.QUOTE_ROTATION_INTERVAL);

        // Update greeting
        const updateGreeting = () => {
            const greetingEl = Utils.qs('.dw-greeting', widget);
            if (greetingEl) {
                greetingEl.textContent = Utils.getGreeting('Sakshi') + ' 💖';
            }
        };

        // Update countdown
        const updateCountdown = () => {
            const { days, hours, mins } = Utils.getDaysUntilBirthday();
            const daysEl = Utils.qs('.dw-days', widget);
            const hoursEl = Utils.qs('.dw-hours', widget);
            const minsEl = Utils.qs('.dw-mins', widget);
            
            if (daysEl) daysEl.textContent = String(days);
            if (hoursEl) hoursEl.textContent = Utils.padZero(hours);
            if (minsEl) minsEl.textContent = Utils.padZero(mins);
        };

        updateGreeting();
        updateCountdown();
        setInterval(updateGreeting, CONFIG.GREETING_UPDATE_INTERVAL);
        setInterval(updateCountdown, CONFIG.COUNTDOWN_UPDATE_INTERVAL);

        // Love button
        const loveBtn = Utils.qs('.dw-love', widget);
        if (loveBtn) {
            loveBtn.addEventListener('click', () => {
                const burst = document.createElement('div');
                burst.className = 'dw-burst';
                widget.appendChild(burst);
                setTimeout(() => burst.remove(), 1000);
                Utils.showToast('Happy Birthday, Sakshi! 💖');
            });
        }

        // Open vault button
        const openBtn = Utils.qs('.dw-open', widget);
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.launchApp('birthday-vault');
            });
        }
    },

    /**
     * Initialize desktop icons
     */
    initIcons() {
        const icons = Utils.qsAll('.icon');
        icons.forEach(icon => {
            icon.addEventListener('click', () => {
                const app = icon.getAttribute('data-app');
                this.launchApp(app);
            });

            // Keyboard support
            icon.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const app = icon.getAttribute('data-app');
                    this.launchApp(app);
                }
            });
        });
    },

    /**
     * Initialize and update clock
     */
    initClock() {
        const updateClock = () => {
            const clockEl = Utils.qs('#clock');
            if (!clockEl) return;

            const now = new Date();
            const time = Utils.formatTimeIST(now);
            
            const timeEl = Utils.qs('time', clockEl);
            if (timeEl) {
                timeEl.textContent = time + ' IST';
                timeEl.setAttribute('datetime', now.toISOString());
            } else {
                clockEl.textContent = time + ' IST';
            }
        };

        updateClock();
        setInterval(updateClock, CONFIG.CLOCK_UPDATE_INTERVAL);
    },

    /**
     * Initialize start menu
     */
    initStartMenu() {
        const startMenuBtn = Utils.qs('#start-menu');
        const startMenuPopup = Utils.qs('#start-menu-popup');
        const closeBtn = Utils.qs('.close-start-menu');

        if (!startMenuBtn || !startMenuPopup) return;

        const toggleMenu = () => {
            const isHidden = startMenuPopup.classList.toggle('start-menu-hidden');
            startMenuBtn.setAttribute('aria-expanded', String(!isHidden));
            if (!isHidden) {
                const firstApp = startMenuPopup.querySelector('.start-menu-app');
                (firstApp || closeBtn || startMenuBtn).focus();
            }
        };

        const closeMenu = () => {
            startMenuPopup.classList.add('start-menu-hidden');
            startMenuBtn.setAttribute('aria-expanded', 'false');
            startMenuBtn.focus();
        };

        startMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!startMenuBtn.contains(e.target) && !startMenuPopup.contains(e.target)) {
                closeMenu();
            }
        });

        // Start menu apps
        const apps = Utils.qsAll('.start-menu-app');
        apps.forEach(app => {
            app.addEventListener('click', () => {
                const appType = app.getAttribute('data-app');
                closeMenu();
                this.launchApp(appType);
            });
        });
    },

    /**
     * Initialize clock popup
     */
    initClockPopup() {
        const clockBtn = Utils.qs('#clock');
        const clockPopup = Utils.qs('#clock-popup');
        const closeBtn = Utils.qs('.close-clock-popup');

        if (!clockBtn || !clockPopup) return;

        const togglePopup = () => {
            const isHidden = clockPopup.classList.toggle('clock-popup-hidden');
            clockBtn.setAttribute('aria-expanded', String(!isHidden));
            if (!isHidden) {
                this.updateClockPopup();
                (closeBtn || clockBtn).focus();
            }
        };

        const closePopup = () => {
            clockPopup.classList.add('clock-popup-hidden');
            clockBtn.setAttribute('aria-expanded', 'false');
            clockBtn.focus();
        };

        clockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePopup();
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closePopup);
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!clockBtn.contains(e.target) && !clockPopup.contains(e.target)) {
                closePopup();
            }
        });
    },

    /**
     * Update clock popup content
     */
    updateClockPopup() {
        const now = new Date();
        const time = Utils.formatTimeIST(now);
        const date = Utils.formatDateIST(now);

        const { totalDays } = Utils.getDaysUntilBirthday();
        const sweetMessage = Utils.getGreeting('beautiful');

        const timeEl = Utils.qs('.current-time');
        const dateEl = Utils.qs('.current-date');
        const countdownEl = Utils.qs('.birthday-countdown');
        const messageEl = Utils.qs('.sweet-message');

        if (timeEl) timeEl.textContent = time;
        if (dateEl) dateEl.textContent = date;
        if (countdownEl) {
            countdownEl.innerHTML = `<p>🎂 ${totalDays} days until your birthday!</p>`;
        }
        if (messageEl) {
            messageEl.innerHTML = `<p>${sweetMessage}</p>`;
        }
    },

    /**
     * Launch an application window
     */
    launchApp(appType) {
        if (!appType) return;

        const windowsContainer = Utils.qs('#windows-container');
        if (!windowsContainer) return;

        // Create window element
        const windowDiv = document.createElement('div');
        windowDiv.className = 'window';
        windowDiv.setAttribute('role', 'dialog');
        windowDiv.setAttribute('aria-labelledby', `window-title-${this.windowCount}`);
        windowDiv.setAttribute('aria-modal', 'false');

        // Calculate position to prevent overlap
        const position = this.calculateWindowPosition();
        windowDiv.style.top = position.top + 'px';
        windowDiv.style.left = position.left + 'px';

        // Get content from template
        let content = '';
        const template = Utils.qs(`#${appType}-content`);
        if (template) {
            if (template.content) {
                // It's a <template> element
                const clone = template.content.cloneNode(true);
                const div = document.createElement('div');
                div.appendChild(clone);
                content = div.innerHTML;
            } else {
                // Fallback for older browser or div
                content = template.innerHTML;
            }
        }

        // Build window HTML
        const titleText = appType.replace(/-/g, ' ');
        windowDiv.innerHTML = `
            <div class="window-titlebar">
                <span id="window-title-${this.windowCount}">${titleText}</span>
                <button class="close-btn" aria-label="Close ${titleText}">×</button>
            </div>
            <div class="window-content">${content}</div>
        `;

        windowsContainer.appendChild(windowDiv);
        if (appType === 'photo-memory') {
            PhotoMemory.init(windowDiv);
        } else if (appType === 'inspiration') {
            const inspirationContainer = windowDiv.querySelector('.app-inspiration');
            if (inspirationContainer) {
                RotatingInspiration.init(inspirationContainer);
            }
        } else if (appType === 'open-when') {
            const lettersGrid = windowDiv.querySelector('.letters-grid');
            const letterDisplay = windowDiv.querySelector('#letter-display');
            const envelopes = windowDiv.querySelectorAll('.letter-envelope');

            envelopes.forEach(envelope => {
                envelope.addEventListener('click', () => {
                    const letterKey = envelope.dataset.letter;
                    const letter = openWhenLetters[letterKey];
                    if (letter) {
                        letterDisplay.innerHTML = `
                            <h4>${letter.title}</h4>
                            <p>${letter.content}</p>
                            <button class="letter-close-btn">Back to Letters</button>
                        `;
                        lettersGrid.style.display = 'none';
                        letterDisplay.style.display = 'block';

                        const closeBtn = letterDisplay.querySelector('.letter-close-btn');
                        closeBtn.addEventListener('click', () => {
                            lettersGrid.style.display = 'grid';
                            letterDisplay.style.display = 'none';
                        });
                    }
                });
            });
        } else if (appType === 'awesome-reasons') {
            const shuffleBtn = windowDiv.querySelector('.shuffle-reasons-btn');
            const reasonsContainer = windowDiv.querySelector('.reasons-container');
            const reasonDisplay = windowDiv.querySelector('.reason-display');
            if (shuffleBtn && reasonsContainer && reasonDisplay) {
                shuffleBtn.addEventListener('click', () => {
                    const reasons = Array.from(reasonsContainer.children);
                    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
                    reasonDisplay.innerHTML = randomReason.outerHTML;
                    shuffleBtn.textContent = 'Show Me Another 🎲';
                });
            }
        }

        this.openWindows.push(windowDiv);
        this.windowCount++;

        // Setup close button
        const closeBtn = Utils.qs('.close-btn', windowDiv);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeWindow(windowDiv);
            });
        }

        // Make window draggable
        this.makeWindowDraggable(windowDiv);

        // Focus the window
        windowDiv.focus();
    },

    /**
     * Calculate position for new window (prevents overlap)
     */
    calculateWindowPosition() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const windowWidth = 450;
        const windowHeight = 350;
        
        // Use cascade offset based on number of open windows
        const offset = (this.openWindows.length * CONFIG.WINDOW_OFFSET) % 200;
        
        let top = 50 + offset;
        let left = 50 + offset;
        
        // Ensure window stays within viewport
        const maxLeft = viewportWidth - windowWidth - 20;
        const maxTop = viewportHeight - windowHeight - CONFIG.TASKBAR_HEIGHT - 20;
        
        top = Math.min(top, Math.max(20, maxTop));
        left = Math.min(left, Math.max(20, maxLeft));
        
        return { top, left };
    },

    /**
     * Close a window
     */
    closeWindow(windowElement) {
        const index = this.openWindows.indexOf(windowElement);
        if (index > -1) {
            this.openWindows.splice(index, 1);
        }
        windowElement.remove();
    },

    /**
     * Make window draggable
     */
    makeWindowDraggable(windowElement) {
        const titleBar = Utils.qs('.window-titlebar', windowElement);
        if (!titleBar) return;

        let isDragging = false;
        let currentX, currentY, initialX, initialY;
        let xOffset = 0;
        let yOffset = 0;

        const dragStart = (e) => {
            // Don't drag if clicking close button
            if (e.target.classList.contains('close-btn')) return;

            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === titleBar || titleBar.contains(e.target)) {
                isDragging = true;
                titleBar.style.cursor = 'grabbing';
                windowElement.style.zIndex = '1001';
            }
        };

        const drag = (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            // Get window dimensions
            const windowRect = windowElement.getBoundingClientRect();
            const maxX = window.innerWidth - windowRect.width;
            const maxY = window.innerHeight - windowRect.height - CONFIG.TASKBAR_HEIGHT;

            // Constrain to viewport
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));

            // Use RAF for smooth animation
            requestAnimationFrame(() => {
                windowElement.style.left = currentX + 'px';
                windowElement.style.top = currentY + 'px';
            });
        };

        const dragEnd = () => {
            isDragging = false;
            titleBar.style.cursor = 'move';
        };

        titleBar.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        // Touch support
        titleBar.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            initialX = touch.clientX - xOffset;
            initialY = touch.clientY - yOffset;
            isDragging = true;
            titleBar.style.cursor = 'grabbing';
            windowElement.style.zIndex = '1001';
        }, { passive: true });

        titleBar.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];

            currentX = touch.clientX - initialX;
            currentY = touch.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            const windowRect = windowElement.getBoundingClientRect();
            const maxX = window.innerWidth - windowRect.width;
            const maxY = window.innerHeight - windowRect.height - CONFIG.TASKBAR_HEIGHT;

            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));

            windowElement.style.left = currentX + 'px';
            windowElement.style.top = currentY + 'px';
        }, { passive: true });

        titleBar.addEventListener('touchend', () => {
            isDragging = false;
            titleBar.style.cursor = 'move';
        });
    },

    /**
     * Initialize keyboard navigation
     */
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (LockScreen.isLocked) {
                return;
            }
            // ESC to close popups
            if (e.key === 'Escape') {
                const startMenu = Utils.qs('#start-menu-popup');
                const clockPopup = Utils.qs('#clock-popup');
                
                if (startMenu && !startMenu.classList.contains('start-menu-hidden')) {
                    startMenu.classList.add('start-menu-hidden');
                    Utils.qs('#start-menu')?.setAttribute('aria-expanded', 'false');
                }
                
                if (clockPopup && !clockPopup.classList.contains('clock-popup-hidden')) {
                    clockPopup.classList.add('clock-popup-hidden');
                    Utils.qs('#clock')?.setAttribute('aria-expanded', 'false');
                }

                // Close top-most window if any
                if (DesktopApp.openWindows.length) {
                    const topWin = DesktopApp.openWindows[DesktopApp.openWindows.length - 1];
                    DesktopApp.closeWindow(topWin);
                }
            }
        });
    },

    initSwitchToMobile() {
        const btn = Utils.qs('#switch-to-mobile');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const mobileView = Utils.qs('#mobile-view');
            const desktopView = Utils.qs('#desktop-view');
            if (mobileView) mobileView.style.display = 'block';
            if (desktopView) desktopView.style.display = 'none';
            // Initialize mobile if not already
            MobileApp.init();
        });
    },


};

// Mobile Application Logic
const MobileApp = {
    /**
     * Initialize mobile environment
     */
    init() {
        this.hideBootScreen();
        this.initClock();
        this.initGreeting();
        this.initQuickActions();
        this.initApps();
        this.initNavigation();
    },

    /**
     * Hide boot screen
     */
    hideBootScreen() {
        setTimeout(() => {
            const bootScreen = Utils.qs('#mobile-boot-screen');
            if (bootScreen) {
                bootScreen.style.display = 'none';
            }
        }, CONFIG.MOBILE_BOOT_DURATION);
    },

    /**
     * Initialize and update clock
     */
    initClock() {
        const updateClock = () => {
            const timeEl = Utils.qs('.mobile-time');
            if (!timeEl) return;

            const now = new Date();
            const time = Utils.formatTimeIST(now);
            
            timeEl.textContent = time + ' IST';
            timeEl.setAttribute('datetime', now.toISOString());
        };

        updateClock();
        setInterval(updateClock, CONFIG.CLOCK_UPDATE_INTERVAL);
    },

    /**
     * Initialize and update greeting
     */
    initGreeting() {
        const updateGreeting = () => {
            const now = new Date();
            const greeting = Utils.getGreeting('Sakshi');
            const date = now.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                timeZone: 'Asia/Kolkata'
            });

            const greetEl = Utils.qs('.mobile-greeting');
            const dateEl = Utils.qs('.mobile-date');

            if (greetEl) greetEl.textContent = greeting;
            if (dateEl) {
                dateEl.textContent = date;
                dateEl.setAttribute('datetime', now.toISOString());
            }
        };

        updateGreeting();
        setInterval(updateGreeting, CONFIG.GREETING_UPDATE_INTERVAL);
    },

    /**
     * Initialize quick action buttons
     */
    initQuickActions() {
        const loveBtn = Utils.qs('.mqa-love');
        const countdownBtn = Utils.qs('.mqa-countdown');
        const desktopBtn = Utils.qs('.mqa-desktop');

        if (loveBtn) {
            loveBtn.addEventListener('click', () => {
                this.triggerHeartsConfetti();
                this.vibrate(50);
                Utils.showToast('Happy Birthday, Sakshi! 💖');
            });
        }

        if (countdownBtn) {
            countdownBtn.addEventListener('click', () => {
                this.showCountdownWindow();
            });
        }

        if (desktopBtn) {
            desktopBtn.addEventListener('click', () => {
                this.switchToDesktop();
            });
        }
    },

    /**
     * Show countdown in mobile window
     */
    showCountdownWindow() {
        const container = Utils.qs('#mobile-windows-container');
        if (!container) return;

        const mw = document.createElement('div');
        mw.className = 'mobile-window';
        mw.setAttribute('role', 'dialog');
        mw.setAttribute('aria-labelledby', 'countdown-title');
        mw.setAttribute('aria-modal', 'true');

        mw.innerHTML = `
            <div class="mobile-window-header">
                <h2 id="countdown-title" class="mobile-window-title">Birthday Countdown</h2>
                <button class="mobile-close-btn" aria-label="Close countdown">×</button>
            </div>
            <div class="mobile-window-content">
                <div id="m-countdown" style="font-size:22px; text-align:center; padding:20px; color:#333; font-weight: 600;"></div>
            </div>
        `;

        container.appendChild(mw);

        const closeBtn = Utils.qs('.mobile-close-btn', mw);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.smoothCloseMobileWindow(mw));
        }

        this.attachSwipeToClose(mw);

        // Update countdown
        const updateMCountdown = () => {
            const { days, hours, mins } = Utils.getDaysUntilBirthday();
            const el = Utils.qs('#m-countdown', mw);
            if (el) {
                el.textContent = `${days}d ${Utils.padZero(hours)}h ${Utils.padZero(mins)}m`;
            }
        };

        updateMCountdown();
        const intervalId = setInterval(updateMCountdown, CONFIG.COUNTDOWN_UPDATE_INTERVAL);

        // Clear interval when window is removed
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node === mw) {
                        clearInterval(intervalId);
                        observer.disconnect();
                    }
                });
            });
        });
        observer.observe(container, { childList: true });
    },

    /**
     * Trigger hearts confetti animation
     */
    triggerHeartsConfetti() {
        const root = document.body;
        for (let i = 0; i < 14; i++) {
            const heart = document.createElement('div');
            heart.textContent = '💖';
            heart.style.cssText = `
                position: fixed;
                z-index: 9999;
                left: ${Math.random() * 100}vw;
                top: -5vh;
                font-size: ${18 + Math.random() * 12}px;
                opacity: 0.9;
                pointer-events: none;
                transition: transform 2.2s ease-in, opacity 2.2s ease-in;
            `;
            root.appendChild(heart);

            requestAnimationFrame(() => {
                heart.style.transform = `
                    translateY(${100 + Math.random() * 70}vh) 
                    translateX(${(Math.random() - 0.5) * 30}vw)
                `;
                heart.style.opacity = '0';
            });

            setTimeout(() => heart.remove(), 2400);
        }
    },

    /**
     * Vibrate device if supported
     */
    vibrate(duration) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    },

    /**
     * Attach swipe-to-close gesture
     */
    attachSwipeToClose(windowEl) {
        let startY = 0;
        let deltaY = 0;

        const touchStart = (e) => {
            startY = e.touches[0].clientY;
        };

        const touchMove = (e) => {
            deltaY = e.touches[0].clientY - startY;
            if (deltaY > 0) {
                windowEl.style.transform = `translateY(${Math.min(deltaY, 120)}px)`;
                windowEl.style.opacity = String(Math.max(0.4, 1 - deltaY / 300));
            }
        };

        const touchEnd = () => {
            if (deltaY > 120) {
                this.smoothCloseMobileWindow(windowEl);
            } else {
                windowEl.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
                windowEl.style.transform = 'translateY(0)';
                windowEl.style.opacity = '1';
                setTimeout(() => {
                    windowEl.style.transition = '';
                }, 220);
            }
            startY = 0;
            deltaY = 0;
        };

        windowEl.addEventListener('touchstart', touchStart, { passive: true });
        windowEl.addEventListener('touchmove', touchMove, { passive: true });
        windowEl.addEventListener('touchend', touchEnd);
    },

    /**
     * Smoothly close mobile window
     */
    smoothCloseMobileWindow(el) {
        el.style.animation = 'mobileWindowAppear 0.25s ease-in-out reverse';
        setTimeout(() => el.remove(), 240);
    },

    /**
     * Switch to desktop view on small screens
     */
    switchToDesktop() {
        const mobileView = Utils.qs('#mobile-view');
        const desktopView = Utils.qs('#desktop-view');
        if (mobileView) mobileView.style.display = 'none';
        if (desktopView) desktopView.style.display = 'block';
        if (!DesktopApp.initialized) {
            DesktopApp.init();
        }
    },

    /**
     * Initialize mobile apps
     */
    initApps() {
        const apps = Utils.qsAll('.mobile-app');
        apps.forEach(app => {
            app.addEventListener('click', () => {
                const appType = app.getAttribute('data-app');
                this.launchApp(appType);
            });

            // Touch feedback
            app.addEventListener('touchstart', () => {
                app.style.transform = 'scale(0.95)';
            });

            app.addEventListener('touchend', () => {
                app.style.transform = 'scale(1)';
            });
        });
    },

    /**
     * Launch mobile app
     */
    launchApp(appType) {
        if (!appType) return;

        const container = Utils.qs('#mobile-windows-container');
        if (!container) return;

        const mobileWindow = document.createElement('div');
        mobileWindow.className = 'mobile-window';
        mobileWindow.setAttribute('role', 'dialog');
        mobileWindow.setAttribute('aria-labelledby', `mobile-window-title-${appType}`);
        mobileWindow.setAttribute('aria-modal', 'true');

        // Get content from template
        let content = '';
        const template = Utils.qs(`#${appType}-content`);
        if (template) {
            if (template.content) {
                const clone = template.content.cloneNode(true);
                const div = document.createElement('div');
                div.appendChild(clone);
                content = div.innerHTML;
            } else {
                content = template.innerHTML;
            }
        }

        const titleText = appType.replace(/-/g, ' ');
        mobileWindow.innerHTML = `
            <div class="mobile-window-header">
                <h2 id="mobile-window-title-${appType}" class="mobile-window-title">${titleText}</h2>
                <button class="mobile-close-btn" aria-label="Close ${titleText}">×</button>
            </div>
            <div class="mobile-window-content">${content}</div>
        `;

        container.appendChild(mobileWindow);
        if (appType === 'photo-memory') {
            PhotoMemory.init(mobileWindow);
        } else if (appType === 'inspiration') {
            const inspirationContainer = mobileWindow.querySelector('.app-inspiration');
            if (inspirationContainer) {
                RotatingInspiration.init(inspirationContainer);
            }
        } else if (appType === 'open-when') {
            const lettersGrid = mobileWindow.querySelector('.letters-grid');
            const letterDisplay = mobileWindow.querySelector('#letter-display');
            const envelopes = mobileWindow.querySelectorAll('.letter-envelope');

            envelopes.forEach(envelope => {
                envelope.addEventListener('click', () => {
                    const letterKey = envelope.dataset.letter;
                    const letter = openWhenLetters[letterKey];
                    if (letter) {
                        letterDisplay.innerHTML = `
                            <h4>${letter.title}</h4>
                            <p>${letter.content}</p>
                            <button class="letter-close-btn">Back to Letters</button>
                        `;
                        lettersGrid.style.display = 'none';
                        letterDisplay.style.display = 'block';

                        const closeBtn = letterDisplay.querySelector('.letter-close-btn');
                        closeBtn.addEventListener('click', () => {
                            lettersGrid.style.display = 'grid';
                            letterDisplay.style.display = 'none';
                        });
                    }
                });
            });
        } else if (appType === 'awesome-reasons') {
            const shuffleBtn = mobileWindow.querySelector('.shuffle-reasons-btn');
            const reasonsContainer = mobileWindow.querySelector('.reasons-container');
            const reasonDisplay = mobileWindow.querySelector('.reason-display');
            if (shuffleBtn && reasonsContainer && reasonDisplay) {
                shuffleBtn.addEventListener('click', () => {
                    const reasons = Array.from(reasonsContainer.children);
                    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
                    reasonDisplay.innerHTML = randomReason.outerHTML;
                    shuffleBtn.textContent = 'Show Me Another 🎲';
                });
            }
        }

        const closeBtn = Utils.qs('.mobile-close-btn', mobileWindow);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.smoothCloseMobileWindow(mobileWindow);
            });
        }

        this.attachSwipeToClose(mobileWindow);
    },

    /**
     * Initialize bottom navigation
     */
    initNavigation() {
        const navItems = Utils.qsAll('.mobile-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                this.vibrate(50);
            });
        });
    }
};

function shuffleReasons() {
    const reasonsContainer = document.querySelector('.reasons-container');
    if (reasonsContainer) {
        const reasons = Array.from(reasonsContainer.children);
        for (let i = reasons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            reasonsContainer.appendChild(reasons[j]);
        }
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;

    // Initialize and show lock screen immediately
    LockScreen.init();
    LockScreen.lock();

    if (isMobile) {
        MobileApp.init();
    } else {
        DesktopApp.init();
    }

    // Handle window resize with debounce
    const handleResize = Utils.debounce(() => {
        const nowMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
        if (nowMobile !== isMobile) {
            // Reload page on orientation/size change that crosses breakpoint
            location.reload();
        }
    }, 250);

    window.addEventListener('resize', handleResize);
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('Sakshi OS Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});
