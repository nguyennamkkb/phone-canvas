# Spec Delta

## Purpose

Makes phone-canvas behave like a finished product when opened: shareable links to any board, a UI that degrades gracefully instead of going blank, and a complete light/dark appearance with no console noise.

## ADDED Requirements

### Requirement: Shareable board URLs

The system SHALL address every view by URL so a board can be bookmarked, shared, and restored through browser back/forward.

#### Scenario: Deep-link a board

- **WHEN** the user opens `/p/mood-core` directly in a fresh tab
- **THEN** the mood-core board loads with its saved layout and the dashboard is skipped

#### Scenario: Browser navigation restores views

- **WHEN** the user clicks the "back" toolbar button and then the browser forward button
- **THEN** the board view returns exactly as left (same project, same selected node)

#### Scenario: Unknown project id degrades

- **WHEN** the user opens `/p/does-not-exist`
- **THEN** the system shows a not-found view with a link back to the dashboard, and never a blank page

### Requirement: Application state coverage

The system SHALL render an explicit state for every async and empty condition so the user is never left guessing whether the app is broken.

#### Scenario: Spec still being measured

- **WHEN** a board node is on screen but its iframe has not yet posted a capture
- **THEN** the panel shows a loading indicator in place of the element tree

#### Scenario: Spec capture fails

- **WHEN** no capture arrives within a bounded wait after the node mounted
- **THEN** the panel shows a retry control that re-requests the capture, instead of "Đang đọc DOM…" forever

#### Scenario: Board crash is contained

- **WHEN** rendering a board or a screen iframe throws
- **THEN** an error boundary shows a recovery view ("reload board" / "back to dashboard") and the rest of the app keeps working

#### Scenario: Empty project guides creation

- **WHEN** a project has no screens on its board
- **THEN** the empty view names the concrete next action (the scaffold command and the add-screen control)

### Requirement: Responsive panel behavior

The system SHALL keep the board usable on narrow viewports by turning the inspector panel into an overlay instead of squeezing the canvas.

#### Scenario: Narrow viewport overlays panel

- **WHEN** the viewport is narrower than the panel breakpoint with the panel open
- **THEN** the panel renders as an overlay above the canvas with an explicit close control, and the canvas keeps its full width underneath

### Requirement: Complete color modes

The system SHALL render fully in both light and dark modes with every surface and text token-resolved, so switching mode never leaves unreadable or unthemed regions.

#### Scenario: Dark mode has no hardcoded light surfaces

- **WHEN** the board theme is dark and every screen of every project is rendered
- **THEN** no element paints a hardcoded light color (white text on white, white cards on dark ground), verified by the token lint passing with zero warnings

### Requirement: Clean console on load

The system SHALL load with zero console errors and no fixable warnings.

#### Scenario: Fresh load is silent

- **WHEN** the app is opened with an empty cache and devtools console visible
- **THEN** there is no 404 (favicon present) and no React Flow attribution warning (licensed or attribution restored)
