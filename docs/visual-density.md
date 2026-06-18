# Visual Density

Issue #83 harmonizes the app around a compact but touch-friendly rhythm.

## Principles

- Control views should stay dense enough to reduce unnecessary scrolling.
- Checklist-style flows are the reference for the balance between compact rows, clear touch targets and readable labels.
- Temperature fields should be more compact than large dashboard cards, but still keep strong value emphasis.
- Dashboard views should keep efficient lists, with slightly fuller spacing and card padding so they feel related to the control views.
- Navigation headers should remain easy to identify and use on mobile.
- Every view should be reviewed for information density, nesting depth, scroll cost and focus before adding more visual layers.
- Avoid card-in-card layouts unless the inner card introduces a distinct interaction or status state.
- Each destination page should have one primary object: a list, table, form, or focused settings surface.

## Current Adjustments

- Control form groups and temperature fields use tighter gaps and padding.
- Temperature inputs are slightly smaller and more compact.
- Temperature controls now reduce nesting by letting the object row carry structure while normal temperature fields avoid an extra inner card.
- Dashboard, history and sharing rows use a shared rhythm of modestly fuller gaps and padding.
- The changes are UI-only and do not affect database, control, history or sharing logic.
