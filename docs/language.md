# Language structure

Issue #14 adds a first shared text source for the Swedish MVP.

## Current locale

The first locale is `sv-SE`.

## Files

- `src/locales/svSE.ts` contains Swedish UI text keys.
- `src/locales/index.ts` exports the current dictionary as `t`.

## Principle

New screens should prefer importing text from the locale source instead of spreading hardcoded labels everywhere.

This is not full multi-language support yet. It is a foundation that makes later language additions easier.
