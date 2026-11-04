# Graha Mirai (Concept) — 3D Property Preview

> **Concept demo by Legacya Sphere. Not affiliated with or endorsed by the property owner.**

An interactive, single-screen **3D property preview** for the **Graha Mirai** housing project (Kota Deltamas, Cikarang). Built by **Legacya Sphere** as a private concept piece to show the property owner how a procedural 3D unit and plot viewer could work.

---

## 1. How to Run

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Type-check & lint
npm run lint

# Run unit & compliance tests
npx --yes tsx --test src/data/units.test.ts

# Build production bundle
npm run build
```

---

## 2. Unit Data & Source Traceability Table

All factual unit numbers are stored in `src/data/units.ts` and sourced strictly from `graha-mirai-asset-brief.md` without prices, installment figures, availability, unit counts, distances, or construction/safety guarantees:

| Type | Land (LT) | Building (LB) | Rooms | Assumed Storeys | Brief Source Section |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Kohaku** | 55 m² | 31 m² | 2 bedrooms, 1 bathroom, 1 carport | 1 *(assumed)* | Section 2 ("Unit types") & Section 5 ("Image inventory") |
| **Hisui** | 66 m² | 37 m² | 2 bedrooms, 1 bathroom, 1 carport | 1 *(assumed)* | Section 2 ("Unit types") & Section 5 ("Image inventory") |
| **Luri** | 66 m² | 37 m² | 2 bedrooms, 1 bathroom, 1 carport | 1 *(assumed)* | Section 2 ("Unit types") & Section 5 ("Image inventory") |
| **SCB** | 72 m² | 72 m² | 2+1 bedrooms, 2 bathrooms, 1 carport | 2 *(assumed)* | Section 2 ("Unit types") & Section 5 ("Image inventory") |

---

## 3. Modeling Assumptions ("Visualisasi konsep, tidak sesuai skala")

Because official CAD drawings and floor plans have not been published, the procedural 3D builder (`src/utils/houseBuilder.ts`) applies the following transparent assumptions (also listed in the in-app **"Tentang model ini" / "About this model"** popover):

1. **Plot Proportions (`LT`):** Plot areas match the published `LT` figures (`55 m²`, `66 m²`, `66 m²`, `72 m²`) using assumed frontage widths (`5.5 m × 10.0 m` for Kohaku; `6.0 m × 11.0 m` for Hisui and Luri; `6.0 m × 12.0 m` for SCB).
2. **Storey Counts:** Kohaku, Hisui, and Luri are modeled as 1-storey residences; SCB is modeled as a 2-storey residence (`36 m²` footprint × 2 storeys = `72 m²` LB).
3. **Footprint & Setbacks:** Building footprint is computed as `LB ÷ assumedStoreys`, positioned on the plot slab with a front carport bay and raised front garden planter strip.
4. **Stylized Facade Geometry & Palette:** Roof silhouettes (`flat-parapet`, `pitched-gable`, `dual-parapet`, `two-storey-box`), window frames, carport canopies, and neutral surface colors are stylized from the developer's reference facade photos (`public/assets/cms/unit-*.webp`) and do not represent official architectural construction drawings.

---

## 4. Items Needing Owner Confirmation

Before any official or public release, the following items require confirmation from the property owner (**PT Hajime Indonesia Jaya**):

- **Storey Counts & Official Floor Plans:** Confirm the exact storey counts, room dimensions, and architectural drawings for Kohaku, Hisui, Luri, and SCB.
- **Exact Plot Dimensions (Width × Depth):** Confirm the actual lot frontage and depth per unit type from the official site plan.
- **3D Massing & Roof Details:** Confirm rear/side window placements and roof profiles against engineering blueprints.
- **Written Authorization:** Written approval from the property owner before replacing the `"Graha Mirai (concept)"` wordmark or removing `noindex, nofollow` restrictions.
