# Spec — noor/search

## Purpose

A half-remembered reference must feel findable within one gesture from the reader, so search is a dedicated entry context with a scope selector and recent queries, producing a result set that is itself an object with size, order, and scope.

## ADDED Requirements

### Requirement: Query entry with scope and recents

The search query screen SHALL be reachable by one explicit gesture from the reader, offer a scope selector and recent queries, and return the typed query to the caller on exit so re-entry can offer it as a recent rather than silently re-running it.

#### Scenario: Back preserves the query

WHEN the user leaves the query screen THEN the typed query is returned to the calling surface AND nothing is discarded into a hidden store.

### Requirement: Results are refinable, never stale-cached

The results screen SHALL show ranked results with reference and snippet, and going back returns the query plus scope to the query screen for refinement; results are re-run against the local index, never served from a silent cache.

#### Scenario: Refine rather than restart

WHEN the user goes back from results THEN the query and scope arrive intact AND re-running is cheap and explicit.

#### Scenario: Empty results guide forward

WHEN a search matches nothing THEN the screen says so once and offers a next step rather than presenting a blank list.
