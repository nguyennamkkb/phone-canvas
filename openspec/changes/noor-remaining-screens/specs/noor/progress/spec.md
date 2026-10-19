# Spec — noor/progress

## Purpose

A reader's two distinct questions about their own practice — "how far through the Quran have I come" and "where exactly was I" — need two read-only answers, because a percentage cannot be reversed into a location and a location list cannot report completion.

## ADDED Requirements

### Requirement: Khatmah progress is recorded by reading, not visiting

The khatmah screen SHALL show juz completion, the current juz, and days-active; opening it MUST NOT advance any figure — progress is written by reading sessions elsewhere.

#### Scenario: Curiosity does not create progress

WHEN the user opens progress without having read THEN every figure is unchanged on exit.

### Requirement: History answers location, not completion

The history screen SHALL list recent reading positions in reverse-chronological order; visiting it MUST NOT create an entry, and tapping an entry resumes the reader at that exact offset.

#### Scenario: Visit leaves no trace

WHEN the user opens history and closes it THEN the list is identical, because the list would otherwise become a function of curiosity rather than of practice.

#### Scenario: Resume is exact

WHEN the user taps a history entry THEN the reader opens at that surah, verse, and scroll offset.
