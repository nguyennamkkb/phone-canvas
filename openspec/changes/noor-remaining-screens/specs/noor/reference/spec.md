# Spec — noor/reference

## Purpose

Static trust surfaces — what the app is and how a practice range went — exist to be read after the fact: help states version, sources, and rights with no actions, and memorize stats reports attempts, reveals, and time for exactly the range practiced.

## ADDED Requirements

### Requirement: Help and about is static and complete

The help screen SHALL state the app version, content sources, rights, support path, and privacy-policy location; it SHALL expose no setting and write nothing.

#### Scenario: Visit is inert

WHEN the user opens help and leaves THEN nothing changed anywhere.

### Requirement: Memorize stats reports one range

The memorize stats screen SHALL report attempts, reveals, and time spent for a single practice range; its figures derive from recorded session data and the screen itself records nothing.

#### Scenario: Stats never self-inflate

WHEN the user opens stats without practicing THEN every figure matches the last recorded session exactly.
