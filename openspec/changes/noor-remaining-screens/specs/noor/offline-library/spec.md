# Spec — noor/offline-library

## Purpose

Downloaded recitation audio occupies device space the user owns, so the app must show that space as a distinct object with aggregate figures and a reclamation path, and must state the cost of a transfer against the chosen reciter before anything is committed.

## ADDED Requirements

### Requirement: Storage overview with per-reciter breakdown

The downloads overview SHALL show total storage used, a per-reciter breakdown, and a reclamation path per entry; backing out leaves every download untouched.

#### Scenario: Backing out changes nothing

WHEN the user opens the overview from any entry point and leaves THEN no download is started, paused, or removed.

#### Scenario: Purchase arrival does not confuse ownership

WHEN the user arrives from a purchase THEN the entitlement is already stored AND leaving does not undo it, because this screen has no transaction of its own.

### Requirement: Selection states cost before commit

The select-and-transfer screen SHALL allow multi-select of surahs for one reciter, show the size estimate for that exact reciter, disclose the paid capability before commit, and start nothing on dismissal.

#### Scenario: Estimate is reciter-specific

WHEN a reciter is chosen THEN the size estimate shown is computed against that reciter's audio, not a generic average.

#### Scenario: Dismissal spends nothing

WHEN the user leaves with a selection made but unconfirmed THEN no transfer starts and no data allowance is spent.
