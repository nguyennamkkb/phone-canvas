# Spec Delta

## Purpose

Gives reviewers a fast way to read one screen at full size and step through screens, which is how design review actually happens 90% of the time.

## ADDED Requirements

### Requirement: Double-click focuses a screen at full size

The system SHALL zoom a double-clicked screen node to 100% scale centered in the viewport.

#### Scenario: Double-click focuses

- **WHEN** the user double-clicks a phone node's label
- **THEN** the canvas centers that screen at zoom 1.0 so its content is readable at true size

### Requirement: Arrow keys step between screens with Esc to exit

The system SHALL move focus to the previous/next phone screen on ArrowLeft/ArrowRight while focused, and return to fit on Esc.

#### Scenario: Keyboard walkthrough

- **WHEN** the user is focused on a screen and presses ArrowRight
- **THEN** the next screen in board order centers at zoom 1.0, and the inspector follows the newly focused screen
