# Spec Delta

## Purpose

Makes the inspector panel teach itself: empty states tell the user the single next action, disabled controls explain why, and long element trees become searchable.

## ADDED Requirements

### Requirement: Empty states carry a direct action

The system SHALL pair every panel empty-state with the concrete control that resolves it, in at most two lines of text.

#### Scenario: No screen selected

- **WHEN** no phone node is selected
- **THEN** the panel shows at most two lines plus a button that focuses the first phone screen on the board

### Requirement: Disabled copy explains itself

The system SHALL explain why Copy JSON is disabled instead of leaving a dead button.

#### Scenario: Waiting on capture

- **WHEN** a screen is selected but its capture has not arrived
- **THEN** the Copy button area states that the DOM is still being read (or offers retry after the timeout) rather than showing an unexplained disabled button

### Requirement: Element tree filters by text

The system SHALL provide a filter input over the element tree that matches role, label, and size text.

#### Scenario: Filter narrows the tree

- **WHEN** the user types text into the tree filter
- **THEN** only matching rows show, the match count updates, and clearing restores the full tree with selection intact
