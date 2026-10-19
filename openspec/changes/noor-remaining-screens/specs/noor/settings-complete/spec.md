# Spec — noor/settings-complete

## Purpose

Four configuration contexts complete the settings region the root indexes: the language the app speaks, the data audio playback may spend, the reminder the user asked for, and the cloud the library syncs to — each writes only its own preference and none of them reaches into another's.

## ADDED Requirements

### Requirement: Language selects app and translation defaults

The language screen SHALL select the app language and the default translation; changing either applies to new surfaces immediately and never rewrites saved content.

#### Scenario: Saved notes keep their language

WHEN the language changes THEN existing bookmark notes and history entries are untouched.

### Requirement: Audio and data bounds playback cost

The audio-and-data screen SHALL offer bitrate choice, a data-saver toggle, and streaming-cache size; enabling data saver MUST prevent cellular streaming of uncached audio.

#### Scenario: Data saver is a real bound

WHEN data saver is on and audio is uncached THEN cellular playback is refused with a named reason, not silently streamed.

### Requirement: Notifications carry one reminder

The notifications screen SHALL offer enable/disable plus a single daily-reminder time; disabling stops all scheduled reminders.

#### Scenario: Off means off

WHEN notifications are disabled THEN no reminder fires, and re-enabling restores the previously set time rather than a default.

### Requirement: Sync states cloud truthfully

The sync screen SHALL expose the CloudKit toggle and the current storage state; turning sync off keeps local data intact and states that the cloud copy stops updating.

#### Scenario: Disabling sync destroys nothing local

WHEN sync is turned off THEN every local bookmark, note, and position remains AND the screen says the cloud copy is frozen.
