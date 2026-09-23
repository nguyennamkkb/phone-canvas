# Spec Delta

## Purpose

Gives every project its own screen trash bin so a deleted screen can be reviewed, restored to its exact former position, or permanently erased including its HTML file.

## ADDED Requirements

### Requirement: Deleting a screen moves it to the per-project trash

The system SHALL move a screen deleted from the board into that project's trash instead of dropping it, and the board SHALL stop showing it.

#### Scenario: Delete moves screen to trash

- **WHEN** the user confirms deletion of a screen node on the board
- **THEN** the node disappears from the canvas and an entry for that screen appears in the project's trash

#### Scenario: Reconcile never resurrects a trashed screen

- **WHEN** the project board is reopened while its trash still holds a screen
- **THEN** the system does not re-add that screen to the canvas from the project definition

### Requirement: Trash remembers the screen's exact board position

Each trash entry SHALL preserve the information needed to restore the screen one-to-one: canvas position, device, and the edges cut by the deletion, plus when it was deleted.

#### Scenario: Trash entry keeps position and edges

- **WHEN** a screen node with connections is deleted
- **THEN** the trash entry records its position, device, and the cut edges so a later restore reproduces them

#### Scenario: Multiple deletions of the same screen

- **WHEN** the same screen is added to the board again and deleted again
- **THEN** the trash holds one entry per deletion, newest first, each independently restorable

### Requirement: User can browse the per-project trash

The system SHALL show the trash contents per project (screen title, deleted time) with actions to restore, permanently delete, and empty the whole bin.

#### Scenario: Open trash and see entries

- **WHEN** the user opens the trash for the active project
- **THEN** they see every trashed screen of that project ordered newest first, with restore and permanent-delete actions

#### Scenario: Empty project has empty trash

- **WHEN** the user opens the trash of a project with no deletions
- **THEN** the system shows an empty state and no restore or delete actions

### Requirement: Restoring returns the screen to its former position

Restoring a trash entry SHALL put the screen node back on the board at its recorded position with its recorded device and edges, and SHALL remove the screen from the deliberately-removed set so reopening the board keeps it.

#### Scenario: Restore reproduces position and connections

- **WHEN** the user restores a trash entry
- **THEN** the screen node reappears at its recorded position with its recorded device and its cut edges are re-attached

#### Scenario: Restored screen survives a reload

- **WHEN** the user restores a screen and reloads the project board
- **THEN** the restored screen is still on the board and not treated as deliberately removed

### Requirement: Permanent delete from trash erases the HTML file

Deleting a screen from the trash SHALL permanently erase it: the file `project/<id>/<name>.html` is removed from disk and all registry references to it are dropped, so the screen no longer exists anywhere in the app.

#### Scenario: Permanent delete removes file and references

- **WHEN** the user permanently deletes a screen from the trash (via the provided command)
- **THEN** its HTML file is gone from disk and it no longer appears in the screen registry, the owning project, the board, or exports

#### Scenario: Permanent delete of an unknown screen fails loudly

- **WHEN** permanent deletion targets a screen id that is not registered
- **THEN** the operation aborts without writing anything and reports the unknown id

### Requirement: Empty-trash permanently erases every entry

Emptying a project's trash SHALL permanently erase every screen in it, with the same effect as permanently deleting each one individually, only after an explicit confirmation.

#### Scenario: Empty trash with confirmation

- **WHEN** the user confirms emptying a non-empty trash
- **THEN** every trashed screen's HTML file is erased from disk, all registry references are dropped, and the trash is empty

#### Scenario: Empty trash cancelled

- **WHEN** the user cancels the empty-trash confirmation
- **THEN** nothing is deleted and the trash contents are unchanged

### Requirement: Trash state persists per project

Trash contents SHALL persist across reloads per project, alongside the existing board layout, and corrupt trash data SHALL fall back to an empty trash without breaking the board.

#### Scenario: Trash survives reload

- **WHEN** the user deletes a screen and reloads the project board
- **THEN** the screen is still in the trash and still off the canvas

#### Scenario: Corrupt trash does not break the board

- **WHEN** the stored trash data for a project is unreadable or malformed
- **THEN** the board opens with an empty trash and the rest of the layout intact
