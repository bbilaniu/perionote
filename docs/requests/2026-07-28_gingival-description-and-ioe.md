Implement the Gingival Description and IOE additions using:

docs/specs/hygienenote-gingival-ioe.catalog.json

Validate it against:

docs/specs/hygienenote-gingival-ioe.schema.json

The JSON catalog, not DH Note.docx, is the source of truth for this implementation.

Important interpretation rules:

1. Use normalizedSections for implementation.
2. source.sourceTables is an audit-only transcription of the original Word tables.
3. Do not parse or reinterpret comma-separated content from the Word document.
4. Do not recreate Chief Concern; it is explicitly excluded from this scope.
5. Preserve the stable IDs from the catalog in form state, persistence, and JSON import/export.
6. Do not persist generatedNoteText or noteFragment as the canonical selected value.
7. An unselected or absent field means Not assessed, not WNL.
8. WNL must result from an explicit user action.
9. Support multiple simultaneous findings where the catalog specifies multiple selection.
10. Respect supportsLocation, supportsLaterality, supportsTooth,
    supportsSurface, supportsMeasurement, measurementUnit, and similar metadata.
11. Do not automatically generate diagnoses, causes, symptoms, counselling,
    recommendations, or follow-up plans from observational findings.
12. Respect implementationMode:
    - direct: create or adapt a direct assessment
    - derived_from_gingival_description: derive the IOE summary from the
      detailed gingival section and do not create duplicate state
    - reuse_existing_or_summary: inspect and reuse existing fields
    - reuse_existing_or_direct: reuse an existing field when available,
      otherwise add a direct field
13. Do not implement decisions listed in reviewItems by silently guessing.
    Preserve the currentDecision and report any remaining decision that blocks
    implementation.
14. Reuse existing project controls, schemas, form architecture, generated-note
    composition, persistence, and catalogue infrastructure.
15. Preserve backward compatibility with existing saved forms and JSON data.

Before changing code, inspect the repository for existing Gingiva, bleeding,
Teeth, caries, mobility, Occlusion, overjet, overbite, Saliva, salivary-flow,
and xerostomia fields.

After implementation, validate:

- existing saved notes still load;
- absent new data produces no clinical assertion;
- the gingival WNL preset works;
- localized and generalized findings can coexist;
- recession supports location and millimetre measurement;
- IOE WNL output requires explicit selection;
- normal variations are not automatically labelled pathological;
- gingiva is not generated twice;
- existing Teeth, Occlusion, Saliva, or bleeding content is not duplicated;
- Chief Concern remains unchanged;
- new stable IDs survive JSON export/import round trips;
- unknown or retired option IDs do not crash the form.

Run the relevant formatter, lint, type-check, tests, and build. In the final
report, identify the files changed, compatibility decisions, catalogue
integration, generated-note behavior, validation results, and any reviewItems
that remain unresolved.