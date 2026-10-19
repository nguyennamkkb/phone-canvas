# Spec — noor/settings

## Purpose

Eight configuration and disclosure contexts would otherwise be reachable from eight different places with one of them unreachable, so settings is a single grouped index that writes nothing itself, plus an appearance screen whose preview is truthful because themes apply on selection, plus a privacy statement that exists only to be read.

## ADDED Requirements

### Requirement: One grouped index, zero writes

The settings root SHALL group every configuration and disclosure context in one reachable list and write nothing on entry or exit.

#### Scenario: Index is inert

WHEN the user opens settings root and leaves THEN no preference changed.

### Requirement: Appearance preview is the applied truth

The appearance screen SHALL show theme, text size, and Reduce Motion controls with a live preview of the reader surface; selecting a theme applies it at once so the preview never shows a theme the app has not applied.

#### Scenario: Preview cannot lie

WHEN the user selects a theme THEN the app applies it immediately AND the preview reflects the applied state.

### Requirement: Privacy dashboard is read-only

The privacy dashboard SHALL state what the app stores, sends, and requests; it SHALL expose zero actions and write nothing.

#### Scenario: Nothing to disturb

WHEN the user opens the dashboard and leaves THEN no state exists for any gesture to disturb.
