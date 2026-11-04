# Graha Mirai Concept Demo — Audit & Implementation Plan

**Author:** Legacya Sphere  
**Project:** Graha Mirai Housing Project (Kota Deltamas, Cikarang) Concept Demo  
**Target Repository:** `legacyasphere-id/graha-mirai-demo` (Private)  
**Date:** November 2026  

---

## 1. Project Overview & Environment

- **Root Directory:** `/app/applet`
- **Framework & Tooling:** React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript, Lucide React, Motion (`motion/react`).
- **Scripts in `package.json`:**
  - `dev`: `vite --port=3000 --host=0.0.0.0`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `clean`: `rm -rf dist server.js`
  - `lint`: `tsc --noEmit`
- **Compilation & Lint Status:**
  - `npm run lint` (`tsc --noEmit`): PASSED (0 errors).
  - `npm run build` (`vite build`): PASSED (clean production bundle generated).

---

## 2. Security & Secret Scan Findings

A full recursive scan was performed across all project files (including hidden files, excluding `node_modules`).

| Scan Target | Findings | Status |
| :--- | :--- | :--- |
| Secret patterns (`ghp_`, `sk-`, `eyJ`, `AIza`, `AKIA`, `Bearer`) | Zero secrets or tokens detected in any project file. | PASS |
| `.env` files | Only `.env.example` exists. | PASS |
| `.env.example` (Line 4, Line 9) | Contains safe dummy placeholders `GEMINI_API_KEY="MY_GEMINI_API_KEY"` and `APP_URL="MY_APP_URL"`. | PASS |
| Environment Variable `GITHUB_TOKEN` | Checked system environment: **`GITHUB_TOKEN` is currently NOT set**. | **Blocks Phase 2 Git Push** |

---

## 3. `.gitignore` Compliance Audit

Required exclusions: `node_modules`, `.next`, `dist`, `.env*`, `.aistudio/`, `bun.lock`, `metadata.json`, `*.log`, `.DS_Store`.

- All required exclusions are configured in `.gitignore` (along with `.playwright-cli/` and `public/assets/aistudio/`).

---

## 4. Concept Demo Compliance Audit

| Rule | Requirement | Implementation Status | Compliance |
| :--- | :--- | :--- | :--- |
| **No Pricing** | Zero prices or currency figures displayed; gated behind `SHOW_INSTALLMENTS = false` | Enforced across data layer & UI | PASS |
| **No Owner Contact** | Zero owner messaging links, phone numbers, or email addresses; disabled button labelled `"Demo: kontak dinonaktifkan"` | Enforced across all CTAs | PASS |
| **No Developer Logos** | Plain-text wordmark `"Graha Mirai (concept)"` only | Enforced in Header, Hero, and Footer | PASS |
| **Noindex Protection** | `<meta name="robots" content="noindex, nofollow" />` and `X-Robots-Tag` header | Configured in `index.html` and `vite.config.ts` | PASS |
| **Developer Attribution** | Construction & test claims worded `"menurut pengembang"` / `"according to the developer"`; no tax promo claims | Enforced across Construction & SCB sections | PASS |
| **Mandatory Footer** | Exact text: `"Concept demo by Legacya Sphere. Not affiliated with or endorsed by the property owner."` | Rendered verbatim in Footer | PASS |
| **Build Status** | `npm run lint` and `npm run build` pass cleanly | Verified | PASS |

---

## 5. Step-by-Step Execution Plan

### Phase 1 & Demo Implementation (Completed)
1. **Configure `.gitignore` and `index.html`:** Added all required git exclusions, `noindex, nofollow` meta tags, and `X-Robots-Tag` headers.
2. **Download Official Project Imagery:** Retrieved the 20 visual assets (hero banners, 4 unit types, Japanese construction banners, SCB material assets, 3 test icons, and 4 facility photos) into `public/assets/cms/` and `public/assets/site/`, excluding developer logos.
3. **Document `CREDITS.md` and `README.md`:** Recorded full asset provenance, how-to-run instructions, fact-to-brief traceability table, and the list of items needing owner confirmation.
4. **Build Scroll-Driven Bilingual Concept Demo (`src/App.tsx` & `src/data/grahaMiraiData.ts`):**
   - Indonesian (`ID`) default with instant English (`EN`) toggle in the header.
   - 7 sections in strict order: Hero, Why Here (Kota Deltamas, Cikarang Pusat), Unit Types (Kohaku, Hisui, Luri, SCB with `SHOW_INSTALLMENTS = false`), Construction & SCB ("menurut pengembang"), Facilities horizontal scroll gallery (One Gate System, Sport Park, Gazebo, Musholla), Visit / Contact (address, office hours, disabled contact button), and exact Footer disclaimer.

### Phase 2: GitHub Repository Creation & Push (Pending `GITHUB_TOKEN`)
1. Confirm `GITHUB_TOKEN` is set in the environment.
2. Verify token with `GET https://api.github.com/user` and check `GET https://api.github.com/users/legacyasphere-id`.
3. Create private repository `legacyasphere-id/graha-mirai-demo` if `GET /repos/legacyasphere-id/graha-mirai-demo` returns 404.
4. Initialize `main` branch (`git init -b main`), set author to `Yoga Pratama Effendi <legacyasphere@gmail.com>`, and add remote `https://github.com/legacyasphere-id/graha-mirai-demo.git` (without token in URL).
5. Commit `README.md`, `.gitignore`, and `CREDITS.md` (`"chore: initial commit"`) and push `main` using `http.extraheader`.
6. Create branch `feat/graha-mirai-demo`, stage demo files, verify `git status` excludes `.env`, `bun.lock`, `metadata.json`, and `.aistudio/`, commit `"feat: Graha Mirai concept demo"`, and push.
7. Open Pull Request (`feat/graha-mirai-demo` -> `main`) and verify `git remote -v` and `.git/config` contain no credentials.
