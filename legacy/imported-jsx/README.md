# Imported JSX Archive

This folder stores original standalone JSX templates before TSX wrapping and cleanup.

Migration order:

1. preserve original JSX
2. add notes about limitations
3. create wrapper component under `components/templates/imported/`
4. route it under `app/templates/`
5. extract summary generation into `lib/templates/summary/`
