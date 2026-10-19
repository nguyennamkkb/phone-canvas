# Spec — noor/study

## Purpose

A reader who stops on one word wants its transliteration, translation, and root without leaving the passage, so the word inspector is a focused overlay over the reader that answers exactly that and dismisses back to the same offset.

## ADDED Requirements

### Requirement: Tap-a-word view over the reader

The word inspector SHALL show the tapped word's transliteration, translation, and morphological root in a context bound to the reader's current passage, and dismiss back to the identical reading offset.

#### Scenario: Dismissal loses no place

WHEN the user closes the inspector THEN the reader shows the same verse and scroll position as before.

#### Scenario: One word, three answers

WHEN a word is inspected THEN transliteration, translation, and root are all present — a partial answer sends the user hunting elsewhere for the rest.
