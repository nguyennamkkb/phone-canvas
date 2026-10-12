# Spec — noor/offline-detail

## Purpose

A transfer that stalls or fails is a distinct object from the selection that started it: it has progress, a retry path, and a named failure reason, and it must be readable without re-entering the flow that created it.

## ADDED Requirements

### Requirement: Per-transfer progress with retry

The download detail SHALL show one transfer's progress, its current state, and — on failure — the named reason plus a retry action; retry resumes rather than restarting from zero where the manifest allows.

#### Scenario: Failure names its reason

WHEN a transfer fails THEN the screen states which transfer, why it failed, and offers retry in place.

#### Scenario: Back never cancels silently

WHEN the user leaves mid-transfer THEN the transfer continues in the background AND its state stays readable from the overview.
