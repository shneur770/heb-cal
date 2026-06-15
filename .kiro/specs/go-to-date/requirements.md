# Requirements Document

## Introduction

Add a "Go to Date" feature to the Hebrew Date & Parsha site that allows users to select any Gregorian date and view the corresponding Hebrew date, weekly parsha, and holiday information. Currently the site only displays today's information — this feature enables exploration of any date in any year.

## Glossary

- **App**: The Hebrew Date & Parsha single-page application
- **Date_Picker**: The drop-down interface that allows the user to select a Gregorian date (year, month, day)
- **Info_Display**: The card area that renders Hebrew date, Gregorian date, parsha, and holiday information
- **Go_To_Date_Trigger**: The UI element (button) that opens the Date_Picker
- **Selected_Date**: The Gregorian date chosen by the user via the Date_Picker

## Requirements

### Requirement 1: Go-To-Date Trigger Visibility

**User Story:** As a user, I want a clearly visible button to open the date picker, so that I can easily discover and access the go-to-date feature.

#### Acceptance Criteria

1. THE App SHALL display a Go_To_Date_Trigger button within the card layout, positioned below the displayed Hebrew date information and above the weekly Torah portion section
2. THE Go_To_Date_Trigger SHALL use the application's existing CSS custom properties (--gold, --card, --text, --radius) for its styling, including a 1px border using the gold color token at the same opacity as other card border elements
3. THE Go_To_Date_Trigger SHALL include an accessible name containing the word "date" so that screen readers convey its purpose, and SHALL be focusable via keyboard navigation
4. WHEN the user activates the Go_To_Date_Trigger, THE App SHALL open the date picker interface

### Requirement 2: Date Picker Display

**User Story:** As a user, I want a drop-down date picker to appear when I activate the trigger, so that I can choose any date.

#### Acceptance Criteria

1. WHEN the user activates the Go_To_Date_Trigger, THE App SHALL display the Date_Picker as a drop-down overlay positioned relative to the Go_To_Date_Trigger
2. THE Date_Picker SHALL provide selection controls for year, month, and day
3. WHEN the Date_Picker opens, THE Date_Picker SHALL set its selection controls to the date currently shown in the Info_Display
4. WHEN the user activates the Go_To_Date_Trigger while the Date_Picker is open, THE App SHALL close the Date_Picker
5. WHEN the user clicks outside the Date_Picker while it is open, THE App SHALL close the Date_Picker

### Requirement 3: Date Selection and Navigation

**User Story:** As a user, I want to select a specific year, month, and day, so that I can navigate to any date in any year.

#### Acceptance Criteria

1. THE Date_Picker SHALL allow selection of any Gregorian year from 1 CE to 9999 CE via a text input field that accepts only integer values within that range
2. THE Date_Picker SHALL allow selection of any month within the selected year, displaying months by their full name (January through December)
3. THE Date_Picker SHALL allow selection of any valid day within the selected month and year
4. THE Date_Picker SHALL only present valid day values (1 through 28, 29, 30, or 31 as applicable) for the selected month and year, accounting for leap years
5. WHEN the user changes the selected month or year such that the currently selected day exceeds the maximum valid day for the new month/year combination, THEN THE Date_Picker SHALL automatically adjust the selected day to the last valid day of the new month/year
6. IF the user enters a year value outside the range 1 to 9999 or a non-integer value, THEN THE Date_Picker SHALL reject the input and retain the previously selected valid year
7. WHEN the user completes a valid date selection (year, month, and day are all set), THE Date_Picker SHALL display the corresponding Hebrew date and associated information within 2 seconds

### Requirement 4: Info Display Update

**User Story:** As a user, I want to see the Hebrew date, parsha, and holiday information for my selected date, so that I can learn about any date on the Hebrew calendar.

#### Acceptance Criteria

1. WHEN the user confirms a Selected_Date in the Date_Picker, THE Info_Display SHALL update to show the Hebrew date in English transliteration (e.g., "29th of Sivan, 5786") for the Selected_Date
2. WHEN the user confirms a Selected_Date in the Date_Picker, THE Info_Display SHALL update to show the Hebrew date in gematriya (Hebrew characters, e.g., "כ״ט סִיוָן תשפ״ו") for the Selected_Date
3. WHEN the user confirms a Selected_Date in the Date_Picker, THE Info_Display SHALL update to show the Gregorian date formatted as weekday, month, day, and year (e.g., "Sunday, June 29, 2025") for the Selected_Date
4. WHEN the user confirms a Selected_Date in the Date_Picker, THE Info_Display SHALL update to show the weekly Torah portion (parsha) for the Shabbat associated with the Selected_Date, including the parsha name in English, the parsha name in Hebrew, and the Torah book name
5. WHEN the user confirms a Selected_Date in the Date_Picker, THE Info_Display SHALL update to show all holidays occurring on the Selected_Date as labeled tags
6. IF no parsha is associated with the Selected_Date, THEN THE Info_Display SHALL omit the parsha section entirely
7. IF no holidays occur on the Selected_Date, THEN THE Info_Display SHALL omit the holiday section entirely
8. IF the Selected_Date is outside the supported Hebrew calendar range (years 1 CE through 9999 CE), THEN THE Info_Display SHALL display an error message indicating the date is not supported

### Requirement 5: Return to Today

**User Story:** As a user, I want to easily return to today's date after exploring other dates, so that I can quickly get back to the current information.

#### Acceptance Criteria

1. WHILE the Info_Display is showing a date other than today (based on the user's local system date), THE App SHALL display a "Today" button that remains visible without scrolling
2. WHEN the user activates the "Today" button, THE Info_Display SHALL update within 1 second to show today's Hebrew date, parsha, and holiday information
3. WHILE the Info_Display is showing today's date, THE App SHALL hide the "Today" button
4. IF the Info_Display fails to load today's date information after the user activates the "Today" button, THEN THE App SHALL display an error message indicating the failure and retain the previously displayed date

### Requirement 6: Date Picker Styling

**User Story:** As a user, I want the date picker to blend seamlessly with the existing site design, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE Date_Picker SHALL use the site's dark background token for its container background, gold accent token for selected and highlighted dates, and muted text token for non-active day labels
2. THE Date_Picker SHALL apply the same border-radius as the card component and a 1px solid border using the card's gold-tinted border color
3. THE Date_Picker SHALL be rendered as an absolutely-positioned overlay with a z-index above the card content, so that opening the picker does not shift or reflow surrounding elements
4. THE Date_Picker SHALL use the same font-family as the site body and apply the gold accent token as background for the currently-selected date and as border-color for the keyboard-focused date
5. WHEN the user hovers over a selectable date, THE Date_Picker SHALL display a background highlight using the gold accent token at reduced opacity

### Requirement 7: Keyboard and Accessibility

**User Story:** As a user, I want to interact with the date picker using keyboard navigation and assistive technologies, so that the feature is accessible.

#### Acceptance Criteria

1. THE Date_Picker SHALL be operable using keyboard-only navigation where Tab moves focus between the year, month, and day selection controls, Arrow keys cycle through values within the focused control, Enter confirms the Selected_Date, and Escape closes the Date_Picker
2. WHILE the Date_Picker is open, WHEN the Escape key is pressed, THE App SHALL close the Date_Picker and return focus to the Go_To_Date_Trigger
3. THE Date_Picker SHALL use ARIA attributes including a role of "dialog", an aria-label identifying it as a date picker, and aria-expanded on the Go_To_Date_Trigger reflecting the open or closed state
4. WHEN the Date_Picker opens, THE App SHALL move focus to the first interactive element within the Date_Picker
5. WHILE the Date_Picker is open, THE App SHALL constrain keyboard focus within the Date_Picker so that Tab and Shift+Tab cycle only through the Date_Picker controls
