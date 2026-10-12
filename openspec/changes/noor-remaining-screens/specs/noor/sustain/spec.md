# Spec — noor/sustain

## Purpose

The app's paid capability and its out-of-app entry point are the two contexts where trust is monetary on one side and glanceable on the other: plans must state what changes and restore what was paid without pressuring, and the widget must earn a tap that deep-links the reader because it has no navigation of its own.

## ADDED Requirements

### Requirement: Plans decide a recurring commitment without pressure

The subscription plans screen SHALL compare plans, state the entitlement each grants, carry the restoration path for an already-paid user, and dismiss in a single gesture that buys nothing and changes no entitlement.

#### Scenario: Dismissal is free

WHEN the user leaves the plans screen THEN nothing was purchased AND no entitlement changed.

#### Scenario: Restore is a first-class path

WHEN a user who already paid opens plans THEN the restoration path is present without requiring a new purchase.

### Requirement: Purchase confirmation states receipt truthfully

The purchase confirmation SHALL show the StoreKit sheet outcome, the receipt state, and the restore action; it buys nothing itself and dismisses back to the context that pushed it with the entitlement applied.

#### Scenario: Receipt is shown, not implied

WHEN a purchase completes THEN the screen states what was granted AND offers no second purchase of the same entitlement.

### Requirement: Widget is glanceable and deep-links

The daily-verse widget screen SHALL show today's verse legibly at a glance, expose no navigation stack, and launch the reader at that verse on tap.

#### Scenario: Tap lands exactly

WHEN the user taps the widget THEN the app opens the reader at today's verse, not at a home or index.
