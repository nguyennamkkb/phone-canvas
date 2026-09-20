# Spec Delta

## Purpose

Makes the first view of a board show phone screens large and legible instead of tiny thumbnails lost in empty canvas space.

## ADDED Requirements

### Requirement: Fit-view frames phone nodes only

The system SHALL compute the initial fit and the fit action over phone screen nodes only, excluding the token reference table.

#### Scenario: Board opens with legible screens

- **WHEN** the mood-core board opens fresh at 1440×900
- **THEN** phone screens render at a legible size (each screen height covering a substantial fraction of the viewport height) instead of thumbnails, with minimal dead canvas around the row

#### Scenario: Fit action ignores the token table

- **WHEN** the user clicks the fit-view action
- **THEN** the viewport frames the phone row, and the token table (docked or not) never shrinks the phone framing
