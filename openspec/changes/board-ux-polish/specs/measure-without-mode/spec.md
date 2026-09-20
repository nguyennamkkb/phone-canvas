# Spec Delta

## Purpose

Lets users measure any element without leaving move mode, removing the constant toggle between moving the board and inspecting screens.

## ADDED Requirements

### Requirement: Click distinguishes node from element

The system SHALL select the screen node on a node-chrome click and select the clicked element's spec on an element click, all while staying in move mode.

#### Scenario: Element click selects its spec

- **WHEN** the user clicks an element inside a phone screen in move mode
- **THEN** the inspector shows that element's spec and the element highlights, without switching modes or moving the canvas

#### Scenario: Node drag still pans the screen

- **WHEN** the user drags a phone node by its label or empty margin
- **THEN** the node moves and no spec selection changes

### Requirement: Measure mode stays for power users with guidance

The system SHALL keep the dedicated measure mode and show a hint-bar describing the active mode, with Esc returning to move mode.

#### Scenario: Hint-bar and Esc

- **WHEN** measure mode is active
- **THEN** a hint-bar states what click and drag do in this mode, and pressing Esc returns to move mode
