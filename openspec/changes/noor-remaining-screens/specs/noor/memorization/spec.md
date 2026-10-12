# Spec — noor/memorization

## Purpose

Deliberately withholding the Quranic text from a user who is looking at it inverts what the reader is for, so memorisation needs its own context with a setup that decides the conditions before concealment begins and a session state machine that records attempts as they happen.

## ADDED Requirements

### Requirement: Setup decides conditions, starts nothing

The memorize setup screen SHALL configure the verse range and cue level before any session begins; leaving it begins no session and costs nothing.

#### Scenario: Dismissal is free

WHEN the user leaves setup THEN no session exists AND no state was changed, which is exactly what makes this the right place for the decision.

### Requirement: Session conceals, reveals per verse, records attempts

The memorize session SHALL hide the passage text, reveal per verse on demand, record attempts and reveals as they occur, and keep that record when the user leaves; back is disabled only while a single verse is mid-reveal.

#### Scenario: Leaving keeps the work

WHEN the user ends the session THEN attempts and reveals so far are retained AND the reader returns to normal reading.

#### Scenario: Mid-reveal back is blocked

WHEN a verse reveal is in flight THEN back is disabled, because a reveal completing into nothing would leave the user unsure whether they succeeded.
