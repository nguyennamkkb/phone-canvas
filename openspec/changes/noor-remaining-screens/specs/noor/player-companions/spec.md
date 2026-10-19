# Spec — noor/player-companions

## Purpose

Choosing the voice a passage is heard in and bounding a listening session with a stop time are the two player sub-contexts every other audio screen assumes: the reciter picker compares voices against the one currently playing, and the sleep timer makes a commitment about when sound ends that no transport control can express.

## ADDED Requirements

### Requirement: Reciter catalogue with in-place audition

The reciter picker SHALL present the full shipped voice catalogue as rows, each naming the reciter, its riwaya, and its per-reciter download state; tapping a row starts an audition of that voice against the currently loaded passage, and confirming applies the new reciter from the range's start.

#### Scenario: Audition before commit

WHEN the user taps a reciter row THEN an audition plays in that voice AND the previously active voice is remembered so dismissal restores it at the paused verse rather than restarting.

#### Scenario: Unavailable reciter keeps the old voice

WHEN the chosen reciter is unavailable THEN the screen reports "This reciter is not available." AND the previous reciter is kept with playback stopped and the loaded range retained.

### Requirement: Sleep timer as a pre-session commitment

The sleep timer SHALL offer fixed interval choices plus an off state, show the remaining time when a timer is engaged, and leave any engaged timer running when the screen is dismissed.

#### Scenario: Timer survives dismissal

WHEN a timer is engaged and the user leaves the screen THEN playback continues AND the timer keeps counting down rather than being cleared.

#### Scenario: Zero means absent

WHEN no timer is engaged THEN the player row states "Off" rather than hiding, and a zero-length value is treated as absent, never as an immediately-expiring timer.
