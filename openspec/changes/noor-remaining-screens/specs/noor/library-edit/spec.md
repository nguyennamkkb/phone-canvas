# Spec — noor/library-edit

## Purpose

A saved verse's note, highlight colour, and reference are the durable marks of a user's own study, so editing one bookmark is a focused context that writes only on explicit save and never on exit.

## ADDED Requirements

### Requirement: Single-bookmark editor with explicit save

The bookmark editor SHALL edit one bookmark's note, highlight colour, and verse reference; leaving without saving changes nothing, and saving returns to the list with the edited item updated.

#### Scenario: Exit without save is free

WHEN the user leaves the editor without saving THEN the bookmark is byte-identical to before.

#### Scenario: Save is visible on return

WHEN the user saves THEN the bookmarks list shows the updated note and colour on that item.
