# Legacy Template Imports

Legacy JSX is preserved for provenance, but new clinic conversions should use
the native conversion structure described in [CONTRIBUTING.md](../CONTRIBUTING.md).

When a standalone legacy template must be imported:

1. preserve the original under `legacy/imported-jsx/<slug>/`;
2. record source and known limitations beside it;
3. add a minimal wrapper under `components/templates/imported/`;
4. register it in `components/templates/registry.ts`;
5. verify its `/templates/<slug>` route with Playwright; and
6. add summary fixtures and unit coverage when its output is maintained here.

Do not silently rewrite the preserved source. Refactor maintained behavior in
the wrapper or a native replacement.
