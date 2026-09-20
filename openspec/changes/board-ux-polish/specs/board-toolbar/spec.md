# Spec Delta

## Purpose

Makes the board toolbar fit every desktop viewport without clipped labels, so all controls stay visible and legible at 1280px and above.

## ADDED Requirements

### Requirement: Toolbar never clips labels

The system SHALL render the full toolbar with no clipped button text at any desktop viewport width of 1280px or more.

#### Scenario: Full toolbar at 1440px

- **WHEN** the board opens at 1440px wide with the panel visible
- **THEN** every toolbar button shows its complete label (including the panel toggle) with no truncation or ellipsis

### Requirement: Four toolbar groups with icon actions

The system SHALL organize the toolbar into navigation, view, add, and panel groups, with secondary actions as icon-buttons carrying tooltips.

#### Scenario: Secondary actions collapse to icons

- **WHEN** the user looks at the toolbar
- **THEN** fit-view and panel-toggle appear as icon-buttons with Vietnamese tooltips, while mode, frame, theme, and add-screen stay as labeled controls
