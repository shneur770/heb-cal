# Implementation Plan: Go to Date

## Overview

Add a date picker feature to the Hebrew Date & Parsha site that lets users navigate to any Gregorian date and view the corresponding Hebrew date, parsha, and holidays. The implementation refactors the existing `init()` rendering into a reusable `renderDate()` function, builds a custom dropdown date picker with year/month/day controls, adds a "Today" button, and includes property-based and unit tests using Vitest + fast-check.

## Tasks

- [x] 1. Set up testing infrastructure and refactor rendering
  - [x] 1.1 Install Vitest, fast-check, and jsdom; configure Vitest with jsdom environment
    - Run `npm install -D vitest fast-check jsdom`
    - Create `vitest.config.js` with `environment: 'jsdom'`
    - Add a `"test": "vitest --run"` script to `package.json`
    - Create empty `tests/` directory
    - _Requirements: Design Testing Strategy_

  - [x] 1.2 Extract `renderDate(gregDate)` from `init()` in `main.js`
    - Create a `renderDate(gregDate)` function that accepts a `Date` object
    - Move all Hebrew date, parsha, and holiday rendering logic from `init()` into `renderDate()`
    - Add `currentDisplayDate` module-level variable, updated only on successful render
    - Add `isShowingToday()` helper that compares `currentDisplayDate` to today (year/month/day)
    - Update `init()` to call `renderDate(new Date())` after `spawnStars()`
    - Export `renderDate` for testability
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 1.3 Implement pure validation functions in `main.js`: `isValidYear()`, `daysInMonth()`, `clampDay()`
    - `isValidYear(value)` returns true iff input string represents an integer in [1, 9999]
    - `daysInMonth(year, month)` returns correct day count for 0-indexed month, accounting for leap years
    - `clampDay(year, month, day)` returns `Math.min(day, daysInMonth(year, month))`
    - Export all three functions for testing
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_

- [ ] 2. Property-based tests for validation and rendering
  - [ ]* 2.1 Write property test for year validation (Property 1)
    - **Property 1: Year Validation Correctness**
    - File: `tests/validation.test.js`
    - Test that `isValidYear` returns true only for strings representing integers in [1, 9999]
    - Use generators: `fc.oneof(fc.integer(), fc.string(), fc.double(), fc.constant(""))`
    - **Validates: Requirements 3.1, 3.6**

  - [ ]* 2.2 Write property test for days-in-month (Property 2)
    - **Property 2: Days-in-Month Correctness**
    - File: `tests/validation.test.js`
    - Test that `daysInMonth` matches `new Date(year, month+1, 0).getDate()` for all valid year/month combos
    - Use generators: `fc.integer({min:1, max:9999})` × `fc.integer({min:0, max:11})`
    - **Validates: Requirements 3.3, 3.4**

  - [ ]* 2.3 Write property test for day clamping (Property 3)
    - **Property 3: Day Clamping Invariant**
    - File: `tests/validation.test.js`
    - Test that `clampDay` always returns value in [1, daysInMonth(year, month)]
    - Use generators: `fc.integer({min:1, max:9999})` × `fc.integer({min:0, max:11})` × `fc.integer({min:1, max:50})`
    - **Validates: Requirements 3.5**

  - [ ]* 2.4 Write property test for render output completeness (Property 4)
    - **Property 4: Render Output Completeness**
    - File: `tests/render.test.js`
    - Test that `renderDate(date)` output contains Hebrew English transliteration, gematriya, and Gregorian formatted string
    - Use generator: `fc.date({min: new Date(100,0,1), max: new Date(9999,11,31)})`
    - Requires jsdom environment with `#main` element set up
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ]* 2.5 Write property test for Today button visibility (Property 5)
    - **Property 5: Today Button Visibility Invariant**
    - File: `tests/today-button.test.js`
    - Test that the Today button is visible iff rendered date ≠ current calendar day
    - Use generator: `fc.date(...)` with mocked "today" via `vi.useFakeTimers()`
    - **Validates: Requirements 5.1, 5.3**

- [x] 3. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement the Date Picker UI
  - [x] 4.1 Add CSS for the date picker, trigger button, and today button in `index.html`
    - Add styles for `.go-to-date-btn` using existing CSS custom properties
    - Add styles for `.date-picker` overlay (dark background, gold border, same border-radius and font-family)
    - Add styles for `.dp-year`, `.dp-month`, `.dp-day` inputs/selects
    - Add hover highlight using gold accent at reduced opacity
    - Add focus border-color styles using gold accent token
    - Add styles for `.today-btn`
    - Add styles for `.error-msg`
    - _Requirements: 1.2, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.2 Create the Go_To_Date_Trigger button in `renderDate()`
    - Inject a `<button class="go-to-date-btn">` with text "Go to date" (accessible name contains "date")
    - Position it below holiday section and above parsha divider in the rendered HTML
    - Add `aria-expanded="false"` and `aria-haspopup="dialog"` attributes
    - Wire click handler to toggle picker open/close
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.3 Implement `createDatePicker(triggerEl)` function in `main.js`
    - Create a `div.date-picker[role="dialog"][aria-label="Date picker"]` element
    - Add labeled text input for year (`inputmode="numeric"`, `aria-label="Year"`)
    - Add labeled select for month (`aria-label="Month"`) with 12 full-name options (January–December)
    - Add labeled select for day (`aria-label="Day"`) with dynamic options
    - Return object with `{ open(), close(), isOpen(), getElement() }` interface
    - Position absolutely relative to trigger, z-index above card content
    - On open: initialize controls from `currentDisplayDate`
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 6.4_

  - [x] 4.4 Implement picker open/close logic and outside-click handling
    - Toggle picker visibility on trigger button click
    - Close picker on `mousedown` outside the picker element
    - Update `aria-expanded` on trigger when state changes
    - _Requirements: 2.4, 2.5, 1.4_

  - [x] 4.5 Implement `updateDayOptions()` and live date rendering on selection change
    - Rebuild day `<select>` options when year or month changes
    - Clamp current day using `clampDay()` when month/year changes reduce max day
    - Call `renderDate(new Date(year, month, day))` when all fields form a valid date
    - On invalid year input (non-integer or out-of-range), reject silently and retain previous valid value
    - _Requirements: 3.4, 3.5, 3.6, 3.7_

- [x] 5. Implement Today button and error handling
  - [x] 5.1 Add "Today" button that appears when displayed date ≠ today
    - Show button only when `isShowingToday()` returns false
    - Position within the card, visible without scrolling
    - On click, call `renderDate(new Date())`
    - Hide after successful render if now showing today
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.2 Implement error handling in `renderDate()`
    - Wrap `HDate` construction and calendar query in try/catch
    - On error, display inline message: "This date is not supported for Hebrew calendar conversion"
    - Use `.error-msg` styled div with `--muted` token
    - Retain `currentDisplayDate` unchanged on error (don't update module state)
    - Keep picker functional and interactive during error state
    - _Requirements: 4.8, 5.4_

- [x] 6. Keyboard accessibility and focus management
  - [x] 6.1 Implement focus management: move focus on open, return focus on close
    - Move focus to year input (first interactive element) when picker opens
    - Return focus to Go_To_Date_Trigger button when picker closes via Escape
    - _Requirements: 7.2, 7.4_

  - [x] 6.2 Implement focus trapping within the picker
    - On Tab at last focusable element: wrap to first focusable element
    - On Shift+Tab at first focusable element: wrap to last focusable element
    - Escape closes picker from any focused control
    - _Requirements: 7.1, 7.5_

  - [ ]* 6.3 Write unit tests for accessibility and keyboard behavior
    - File: `tests/accessibility.test.js`
    - Test ARIA attributes present: role="dialog", aria-label, aria-expanded
    - Test focus moves to year input on open
    - Test Escape closes picker and returns focus to trigger
    - Test focus trapping (Tab from last wraps to first, Shift+Tab from first wraps to last)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Integration wiring and final tests
  - [x] 7.1 Wire all components together and verify end-to-end flow in `main.js`
    - Ensure `init()` calls `renderDate(new Date())` and the trigger button appears
    - Verify picker → selection → renderDate → DOM update flow works correctly
    - Verify Today button → renderDate(new Date()) flow restores today's info
    - Verify close-on-outside-click and Escape key close flows
    - Ensure picker re-opens with the last successfully displayed date
    - _Requirements: 1.4, 2.1, 3.7, 4.1, 5.2_

  - [ ]* 7.2 Write integration tests for known dates
    - File: `tests/integration.test.js`
    - Test rendering 2025-06-28 → "Parashat Korach" appears
    - Test rendering 2025-10-02 → "Rosh Hashana" appears
    - Test rendering a date with no holidays → holiday section omitted
    - Test rendering a date outside @hebcal/core range → error message shown
    - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 7.3 Write unit tests for picker UI behavior
    - File: `tests/datepicker.test.js`
    - Test picker opens/closes on trigger click
    - Test picker closes on outside click
    - Test picker initializes with current display date
    - Test month select has 12 options with full month names
    - Test Today button click resets to today's date
    - _Requirements: 1.4, 2.3, 2.4, 2.5, 3.2, 5.2_

- [x] 8. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All code stays in `main.js` (single-file architecture) with exported functions for testability
- All CSS is added inline in the `<style>` tag of `index.html` (consistent with existing approach)
- Tests go in a `tests/` directory as specified in the design

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3"] },
    { "id": 5, "tasks": ["4.4", "4.5", "5.1"] },
    { "id": 6, "tasks": ["5.2", "6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3"] },
    { "id": 8, "tasks": ["7.1"] },
    { "id": 9, "tasks": ["7.2", "7.3"] }
  ]
}
```
