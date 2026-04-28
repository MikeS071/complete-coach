# ADR-004: Forms, Check-Ins, And External Analysis

## Status
Accepted for planning

## Context
Complete Coach needs flexible custom forms and check-ins, but external analysis systems need stable typed data. Pure JSON forms are flexible but weak for analytics. Pure typed schemas are reliable but too rigid for coach-defined forms.

## Decision
Use a hybrid model:
- Versioned form definitions and raw submissions are stored as JSON.
- Key fields are extracted into typed metric tables.
- External analysis systems access data through versioned REST APIs and signed webhooks.
- External exports are de-identified by default.
- PII requires an elevated API key scope.

## Consequences
Positive:
- Coaches can customize forms without migrations.
- Analytics systems get stable typed metric endpoints.
- Form versioning preserves historical context.
- Privacy risk is reduced through de-identification defaults.

Negative:
- Metric extraction logic must be versioned and tested.
- JSON schemas require strong validation.
- External API scope/audit logic must be strict.

Alternatives considered:
- JSON-only forms. Rejected because external analytics would be brittle.
- Fixed typed check-in tables only. Rejected because form builder flexibility is required.

