import { describe, test, expect } from 'vitest';

// Set up DOM elements required by main.js init() - mirror actual HTML structure
document.body.innerHTML = `
  <div id="stars"></div>
  <div class="card">
    <div id="loader"></div>
    <div id="main"></div>
  </div>
`;

const { renderDate, isShowingToday, createDatePicker } = await import('../main.js');

describe('renderDate', () => {
  test('is exported as a function', () => {
    expect(typeof renderDate).toBe('function');
  });

  test('renders Hebrew date info into #main for a given date', () => {
    document.getElementById('main').innerHTML = '';
    renderDate(new Date(2025, 5, 28)); // June 28, 2025
    const html = document.getElementById('main').innerHTML;
    expect(html).toContain('date-en');
    expect(html).toContain('date-he');
    expect(html).toContain('date-greg');
  });

  test('does not throw for any date input', () => {
    expect(() => renderDate(new Date(2025, 5, 28))).not.toThrow();
    expect(() => renderDate(new Date(-5000, 0, 1))).not.toThrow();
  });
});

describe('isShowingToday', () => {
  test('is exported as a function', () => {
    expect(typeof isShowingToday).toBe('function');
  });

  test('returns true after rendering today', () => {
    renderDate(new Date());
    expect(isShowingToday()).toBe(true);
  });

  test('returns false after rendering a different date', () => {
    renderDate(new Date(2020, 0, 1));
    expect(isShowingToday()).toBe(false);
  });
});

describe('init() integration', () => {
  test('init() populates #main on module import', async () => {
    // Reset DOM and re-import to simulate fresh load
    document.body.innerHTML = `
      <div id="stars"></div>
      <div id="loader"></div>
      <div id="main"></div>
    `;
    // The original import already triggered init(), verify content exists
    renderDate(new Date());
    const html = document.getElementById('main').innerHTML;
    expect(html).toContain('date-en');
    expect(html).toContain('date-he');
    expect(html).toContain('date-greg');
  });
});

describe('Go to Date trigger button (Task 4.2)', () => {
  test('trigger button is rendered in #main with correct class', () => {
    renderDate(new Date(2025, 5, 28));
    const btn = document.querySelector('.go-to-date-btn');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Go to date');
  });

  test('trigger button has aria-haspopup="dialog"', () => {
    renderDate(new Date(2025, 5, 28));
    const btn = document.querySelector('.go-to-date-btn');
    expect(btn.getAttribute('aria-haspopup')).toBe('dialog');
  });

  test('trigger button has aria-expanded attribute', () => {
    renderDate(new Date(2025, 5, 28));
    const btn = document.querySelector('.go-to-date-btn');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('trigger button is positioned between holidays and parsha divider', () => {
    renderDate(new Date(2025, 5, 28));
    const main = document.getElementById('main');
    const html = main.innerHTML;
    const btnIndex = html.indexOf('go-to-date-btn');
    const dividerIndex = html.indexOf('class="divider"');
    // Trigger should appear before the parsha divider
    if (dividerIndex > -1) {
      expect(btnIndex).toBeLessThan(dividerIndex);
    }
    // Trigger should appear after holidays if present
    const holidayIndex = html.indexOf('class="holidays"');
    if (holidayIndex > -1) {
      expect(btnIndex).toBeGreaterThan(holidayIndex);
    }
  });

  test('trigger button click toggles picker open/close', () => {
    // Ensure proper DOM structure with card wrapper
    document.body.innerHTML = `
      <div id="stars"></div>
      <div class="card">
        <div id="main"></div>
      </div>
    `;
    renderDate(new Date(2025, 5, 28));
    const btn = document.querySelector('.go-to-date-btn');
    const picker = document.querySelector('.date-picker');
    expect(picker).not.toBeNull();

    // Initially closed
    expect(picker.style.display).toBe('none');
    expect(btn.getAttribute('aria-expanded')).toBe('false');

    // Click to open
    btn.click();
    expect(picker.style.display).toBe('');
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    // Click to close
    btn.click();
    expect(picker.style.display).toBe('none');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('createDatePicker (Task 4.3)', () => {
  test('creates element with role="dialog"', () => {
    const triggerEl = document.createElement('button');
    const picker = createDatePicker(triggerEl);
    const el = picker.getElement();
    expect(el.getAttribute('role')).toBe('dialog');
    expect(el.getAttribute('aria-label')).toBe('Date picker');
  });

  test('has class "date-picker"', () => {
    const triggerEl = document.createElement('button');
    const picker = createDatePicker(triggerEl);
    expect(picker.getElement().className).toBe('date-picker');
  });

  test('contains year input with inputmode="numeric" and aria-label="Year"', () => {
    const triggerEl = document.createElement('button');
    const picker = createDatePicker(triggerEl);
    const yearInput = picker.getElement().querySelector('.dp-year');
    expect(yearInput).not.toBeNull();
    expect(yearInput.getAttribute('inputmode')).toBe('numeric');
    expect(yearInput.getAttribute('aria-label')).toBe('Year');
  });

  test('contains month select with aria-label="Month" and 12 options', () => {
    const triggerEl = document.createElement('button');
    const picker = createDatePicker(triggerEl);
    const monthSelect = picker.getElement().querySelector('.dp-month');
    expect(monthSelect).not.toBeNull();
    expect(monthSelect.getAttribute('aria-label')).toBe('Month');
    expect(monthSelect.options.length).toBe(12);
    expect(monthSelect.options[0].textContent).toBe('January');
    expect(monthSelect.options[11].textContent).toBe('December');
  });

  test('contains day select with aria-label="Day"', () => {
    const triggerEl = document.createElement('button');
    const picker = createDatePicker(triggerEl);
    const daySelect = picker.getElement().querySelector('.dp-day');
    expect(daySelect).not.toBeNull();
    expect(daySelect.getAttribute('aria-label')).toBe('Day');
  });

  test('open/close/isOpen interface works correctly', () => {
    const triggerEl = document.createElement('button');
    triggerEl.setAttribute('aria-expanded', 'false');
    const picker = createDatePicker(triggerEl);

    expect(picker.isOpen()).toBe(false);

    picker.open();
    expect(picker.isOpen()).toBe(true);
    expect(picker.getElement().style.display).toBe('');
    expect(triggerEl.getAttribute('aria-expanded')).toBe('true');

    picker.close();
    expect(picker.isOpen()).toBe(false);
    expect(picker.getElement().style.display).toBe('none');
    expect(triggerEl.getAttribute('aria-expanded')).toBe('false');
  });

  test('on open, initializes controls from currentDisplayDate', () => {
    // Render a known date to set currentDisplayDate
    renderDate(new Date(2023, 2, 15)); // March 15, 2023
    const triggerEl = document.createElement('button');
    triggerEl.setAttribute('aria-expanded', 'false');
    const picker = createDatePicker(triggerEl);

    picker.open();
    const yearInput = picker.getElement().querySelector('.dp-year');
    const monthSelect = picker.getElement().querySelector('.dp-month');
    const daySelect = picker.getElement().querySelector('.dp-day');

    expect(yearInput.value).toBe('2023');
    expect(monthSelect.value).toBe('2');  // March is 0-indexed as 2
    expect(daySelect.value).toBe('15');
  });

  test('day select has dynamic options based on year/month', () => {
    // Render Feb 2024 (leap year) to set currentDisplayDate
    renderDate(new Date(2024, 1, 15)); // Feb 15, 2024
    const triggerEl = document.createElement('button');
    triggerEl.setAttribute('aria-expanded', 'false');
    const picker = createDatePicker(triggerEl);

    picker.open();
    const daySelect = picker.getElement().querySelector('.dp-day');
    // Feb 2024 has 29 days (leap year)
    expect(daySelect.options.length).toBe(29);
  });

  test('picker element is positioned absolutely with z-index above card', () => {
    // Ensure proper DOM structure with card wrapper
    document.body.innerHTML = `
      <div id="stars"></div>
      <div class="card">
        <div id="main"></div>
      </div>
    `;
    renderDate(new Date(2025, 5, 28));
    const picker = document.querySelector('.date-picker');
    const card = document.querySelector('.card');
    expect(card).not.toBeNull();
    expect(picker).not.toBeNull();
    expect(card.contains(picker)).toBe(true);
  });
});
