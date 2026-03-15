For the very short template:

First Run: 
1) Change "Asymptomatic click on opening/closing" to "TMJ clicking"
2) add conditional fields to "TMJ clicking" : 
    Symptomatic / Asymptomatic, 
    On open / On close,  
    Left / Right / Bilateral (exists already?)
3) Change "Asymptomatic Lymph Nodes" to "Palpable Lymph Nodes"
4) add conditional fields to "Palpable Lymph Nodes"
    Left / Right / Bilateral
    Submandibular / Sublingual
    Slightly enlarged, very swollen
5) For all gingival descriptions, make the "location" sextants only, not surfaces.
6) Remove Gingival Position, Bleeding & Exudate
7) In "Contour / Shape", remove the options "Papilla: Cratered" and "Papilla: Clefted" 
8) separate "Contour / Shape" into two sections called "Gingival margins" and "Interdental papilla", move each option into the appropriate section.
9) Rename the options in "Gingival margins" and "Interdental papilla" by removing "Margins:" and "Papilla:"
10) for all options under "Calculus and Biofilm Deposits", remove "Localized" "Generalized" from the "Location / Type" as it already exists under "Extent"
11) Under "treatement done today" and "Next appointment", Add "OHE reinfored", "Reviewed Homecare" 
12) Under "treatement done today" and "Next appointment", Change "Select All" to "Select Core", and make it select only the following : Med/dent history update, EOE/IOE, OHE reinforced, reviewed homecare.
13) Under "treatement done today" and "Next appointment", Merge Hand Instruments and Power Instruments together under "Hand and Power Instrumentation". When exporting, Put the areas instrumented (if selected) before "Hand and Power Instrumentation", remove the dash.

Second Run : 
Add a card for Local Anesthesia: 

Allow the selection of 
"No C/I to LA"
"Benzocaine 20% applied to the injection site"
Type of anesthesisa (I/O, M/I, PSA, IA/L, Buccal NB, GP, NP) 
Location by quadrants (Q1,Q2,Q3,Q4) 
amount used per quadrant
For totals, group all injection entries by anesthetic used (for example, "Articaine 4% 1:200,000 epi"), sum the ml across all selected quadrants/sites for that anesthetic, and output one `Total:` line per anesthetic after the detailed injection lines. Do not include topical Benzocaine in the totals.
"No adverse reactions noted"
"Adequate Anesthesia Achieved"


The output should look like : 

Local anesthetic administered:  No C/I to LA
Benzocaine 20% applied to the injection site
PSA Q2: Articaine 4% 1:200,000 epi 1.2 ml (at 8:38 AM)
Total: Articaine 4% 1:200,000 epi 1.2 ml
No adverse reactions noted



