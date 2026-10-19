# Spec — noor/library

## Purpose

Verses a user deliberately kept — with their own ordering, note, and colour per item — form a durable collection that outlives any reading session, so bookmarks live in a context of their own where leaving changes nothing.

## ADDED Requirements

### Requirement: Saved-verse collection with per-item note

The bookmarks list SHALL show saved verses with reference, snippet, and note; each item carries its own note and colour; the screen performs no change on entry or exit.

#### Scenario: Visit is side-effect free

WHEN the user opens the list and leaves THEN every bookmark is untouched, because curiosity must not rewrite a collection.

#### Scenario: Each item answers where and what

WHEN a bookmark renders THEN it names its surah-and-verse reference AND shows a text snippet sufficient to recognise the verse without opening it.
