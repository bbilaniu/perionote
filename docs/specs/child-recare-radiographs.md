# Child recare radiographs

The Child Recare Exam & Hygiene Notes interactive template uses the shared
Radiographs taken today control in Records and dental exam. It supports
bitewings, periapicals, panoramic images, editable counts, and additional
encounter-only or remembered catalogue types.

Selections are stored in `radiographsTaken` and synchronize source-linked rows
in Treatment completed today. Changing counts updates the linked rows; removing
a type removes its row. Other completed treatment remains unchanged. The
Radiographs catalogue action and Edit radiographs links return to the child
template's radiograph controls.

Combined output includes the radiographs in both the dental examination and
completed treatment. Dentist output includes the Radiographs line; Hygienist
output includes them in Treatment completed today. For example, selecting two
bitewings adds `Radiographs: 2 BW.` and `Treatment completed today: 2 BW` to the
combined note. Unselected radiographs remain undocumented.

Older drafts retain their free-text `radiographs` field and show it as Previous
radiograph documentation. That text keeps its existing dental-exam output and
does not generate completed procedures automatically. New selections and linked
treatment rows restore together from the existing local draft system.
