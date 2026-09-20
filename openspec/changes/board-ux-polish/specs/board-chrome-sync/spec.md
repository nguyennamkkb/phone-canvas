# Spec Delta

## Purpose

Removes the remaining inconsistencies a new user trips over: English control labels, a theme toggle that themes only the screens, two delete patterns, a cross-project add-screen list, and an undiscoverable share link.

## ADDED Requirements

### Requirement: Canvas controls speak Vietnamese

The system SHALL label the zoom controls and minimap-adjacent UI in Vietnamese, matching the toolbar and panel locale.

#### Scenario: Zoom controls in Vietnamese

- **WHEN** the user hovers the canvas zoom controls
- **THEN** the tooltips read in Vietnamese (phóng to / thu nhỏ / vừa khung) with no English remnants

### Requirement: Theme toggle themes the whole app

The system SHALL apply the board's light/dark choice to the app chrome (toolbar, panel, dashboard surfaces) in addition to the screen iframes.

#### Scenario: Dark board is dark everywhere

- **WHEN** the user switches the board to dark mode
- **THEN** toolbar, panel, and canvas background render dark surfaces with readable text, while measured screen values stay identical

### Requirement: One delete pattern without native confirm

The system SHALL delete screens through a single in-app pattern and MUST NOT use the native `confirm()` dialog.

#### Scenario: Delete from node and panel match

- **WHEN** the user deletes a screen from the node × button or the panel action
- **THEN** both paths show the same inline confirmation (confirm/cancel in place) and announce the result identically

### Requirement: Add-screen lists the project first

The system SHALL scope the add-screen picker to the current project's screens by default, with other projects' screens one explicit step away.

#### Scenario: No accidental cross-project adds

- **WHEN** the user opens the add-screen picker on a project board
- **THEN** the list shows that project's screens first, and adding a foreign screen requires an explicit "all screens" opt-in

### Requirement: Board link is one click away

The system SHALL provide a copy-board-link button next to the project title that copies the board's shareable URL.

#### Scenario: Copy link

- **WHEN** the user clicks the copy-link button
- **THEN** the board URL (`#/p/:id`) lands on the clipboard with transient "Đã chép" feedback, and opening it in a fresh tab loads the same board
