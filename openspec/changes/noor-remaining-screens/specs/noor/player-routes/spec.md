# Spec — noor/player-routes

## Purpose

The shipped player already opens two rows that lead nowhere: the queue row promises a continuous-play list across surahs and the output row promises a choice of where sound goes, so both destinations must exist with the exact back-behaviour their callers assume — dismissing either changes nothing about what is playing.

## ADDED Requirements

### Requirement: Queue builder across surahs

The queue builder SHALL show the continuous-play queue across surahs and reciters, allow reorder and removal, and return the new order to the player; an empty queue disables next and states why rather than hiding.

#### Scenario: Reorder survives the round trip

WHEN the user reorders the queue and returns THEN the player shows the new length AND next is enabled iff the queue is non-empty.

#### Scenario: Dismissal changes nothing unconfirmed

WHEN the user leaves without confirming THEN the player's queue is exactly as before.

### Requirement: Output route picker with situational choices

The output route picker SHALL list the available routes (device speaker, headphones, AirPlay, CarPlay where present), apply on selection, and dismiss back to the player with playback continuing on the new route.

#### Scenario: Route applies at once

WHEN the user taps a route THEN audio moves there immediately AND the player's output row names it on return.
