import { HDate, HebrewCalendar, ParshaEvent, Locale } from '@hebcal/core';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const PARSHA_BOOK = {
  Bereshit:'Genesis',Noach:'Genesis','Lech-Lecha':'Genesis',Vayera:'Genesis',
  'Chayei Sara':'Genesis',Toldot:'Genesis',Vayetzei:'Genesis',Vayishlach:'Genesis',
  Vayeshev:'Genesis',Miketz:'Genesis',Vayigash:'Genesis',Vayechi:'Genesis',
  Shemot:'Exodus',Vaera:'Exodus',Bo:'Exodus',Beshalach:'Exodus',
  Yitro:'Exodus',Mishpatim:'Exodus',Terumah:'Exodus',Tetzaveh:'Exodus',
  'Ki Tisa':'Exodus',Vayakhel:'Exodus',Pekudei:'Exodus',
  Vayikra:'Leviticus',Tzav:'Leviticus',Shmini:'Leviticus',Tazria:'Leviticus',
  Metzora:'Leviticus','Achrei Mot':'Leviticus',Kedoshim:'Leviticus',
  Emor:'Leviticus',Behar:'Leviticus',Bechukotai:'Leviticus',
  Bamidbar:'Numbers',Nasso:'Numbers',"Beha'alotcha":'Numbers',"Sh'lach":'Numbers',
  Korach:'Numbers',Chukat:'Numbers',Balak:'Numbers',Pinchas:'Numbers',
  Matot:'Numbers',Masei:'Numbers',
  Devarim:'Deuteronomy',Vaetchanan:'Deuteronomy',Eikev:'Deuteronomy',
  "Re'eh":'Deuteronomy',Shoftim:'Deuteronomy','Ki Teitzei':'Deuteronomy',
  'Ki Tavo':'Deuteronomy',Nitzavim:'Deuteronomy',Vayeilech:'Deuteronomy',
  "Ha'Azinu":'Deuteronomy','Vezot HaBerakhah':'Deuteronomy',
};

/** The date currently displayed in the Info_Display. Updated only on successful render. */
let currentDisplayDate = null;

/** Module-level reference to the date picker instance (created once, reused). */
let datePicker = null;

/**
 * Returns true if the currently displayed date is the same calendar day as today.
 */
function isShowingToday() {
  if (!currentDisplayDate) return false;
  const now = new Date();
  return currentDisplayDate.getFullYear() === now.getFullYear()
      && currentDisplayDate.getMonth() === now.getMonth()
      && currentDisplayDate.getDate() === now.getDate();
}

function getBook(parshaNames) {
  for (const n of parshaNames) {
    if (PARSHA_BOOK[n]) return PARSHA_BOOK[n];
  }
  return '';
}

/**
 * Returns true if the input string represents an integer in [1, 9999].
 * @param {string} value - User input string
 * @returns {boolean}
 */
function isValidYear(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (value !== value.trim()) return false;
  const n = Number(value);
  if (!Number.isInteger(n)) return false;
  return n >= 1 && n <= 9999;
}

/**
 * Returns the number of days in a given Gregorian month/year.
 * @param {number} year - Gregorian year (1–9999)
 * @param {number} month - 0-indexed month (0=January, 11=December)
 * @returns {number} Days in that month (28–31)
 */
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Clamps a day value to the valid range for the given month/year.
 * @param {number} year - Gregorian year (1–9999)
 * @param {number} month - 0-indexed month
 * @param {number} day - 1-indexed day (may exceed valid range)
 * @returns {number} Clamped day in [1, daysInMonth(year, month)]
 */
function clampDay(year, month, day) {
  return Math.min(day, daysInMonth(year, month));
}

function spawnStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 200; i++) {
    const el = document.createElement('div');
    el.className = 'star';
    const size = Math.random() * 2.8 + 0.4;
    el.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `top:${(Math.random() * 100).toFixed(2)}%`,
      `left:${(Math.random() * 100).toFixed(2)}%`,
      `--dur:${(Math.random() * 4 + 2).toFixed(1)}s`,
      `--op:${(Math.random() * 0.55 + 0.1).toFixed(2)}`,
    ].join(';');
    container.appendChild(el);
  }
}

function getGregorianString(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

/**
 * Creates a date picker component attached to the given trigger element.
 * Returns an object with { open(), close(), isOpen(), getElement(), setTrigger() } interface.
 * The picker element is a dialog overlay with year, month, and day controls.
 * @param {HTMLElement} triggerEl - The trigger button element
 * @returns {{ open: () => void, close: () => void, isOpen: () => boolean, getElement: () => HTMLElement }}
 */
function createDatePicker(triggerEl) {
  let _isOpen = false;
  let _triggerEl = triggerEl;
  /** Stores the last valid year value so we can revert on invalid input */
  let _lastValidYear = (currentDisplayDate || new Date()).getFullYear();

  // Create the picker container
  const picker = document.createElement('div');
  picker.className = 'date-picker';
  picker.setAttribute('role', 'dialog');
  picker.setAttribute('aria-label', 'Date picker');
  picker.style.display = 'none';

  // Year input
  const yearLabel = document.createElement('label');
  yearLabel.textContent = 'Year';
  const yearInput = document.createElement('input');
  yearInput.type = 'text';
  yearInput.className = 'dp-year';
  yearInput.setAttribute('inputmode', 'numeric');
  yearInput.setAttribute('aria-label', 'Year');
  yearLabel.appendChild(yearInput);

  // Month select
  const monthLabel = document.createElement('label');
  monthLabel.textContent = 'Month';
  const monthSelect = document.createElement('select');
  monthSelect.className = 'dp-month';
  monthSelect.setAttribute('aria-label', 'Month');
  MONTH_NAMES.forEach((name, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = name;
    monthSelect.appendChild(opt);
  });
  monthLabel.appendChild(monthSelect);

  // Day select
  const dayLabel = document.createElement('label');
  dayLabel.textContent = 'Day';
  const daySelect = document.createElement('select');
  daySelect.className = 'dp-day';
  daySelect.setAttribute('aria-label', 'Day');
  dayLabel.appendChild(daySelect);

  picker.appendChild(yearLabel);
  picker.appendChild(monthLabel);
  picker.appendChild(dayLabel);

  /**
   * Rebuilds the day select options based on current year/month values.
   */
  function updateDayOptions() {
    const year = parseInt(yearInput.value, 10);
    const month = parseInt(monthSelect.value, 10);
    if (!isValidYear(String(year))) return;

    const maxDay = daysInMonth(year, month);
    const currentDay = parseInt(daySelect.value, 10) || 1;
    const newDay = clampDay(year, month, currentDay);

    // Rebuild options
    daySelect.innerHTML = '';
    for (let d = 1; d <= maxDay; d++) {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      daySelect.appendChild(opt);
    }
    daySelect.value = newDay;
  }

  /**
   * Attempts to render the currently selected date if all fields are valid.
   */
  function tryRenderSelected() {
    const yearStr = yearInput.value;
    if (!isValidYear(yearStr)) return;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthSelect.value, 10);
    const day = parseInt(daySelect.value, 10);
    if (!day || day < 1) return;
    renderDate(new Date(year, month, day));
  }

  /**
   * Validates year input. If invalid, reverts to previous valid value.
   * If valid, updates day options, stores valid year, and triggers render.
   */
  function handleYearChange() {
    const yearStr = yearInput.value.trim();
    if (!isValidYear(yearStr)) {
      // Revert to last valid year
      yearInput.value = _lastValidYear;
      return;
    }
    _lastValidYear = parseInt(yearStr, 10);
    yearInput.value = _lastValidYear; // normalize (remove leading zeros/whitespace)
    updateDayOptions();
    tryRenderSelected();
  }

  /**
   * Initializes the picker controls from currentDisplayDate.
   */
  function initFromCurrentDate() {
    const d = currentDisplayDate || new Date();
    _lastValidYear = d.getFullYear();
    yearInput.value = d.getFullYear();
    monthSelect.value = d.getMonth();
    updateDayOptions();
    daySelect.value = d.getDate();
  }

  // ── Event listeners for live date rendering ──

  // Year: validate on change and blur
  yearInput.addEventListener('change', handleYearChange);
  yearInput.addEventListener('blur', handleYearChange);

  // Month: rebuild days and render
  monthSelect.addEventListener('change', () => {
    updateDayOptions();
    tryRenderSelected();
  });

  // Day: render on change
  daySelect.addEventListener('change', () => {
    tryRenderSelected();
  });

  // ── Outside-click handling ──
  document.addEventListener('mousedown', (e) => {
    if (!_isOpen) return;
    // If the click is inside the picker or on the trigger button, do nothing
    if (picker.contains(e.target)) return;
    if (_triggerEl && _triggerEl.contains(e.target)) return;
    close();
  });

  // ── Keyboard handling: Escape closes picker, Tab traps focus within picker ──
  picker.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      if (_triggerEl) _triggerEl.focus();
      return;
    }

    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === yearInput) {
        // Shift+Tab on first element: wrap to last
        e.preventDefault();
        daySelect.focus();
      } else if (!e.shiftKey && document.activeElement === daySelect) {
        // Tab on last element: wrap to first
        e.preventDefault();
        yearInput.focus();
      }
    }
  });

  function open() {
    if (_isOpen) return;
    _isOpen = true;
    initFromCurrentDate();
    picker.style.display = '';
    if (_triggerEl) _triggerEl.setAttribute('aria-expanded', 'true');
    // Move focus to year input (first interactive element) when picker opens
    yearInput.focus();
  }

  function close() {
    if (!_isOpen) return;
    _isOpen = false;
    picker.style.display = 'none';
    if (_triggerEl) _triggerEl.setAttribute('aria-expanded', 'false');
  }

  return {
    open,
    close,
    isOpen() { return _isOpen; },
    getElement() { return picker; },
    setTrigger(el) { _triggerEl = el; },
  };
}

/**
 * Wires the Go to Date trigger button (re-rendered each time via innerHTML)
 * to the persistent date picker instance. Creates the picker on first call.
 * Also wires the Today button if present.
 */
function wireGoToDateTrigger() {
  const triggerBtn = document.querySelector('.go-to-date-btn');
  if (!triggerBtn) return;

  // Create the picker once, append it to the card (persists across re-renders)
  if (!datePicker) {
    datePicker = createDatePicker(triggerBtn);
  } else {
    // Update the trigger reference since the button was re-created via innerHTML
    datePicker.setTrigger(triggerBtn);
  }

  // Ensure the picker element is in the DOM (re-attach if card was re-rendered)
  const card = document.querySelector('.card');
  if (card && !card.contains(datePicker.getElement())) {
    card.appendChild(datePicker.getElement());
  }

  // Sync aria-expanded state with current picker state
  triggerBtn.setAttribute('aria-expanded', datePicker.isOpen() ? 'true' : 'false');

  // Attach click handler to toggle picker open/close
  triggerBtn.addEventListener('click', () => {
    if (datePicker.isOpen()) {
      datePicker.close();
    } else {
      datePicker.open();
    }
  });

  // Wire Today button (appears only when not showing today)
  const todayBtn = document.querySelector('.today-btn');
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      renderDate(new Date());
    });
  }
}

/**
 * Renders Hebrew date, parsha, and holiday information for the given Gregorian date.
 * Updates #main innerHTML and sets currentDisplayDate on success.
 * @param {Date} gregDate - The Gregorian date to render
 */
function renderDate(gregDate) {
  try {
    const hd = new HDate(gregDate);
    const end = new HDate(new Date(gregDate.getTime() + 10 * 86400000));

    const events = HebrewCalendar.calendar({
      start: hd,
      end,
      sedrot: true,
      il: true,
    });

    const parshaEvent = events.find(e => e instanceof ParshaEvent);
    const holidays = events.filter(e => !(e instanceof ParshaEvent) && e.getDate().isSameDate(hd));

    // Hebrew date display
    const gematriya = hd.renderGematriya();
    const dateEn = hd.render('en');

    // Parsha
    let parshaHTML = '';
    if (parshaEvent) {
      const nameEn = parshaEvent.render('en');
      const nameHe = parshaEvent.render('he');
      const book = getBook(parshaEvent.parsha);
      parshaHTML = `
        <div class="divider"><span aria-hidden="true">✦</span></div>
        <p class="label">Weekly Torah Portion</p>
        <h2 class="parsha-en">${nameEn}</h2>
        <p class="parsha-he" lang="he" dir="rtl">${nameHe}</p>
        ${book ? `<p class="book">${book}</p>` : ''}
      `;
    }

    // Holidays
    let holidayHTML = '';
    if (holidays.length) {
      const tags = holidays.map(h => `<span class="tag">${h.render('en')}</span>`).join('');
      holidayHTML = `<div class="holidays">${tags}</div>`;
    }

    // Remove loader if still present (first render)
    const loader = document.getElementById('loader');
    if (loader) loader.remove();

    // Update module state only on success (before building HTML so isShowingToday() is accurate)
    currentDisplayDate = gregDate;

    // Build Today button HTML — only show when not displaying today's date
    const todayBtnHTML = isShowingToday()
      ? ''
      : `<button class="today-btn">Today</button>`;

    document.getElementById('main').innerHTML = `
      <span class="magen" aria-label="Star of David">✡</span>
      <p class="label">Today's Hebrew Date</p>
      <h1 class="date-en">${dateEn}</h1>
      <p class="date-he" lang="he" dir="rtl">${gematriya}</p>
      <p class="date-greg">${getGregorianString(gregDate)}</p>
      ${holidayHTML}
      <button class="go-to-date-btn" aria-expanded="false" aria-haspopup="dialog">Go to date</button>
      ${todayBtnHTML}
      ${parshaHTML}
      <p class="footer">Powered by @hebcal/core</p>
    `;

    // Wire up the trigger button to the date picker
    wireGoToDateTrigger();
  } catch (err) {
    // Display error inline, retain previous currentDisplayDate
    const loader = document.getElementById('loader');
    if (loader) loader.remove();

    // Build Today button HTML — show in error state if we have a previous date that isn't today
    const errorTodayBtnHTML = (currentDisplayDate && !isShowingToday())
      ? `<button class="today-btn">Today</button>`
      : '';

    document.getElementById('main').innerHTML = `
      <div class="error-msg">
        <span class="magen" aria-hidden="true">✡</span>
        <p>This date is not supported for Hebrew calendar conversion.</p>
      </div>
      <button class="go-to-date-btn" aria-expanded="false" aria-haspopup="dialog">Go to date</button>
      ${errorTodayBtnHTML}
    `;

    // Wire up trigger and Today button so picker remains functional during error state
    wireGoToDateTrigger();
  }
}

function init() {
  spawnStars();
  renderDate(new Date());
}

init();

export { renderDate, isShowingToday, currentDisplayDate, isValidYear, daysInMonth, clampDay, createDatePicker };
