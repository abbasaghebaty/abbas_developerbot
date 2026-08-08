(function () {
    /* ==========================================================================
       تنظیمات قابل‌ویرایش سریع
       ========================================================================== */
    const STORAGE_KEY_SHORTCUTS = 'shomashop-caption-shortcuts';
    const STORAGE_KEY_THEME = 'caption-theme';

    const PLATFORM_LINKS = {
        eitaa: 'https://eitaa.com/shoma_shop/12',
        rubika: 'https://rubika.ir/shoma_shop/BHBJBCCDHAJFJFHJ'
    };

    /* ==================== DOM Elements ==================== */
    const productNameEl = document.getElementById('productName');
    const priceEl = document.getElementById('price');
    const discountPriceEl = document.getElementById('discountPrice');
    const weightEl = document.getElementById('weight');
    const quantityEl = document.getElementById('quantity');
    const scentEl = document.getElementById('scent');
    const customTitleEl = document.getElementById('customTitle');
    const customValueEl = document.getElementById('customValue');
    const nameLengthError = document.getElementById('nameLengthError');
    const priceError = document.getElementById('priceError');
    const discountError = document.getElementById('discountError');
    const discountCompareError = document.getElementById('discountCompareError');
    const platformButtons = document.querySelectorAll('.platform-btn');
    const previewOutput = document.getElementById('previewOutput');
    const copyBtn = document.getElementById('copyBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const copyFeedback = document.getElementById('copyFeedback');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');
    const allClearButtons = document.querySelectorAll('.clear-field-btn');

    const shortcutsToggle = document.getElementById('shortcutsToggle');
    const shortcutsOverlay = document.getElementById('shortcutsOverlay');
    const shortcutsClose = document.getElementById('shortcutsClose');
    const shortcutsList = document.getElementById('shortcutsList');
    const addShortcutBtn = document.getElementById('addShortcutBtn');
    const saveShortcutsBtn = document.getElementById('saveShortcutsBtn');
    const resetShortcutsBtn = document.getElementById('resetShortcutsBtn');
    const shortcutsFeedback = document.getElementById('shortcutsFeedback');

    let selectedPlatform = 'eitaa';
    let activeShortcuts = loadShortcuts();

    /* ==========================================================================
       مدیریت ذخیره‌سازی شورت‌کات‌ها
       ========================================================================== */
    function loadShortcuts() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_SHORTCUTS);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) { /* دیتای خراب -> برگرد به پیش‌فرض */ }
        return JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
    }

    function persistShortcuts(list) {
        localStorage.setItem(STORAGE_KEY_SHORTCUTS, JSON.stringify(list));
    }

    /* ==========================================================================
       Helper Functions
       ========================================================================== */
    const toEnglishDigits = (str) => str.replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728));
    const toPersianDigits = (str) => str.replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + 1728));

    // نرمال‌سازی فاصله‌ها (شامل حذف نیم‌فاصله‌ها)
    function normalizeText(str) {
        return str.replace(/\u200C/g, ' ').trim().replace(/\s+/g, ' ');
    }

    // حذف کلمات تکراری پشت سر هم
    function removeDuplicateWords(str) {
        const words = str.split(' ');
        const result = [];
        for (const word of words) {
            if (result.length === 0 || word !== result[result.length - 1]) {
                result.push(word);
            }
        }
        return result.join(' ');
    }

    /**
     * چک می‌کنه که آیا "name" با "prefix" مچ میشه یا نه.
     *
     * رفع باگ: قبلا فقط با startsWith چک می‌شد، برای همین "دستمال" چون با
     * "دست" شروع می‌شد اشتباهی افتاد توی قانون "دست" و نتیجه غلط می‌داد.
     * الان دو حالت داریم:
     *   - exact = true  -> باید *دقیقا* برابر prefix باشه.
     *   - exact = false -> باید با prefix شروع بشه و بلافاصله بعدش یا فاصله
     *                      باشه یا نام تموم بشه (یعنی مرز کلمه رعایت بشه).
     */
    function matchesPrefix(name, prefix, exact) {
        if (exact) {
            return name === prefix;
        }
        if (!name.startsWith(prefix)) return false;
        const nextChar = name.charAt(prefix.length);
        return nextChar === '' || nextChar === ' ';
    }

    // اعمال شورت‌کات‌های نام محصول
    function transformProductName(name, shortcuts) {
        if (!name) return name;

        for (const rule of shortcuts) {
            for (const prefix of rule.prefixes) {
                if (matchesPrefix(name, prefix, rule.exact)) {
                    let rest = name.slice(prefix.length).trim();

                    // اگه بقیه‌ی نام هم با یکی دیگه از prefixes همین قانون شروع میشد حذفش کن
                    // (مثلا "مایع ظرفشویی ظرف لیمویی" -> بعد از حذف "مایع ظرفشویی" دوباره چک "ظرف")
                    if (!rule.exact) {
                        let changed = true;
                        while (changed && rest.length > 0) {
                            changed = false;
                            for (const p of rule.prefixes) {
                                if (matchesPrefix(rest, p, false)) {
                                    rest = rest.slice(p.length).trim();
                                    changed = true;
                                    break;
                                }
                            }
                        }
                    }

                    const repl = String(rule.replacement).replace(/\{prefix\}/g, prefix);
                    return rest ? `${repl} ${rest}` : repl;
                }
            }
        }

        return name;
    }

    /* ==========================================================================
       خطاها و ساخت کپشن
       ========================================================================== */
    function updateErrorDisplays() {
        const rawName = normalizeText(productNameEl.value);
        const transformed = transformProductName(rawName, activeShortcuts);
        const deduped = removeDuplicateWords(transformed);
        nameLengthError.classList.toggle('visible', rawName && deduped.length > 40);

        const priceVal = priceEl.value.trim();
        priceError.classList.toggle('visible', priceVal && !/^[0-9۰-۹]+$/.test(priceVal));

        const discountVal = discountPriceEl.value.trim();
        discountError.classList.toggle('visible', discountVal && !/^[0-9۰-۹]+$/.test(discountVal));
        discountCompareError.classList.remove('visible');
        if (discountVal && /^[0-9۰-۹]+$/.test(discountVal) && priceVal && /^[0-9۰-۹]+$/.test(priceVal)) {
            const p = parseInt(toEnglishDigits(priceVal), 10);
            const d = parseInt(toEnglishDigits(discountVal), 10);
            if (d >= p) discountCompareError.classList.add('visible');
        }
    }

    function buildCaption() {
        const rawName = normalizeText(productNameEl.value);
        const transformed = transformProductName(rawName, activeShortcuts);
        const name = removeDuplicateWords(transformed);

        const priceVal = priceEl.value.trim();
        const discountVal = discountPriceEl.value.trim();
        const weightVal = normalizeText(weightEl.value);
        const quantityVal = normalizeText(quantityEl.value);
        const scentVal = normalizeText(scentEl.value);
        const customTitle = normalizeText(customTitleEl.value);
        const customValue = normalizeText(customValueEl.value);

        const lines = [];

        if (rawName) lines.push(name);
        if (priceVal) {
            const displayPrice = /^[0-9۰-۹]+$/.test(priceVal) ? toEnglishDigits(priceVal) : priceVal;
            lines.push(`قیمت : ${displayPrice}`);
        }
        if (discountVal && /^[0-9۰-۹]+$/.test(discountVal)) {
            if (priceVal && /^[0-9۰-۹]+$/.test(priceVal)) {
                const p = parseInt(toEnglishDigits(priceVal), 10);
                const d = parseInt(toEnglishDigits(discountVal), 10);
                if (d < p) lines.push(`با #تخفیف : ${toEnglishDigits(discountVal)}`);
            }
        }
        if (weightVal) lines.push(`وزن : ${toPersianDigits(weightVal)}`);
        if (quantityVal) lines.push(`تعداد: ${quantityVal}`);
        if (scentVal) lines.push(`رایحه : ${scentVal}`);
        if (customTitle && customValue) lines.push(`${customTitle}: ${customValue}`);

        lines.push('');
        lines.push('🛒 جهت خرید :');
        lines.push(PLATFORM_LINKS[selectedPlatform]);
        lines.push('');
        lines.push('شوینده بهداشتی شما\n@Shoma_shop');

        return lines.join('\n');
    }

    function updatePreview() {
        if (document.activeElement === previewOutput) return;
        updateErrorDisplays();
        previewOutput.textContent = buildCaption();
    }

    function updateClearButtons() {
        const fieldMap = {
            productName: productNameEl,
            price: priceEl,
            discountPrice: discountPriceEl,
            weight: weightEl,
            quantity: quantityEl,
            scent: scentEl,
            customTitle: customTitleEl,
            customValue: customValueEl
        };
        allClearButtons.forEach(btn => {
            const targetId = btn.dataset.target;
            const input = fieldMap[targetId];
            if (input && input.value.trim().length > 0) {
                btn.parentElement.classList.add('has-value');
            } else {
                btn.parentElement.classList.remove('has-value');
            }
        });
    }

    async function copyCaption() {
        const text = previewOutput.textContent || '';
        if (!text.trim()) {
            alert('⚠️ پیش‌نمایشی برای کپی وجود ندارد.');
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            showCopyFeedback();
        } catch (err) {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showCopyFeedback(); } catch (e) { alert('❌ کپی ناموفق'); }
        document.body.removeChild(ta);
    }

    function showCopyFeedback() {
        copyFeedback.classList.add('show');
        clearTimeout(window._copyTimer);
        window._copyTimer = setTimeout(() => copyFeedback.classList.remove('show'), 2000);
    }

    function clearAllFields() {
        productNameEl.value = '';
        priceEl.value = '';
        discountPriceEl.value = '';
        weightEl.value = '';
        quantityEl.value = '';
        scentEl.value = '';
        customTitleEl.value = '';
        customValueEl.value = '';
        nameLengthError.classList.remove('visible');
        priceError.classList.remove('visible');
        discountError.classList.remove('visible');
        discountCompareError.classList.remove('visible');
        platformButtons.forEach(b => b.classList.remove('active'));
        document.querySelector('.platform-btn[data-platform="eitaa"]').classList.add('active');
        selectedPlatform = 'eitaa';
        updateClearButtons();
        updatePreview();
        productNameEl.focus();
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            themeIcon.textContent = '☀️';
            themeLabel.textContent = 'روشن';
        } else {
            document.body.classList.remove('light-mode');
            themeIcon.textContent = '🌙';
            themeLabel.textContent = 'تاریک';
        }
        localStorage.setItem(STORAGE_KEY_THEME, theme);
    }

    function toggleTheme() {
        applyTheme(document.body.classList.contains('light-mode') ? 'dark' : 'light');
    }

    /* ==========================================================================
       پنل مدیریت شورت‌کات‌ها
       ========================================================================== */
    function createShortcutRow(rule) {
        const row = document.createElement('div');
        row.className = 'shortcut-row';

        row.innerHTML = `
            <div class="row-line">
                <label class="field-label">کلمه‌ها</label>
                <input type="text" class="rule-prefixes" placeholder="مثال: دست" value="${escapeHtml((rule.prefixes || []).join('، '))}">
            </div>
            <div class="row-line">
                <label class="field-label">جایگزین</label>
                <input type="text" class="rule-replacement" placeholder="مثال: مایع دستشویی" value="${escapeHtml(rule.replacement || '')}">
            </div>
            <div class="row-footer">
                <label class="exact-toggle">
                    <input type="checkbox" class="rule-exact" ${rule.exact ? 'checked' : ''}>
                    تطبیق دقیق (کل نام باید برابر باشه)
                </label>
                <button type="button" class="delete-row-btn">🗑️ حذف</button>
            </div>
        `;

        row.querySelector('.delete-row-btn').addEventListener('click', () => row.remove());

        return row;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function renderShortcutsList(shortcuts) {
        shortcutsList.innerHTML = '';
        shortcuts.forEach(rule => {
            shortcutsList.appendChild(createShortcutRow(rule));
        });
    }

    function collectShortcutsFromDOM() {
        const rows = shortcutsList.querySelectorAll('.shortcut-row');
        const result = [];
        rows.forEach(row => {
            const prefixesRaw = row.querySelector('.rule-prefixes').value;
            const replacement = row.querySelector('.rule-replacement').value.trim();
            const exact = row.querySelector('.rule-exact').checked;

            const prefixes = prefixesRaw
                .split(/[،,]/)
                .map(s => normalizeText(s))
                .filter(Boolean);

            if (prefixes.length && replacement) {
                result.push({ prefixes, replacement, exact });
            }
        });
        return result;
    }

    function openShortcutsPanel() {
        renderShortcutsList(activeShortcuts);
        shortcutsOverlay.classList.add('open');
    }

    function closeShortcutsPanel() {
        shortcutsOverlay.classList.remove('open');
    }

    function showShortcutsFeedback() {
        shortcutsFeedback.classList.add('show');
        clearTimeout(window._shortcutsFeedbackTimer);
        window._shortcutsFeedbackTimer = setTimeout(() => shortcutsFeedback.classList.remove('show'), 2000);
    }

    /* ==================== Event Listeners ==================== */
    platformButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            platformButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPlatform = btn.dataset.platform;
            updatePreview();
        });
    });

    const allInputs = [productNameEl, priceEl, discountPriceEl, weightEl, quantityEl, scentEl, customTitleEl, customValueEl];
    allInputs.forEach(input => {
        input.addEventListener('input', () => {
            updateClearButtons();
            updatePreview();
        });
        input.addEventListener('paste', () => setTimeout(() => {
            updateClearButtons();
            updatePreview();
        }, 30));
    });

    allClearButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.target;
            const input = document.getElementById(targetId);
            if (input) {
                input.value = '';
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.focus();
            }
        });
    });

    copyBtn.addEventListener('click', copyCaption);
    clearFormBtn.addEventListener('click', clearAllFields);
    themeToggle.addEventListener('click', toggleTheme);

    shortcutsToggle.addEventListener('click', openShortcutsPanel);
    shortcutsClose.addEventListener('click', closeShortcutsPanel);
    shortcutsOverlay.addEventListener('click', (e) => {
        if (e.target === shortcutsOverlay) closeShortcutsPanel();
    });

    addShortcutBtn.addEventListener('click', () => {
        shortcutsList.appendChild(createShortcutRow({ prefixes: [], replacement: '', exact: false }));
        shortcutsList.scrollTop = shortcutsList.scrollHeight;
    });

    saveShortcutsBtn.addEventListener('click', () => {
        activeShortcuts = collectShortcutsFromDOM();
        persistShortcuts(activeShortcuts);
        updatePreview();
        showShortcutsFeedback();
    });

    resetShortcutsBtn.addEventListener('click', () => {
        activeShortcuts = JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
        persistShortcuts(activeShortcuts);
        renderShortcutsList(activeShortcuts);
        updatePreview();
        showShortcutsFeedback();
    });

    // Init
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
    applyTheme(savedTheme);
    updateClearButtons();
    updatePreview();
    productNameEl.focus();
})();
