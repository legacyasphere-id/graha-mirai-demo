/**
 * Graha Mirai 3D Property Preview — Bilingual Dictionary (ID default, EN toggle)
 * Keep all UI strings in this single dictionary file.
 */

export type Language = 'id' | 'en';

export const EXACT_WORDMARK = 'Graha Mirai (concept)';

export const EXACT_CONCEPT_BADGE = 'Visualisasi konsep, tidak sesuai skala';

export const EXACT_REFERENCE_CAPTION = 'Foto referensi dari situs pengembang';

export const EXACT_FOOTER_DISCLAIMER =
  'Concept demo by Legacya Sphere. Not affiliated with or endorsed by the property owner.';

export const DICTIONARY = {
  id: {
    header: {
      locationTag: 'Kota Deltamas, Cikarang',
      aboutModelBtn: 'Tentang model ini',
      langLabel: 'Bahasa',
    },
    badge: {
      primary: EXACT_CONCEPT_BADGE,
      secondary: 'Concept visualization, not to scale',
    },
    picker: {
      label: 'Pilih Tipe Rumah',
      unitPrefix: 'Tipe',
    },
    angles: {
      groupLabel: 'Sudut Pandang Kamera',
      front: 'Depan',
      left: 'Kiri',
      right: 'Kanan',
      back: 'Belakang',
      aerial: 'Aerial (45°)',
      top: 'Dalam Rumah',
      reset: 'Reset ke Depan',
      autoRotate: 'Putar Otomatis',
      autoRotateOn: 'Putar: Aktif',
      autoRotateOff: 'Putar: Nonaktif',
      insidePreviewOn: 'Mode: Dalam (3D)',
      insidePreviewOff: 'Lihat Dalam (3D)',
      floor1: 'Lantai 1',
      floor2: 'Lantai 2',
      orbitHint: 'Geser untuk memutar · Cubit / gulir untuk zoom',
    },
    info: {
      panelTitle: 'Spesifikasi Tipe',
      toggleShow: 'Detail & Foto Referensi',
      toggleHide: 'Tutup Detail',
      landArea: 'Luas Tanah (LT)',
      buildingArea: 'Luas Bangunan (LB)',
      rooms: 'Komposisi Ruang',
      assumedStoreys: 'Asumsi Tingkat',
      storeyUnit: 'lantai (asumsi)',
      footprintCalc: 'Jejak Bangunan (LB ÷ Lantai)',
      plotCalc: 'Proporsi Kavling (Asumsi)',
      interiorConceptBadge: 'Tata ruang dalam 3D konseptual (denah resmi perlu konfirmasi pemilik)',
      referenceCaption: EXACT_REFERENCE_CAPTION,
      referenceAltPrefix: 'Foto referensi fasad tipe',
    },
    aboutPopover: {
      title: 'Tentang Model 3D & Daftar Asumsi',
      subtitle:
        'Pratinjau 3D ini adalah konsep interaktif oleh Legacya Sphere untuk menunjukkan potensi visualisasi tipe rumah Graha Mirai. Bukan situs resmi pengembang.',
      closeBtn: 'Tutup',
      assumptionsHeading: 'Asumsi Pemodelan Prosedural (Perlu Konfirmasi Pemilik)',
      assumptions: [
        'Arsitektur Cluster (Tanpa Jendela Samping): Dinding kiri dan kanan dimodelkan penuh selebar kavling sebagai dinding pembatas cluster (blind party wall) tanpa jendela samping, lengkap dengan parapet pembatas dan tembok halaman belakang.',
        'Pratinjau Dalam Rumah (Cutaway 3D): Tata letak kamar tidur, kamar mandi, ruang keluarga, dapur, dan tangga pada tampilan "Dalam Rumah" adalah ilustrasi konseptual sesuai jumlah ruang resmi, karena denah arsitektur resmi belum dipublikasikan.',
        'Proporsi Kavling (LT): Luas tanah mengikuti angka resmi (Kohaku 55 m², Hisui 66 m², Luri 66 m², SCB 72 m²), namun rasio lebar-ke-panjang kavling (5,5 m hingga 6,0 m lebar) adalah asumsi konseptual.',
        'Jumlah Lantai: Kohaku, Hisui, dan Luri diasumsikan 1 lantai; tipe SCB diasumsikan 2 lantai (jejak dasar 36 m² × 2 lantai = LB 72 m²). Perlu konfirmasi pemilik proyek.',
        'Detail Fasad & Tekstur PBR: Kanopi V-strut Kohaku, atap pelana asimetris & kisi kayu Hisui, bingkai jendela proyeksi Luri, serta batu alam susun sirih & balkon SCB dimodelkan secara prosedural dari foto referensi fasad, bukan gambar kerja CAD/BIM resmi.',
      ],
      sourceNote:
        'Sumber data faktual: Situs publik Graha Mirai (Nov 2026) — hanya mencakup nama tipe, LT, LB, jumlah kamar tidur, kamar mandi, dan carport.',
    },
    fallback: {
      title: 'Pratinjau 3D Tidak Tersedia pada Perangkat Ini',
      message:
        'WebGL tidak aktif atau tidak didukung pada peramban ini. Menampilkan foto referensi fasad dan spesifikasi tipe unit.',
    },
  },
  en: {
    header: {
      locationTag: 'Kota Deltamas, Cikarang',
      aboutModelBtn: 'About this model',
      langLabel: 'Language',
    },
    badge: {
      primary: EXACT_CONCEPT_BADGE,
      secondary: 'Concept visualization, not to scale',
    },
    picker: {
      label: 'Select House Type',
      unitPrefix: 'Type',
    },
    angles: {
      groupLabel: 'Camera Viewing Angle',
      front: 'Front',
      left: 'Left',
      right: 'Right',
      back: 'Back',
      aerial: 'Aerial (45°)',
      top: 'Inside Preview',
      reset: 'Reset to Front',
      autoRotate: 'Auto-rotate',
      autoRotateOn: 'Rotate: On',
      autoRotateOff: 'Rotate: Off',
      insidePreviewOn: 'Inside View: On',
      insidePreviewOff: 'Inside Preview (3D)',
      floor1: '1st Floor',
      floor2: '2nd Floor',
      orbitHint: 'Drag to orbit · Pinch / scroll to zoom',
    },
    info: {
      panelTitle: 'Unit Specifications',
      toggleShow: 'Specs & Reference Photo',
      toggleHide: 'Hide Specs',
      landArea: 'Land Area (LT)',
      buildingArea: 'Building Area (LB)',
      rooms: 'Rooms',
      assumedStoreys: 'Assumed Storeys',
      storeyUnit: 'storey(s) (assumed)',
      footprintCalc: 'Footprint (LB ÷ Storeys)',
      plotCalc: 'Plot Dimensions (Assumed)',
      interiorConceptBadge: 'Conceptual 3D interior room layout (official floor plan needs owner confirmation)',
      referenceCaption: `${EXACT_REFERENCE_CAPTION} (Reference photo from developer site)`,
      referenceAltPrefix: 'Facade reference photo for type',
    },
    aboutPopover: {
      title: 'About This 3D Model & Assumptions',
      subtitle:
        'This 3D preview is a private concept tool by Legacya Sphere to demonstrate how an interactive house viewer could work for Graha Mirai. It is not the official site.',
      closeBtn: 'Close',
      assumptionsHeading: 'Procedural Modeling Assumptions (Needs Owner Confirmation)',
      assumptions: [
        'Cluster Party-Wall Architecture (No Side Windows): Left and right elevations are modeled flush to the lot width as solid blind cluster party walls with parapet copings and enclosed rear courtyard walls.',
        'Plot Proportions (LT): Total land area matches published numbers (Kohaku 55 m², Hisui 66 m², Luri 66 m², SCB 72 m²), while plot width-to-depth ratios (5.5 m to 6.0 m frontage) are conceptual assumptions.',
        'Storey Counts: Kohaku, Hisui, and Luri are assumed to be 1-storey homes; SCB is assumed to be 2 storeys (36 m² footprint × 2 = 72 m² LB). Needs owner confirmation.',
        'Facade Details & PBR Surfaces: Kohaku V-strut pergola, Hisui asymmetric gable window and wood louvers, Luri projecting box frames, and SCB stacked slate stone and balcony loggia are procedurally stylized from facade reference photos rather than CAD/BIM drawings.',
      ],
      sourceNote:
        'Factual data source: Graha Mirai public website (Nov 2026) — limited strictly to unit name, LT, LB, bedrooms, bathrooms, and carport count.',
    },
    fallback: {
      title: '3D Preview Unavailable on This Device',
      message:
        'WebGL is disabled or unavailable in this browser. Showing the unit facade reference photo and published specifications instead.',
    },
  },
} as const;
