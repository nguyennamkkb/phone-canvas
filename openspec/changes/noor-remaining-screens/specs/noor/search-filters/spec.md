# Spec — noor/search-filters

## Purpose

A result set produced under the wrong scope is the user's own refinement to make, so search filters are a small context that narrows surah scope and translation language and returns both to the results for an explicit re-run.

## ADDED Requirements

### Requirement: Scope and language filters with explicit re-run

The search filters screen SHALL offer surah-scope selection and translation-language choice, show the currently applied pair, and return them to the results screen; re-running is explicit, never silent.

#### Scenario: Filters return, results re-run on demand

WHEN the user confirms filters THEN the results screen receives the new scope and language AND re-runs only when the user asks.

#### Scenario: Applied pair is always visible

WHEN filters are set THEN the results screen states the scope under which they were produced, so a missing result is never a mystery.
