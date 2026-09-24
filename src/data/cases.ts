/* ─────────────────────────────────────────────────────────────
   PROJECTS — the single source of truth.

   Names, numbering, URLs, roles, timelines, stacks and tags are the
   author's own. The prose is written from those facts plus each live
   site; it invents no metric or claim. p01 (VPN), p05 and p08 (staging
   offline) could not be viewed — their copy is written from the brief.

   `logo` points at a brand mark (shared where projects share a brand).
   `selected` is the static home-stack mockup, only on the featured four.
   ───────────────────────────────────────────────────────────── */

export type Case = {
  slug: string
  number: string
  title: string
  blurb: string
  tags: string[]
  role: string
  timeline: string
  stack: string[]
  liveUrl?: string
  repoUrl?: string
  /** Shown on the home stack — the four with a `selected` mockup. */
  featured?: boolean
  /** Drives the per-project accent. */
  ink: string
  problem: string
  built: string
  /** The one technical decision worth defending in a review. */
  hardPart: string
  outcome: string
  /** Detail-page screenshots. */
  shots: string[]
  /** Brand mark shown on the Work list. */
  logo: string
  /** Desktop screenshot that follows the cursor on hover. */
  preview: string
  /** Home-stack screen recording (featured only). */
  video?: string
}

const media = (n: string, shots = 4) => ({
  preview: `/projects/preview-${n}.webp`,
  shots: Array.from(
    { length: shots },
    (_, i) => `/projects/shot-${n}-${String(i + 1).padStart(2, '0')}.webp`,
  ),
})

export const cases: Case[] = [
  {
    slug: "sdgs-universitas-brawijaya",
    number: "01",
    title: "SDGs Universitas Brawijaya",
    blurb: "Internal dashboard for tracking Universitas Brawijaya's SDG progress, with role-based access.",
    tags: ["#WEB", "#DASHBOARD", "#RBAC"],
    role: "UI/UX Designer",
    timeline: "2026 · 4 months",
    stack: ["Figma", "Shadcn"],
    liveUrl: 'https://silaras.sdgs.ub.ac.id/',
    featured: true,
    ink: "#252f4c",
    problem: "The university gathers SDG progress from many units, but the data was scattered and hard to read in one view that served both leadership and operators.",
    built: "A dashboard interface with per-role access: unit operators enter data, leadership watches the summary. Flows and components designed in Figma, then laid out with Shadcn.",
    hardPart: "Serving one screen to two very different users — the people entering data and the people reading it — without leaving either short of context.",
    outcome: "The team has one visual reference for SDG progress; a person's role decides what they can see and change.",
    logo: "/projects/logo-sdgs.webp",
    video: "/projects/rec-01.mp4",
    ...media("01"),
  },
  {
    slug: "brawijaya-multi-usaha",
    number: "02",
    title: "Brawijaya Multi Usaha",
    blurb: "Company profile for Brawijaya Multi Usaha, the holding that shelters many business units under one page.",
    tags: ["#WEB", "#LANDINGPAGE", "#PROFILING"],
    role: "UI/UX Designer",
    timeline: "2026 · 4 months",
    stack: ["Figma", "Shadcn"],
    liveUrl: "https://brawijayamultiusaha.co.id/id",
    featured: true,
    ink: "#252f4c",
    problem: "Brawijaya Multi Usaha runs a range of business units, but there was no single official face explaining the group and pointing visitors to each unit.",
    built: "A company-profile landing page: the group's story up top, then the units as entry points. Structure and components designed in Figma on a Shadcn system.",
    hardPart: "Holding many units with different identities on one page without it reading as a flat list — each unit had to feel like it has a place.",
    outcome: "The group has one official page that explains itself and links visitors to each business unit.",
    logo: "/projects/logo-bmu.webp",
    video: "/projects/rec-02.mp4",
    ...media("02"),
  },
  {
    slug: "brawijaya-core",
    number: "03",
    title: "Brawijaya Core",
    blurb: "Brawijaya Core's company site with an admin panel, so its content is managed without a developer.",
    tags: ["#WEB", "#LANDINGPAGE", "#PROFILING"],
    role: "Full-stack Developer",
    timeline: "2025 · 2 months",
    stack: ["Laravel", "TypeScript", "Tailwind", "MySQL", "Filament", "Shadcn"],
    liveUrl: "https://www.brawijayacore.com/",
    featured: true,
    ink: "#545441",
    problem: "Brawijaya Core needed a profile site the team could update themselves, not a static page where every change ran through a developer.",
    built: "Built end to end with Laravel and MySQL, with a Filament admin panel so the team edits content. The front end uses Tailwind and Shadcn.",
    hardPart: "Giving non-technical staff an admin panel flexible enough to be useful without opening a gap that could break the front page.",
    outcome: "The team updates the site's content themselves through the admin panel, without waiting on a developer.",
    logo: "/projects/logo-core.webp",
    video: "/projects/rec-03.mp4",
    ...media("03"),
  },
  {
    slug: "smart-test-brawijaya-core",
    number: "04",
    title: "Smart Test by Brawijaya Core",
    blurb: "Brawijaya Core's online testing app — take a test and see results in one dashboard.",
    tags: ["#WEBAPP", "#LMS", "#DASHBOARD"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2026 · 2 months",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn"],
    liveUrl: "https://test.brawijayacore.com/",
    featured: true,
    ink: "#3a3f52",
    problem: "A manual test process made it hard for takers to sit exams and for organisers to track results in real time.",
    built: "Designed then built the exam interface: takers answer questions, organisers watch results on a dashboard. Designed in Figma, implemented with Next.js and Shadcn.",
    hardPart: "Keeping the exam flow calm and legible in use — question state, time and submission always had to be readable so a taker never second-guesses.",
    outcome: "Tests are taken online and results show immediately in one dashboard.",
    logo: "/projects/logo-core.webp",
    video: "/projects/rec-04.mp4",
    ...media("04"),
  },
  {
    slug: "brawijaya-catering",
    number: "05",
    title: "Brawijaya Catering",
    blurb: "Landing page and menu catalogue for Brawijaya Catering, from daily packages to event orders.",
    tags: ["#WEB", "#LANDINGPAGE", "#CATALOG"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2026 · 2 months",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn", "GSAP"],
    // Staging offline (404 at time of writing).
    liveUrl: undefined,
    ink: "#4a4a3a",
    problem: "A catering service needs a storefront that shows packages and menus clearly, not just a price list over chat.",
    built: "A landing page with a menu and package catalogue, designed in Figma and built with Next.js. Motion between sections uses GSAP.",
    hardPart: "Presenting many menu choices without crowding the page — the animation had to aid readability, not hide it.",
    outcome: "Prospective customers can browse packages and menus on one page before ordering.",
    logo: "/projects/logo-catering.webp",
    ...media("05"),
  },
  {
    slug: "brawijaya-tour-and-travel",
    number: "06",
    title: "Brawijaya Tour and Travel",
    blurb: "Landing page for Brawijaya Tour and Travel with a browsable catalogue of tour packages.",
    tags: ["#WEB", "#LANDINGPAGE", "#CATALOG"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2025 · 2 months",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn", "GSAP"],
    liveUrl: "https://www.brawijayatourandtravel.com/",
    ink: "#3a4258",
    problem: "Tour packages needed to be shown attractively and made easy to compare, not just handed out on a brochure.",
    built: "A landing page with a travel-package catalogue, designed in Figma and built with Next.js plus GSAP motion for a sense of life.",
    hardPart: "Making each package feel inviting through image and motion while keeping the page quick to open.",
    outcome: "Tour packages sit in one browsable storefront for prospective customers.",
    logo: "/projects/logo-btt.webp",
    ...media("06"),
  },
  {
    slug: "depo-agro",
    number: "07",
    title: "Depo Agro",
    blurb: "Depo Agro's storefront — a tidy catalogue of farming supplies, from seeds to tools.",
    tags: ["#WEB", "#LANDINGPAGE", "#CATALOG"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2025 · 2 months",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn"],
    liveUrl: "https://www.depoagro.id/",
    ink: "#3f4a3a",
    problem: "A wide range of agricultural products was hard to lay out neatly so visitors could quickly find what they came for.",
    built: "A landing page with a categorised product catalogue, designed in Figma and built with Next.js and Shadcn.",
    hardPart: "Arranging many product types so they stay easy to browse — grouping and hierarchy had to read from the first screen.",
    outcome: "Depo Agro's products show categorised and easy to browse in one storefront.",
    logo: "/projects/logo-depoagro.webp",
    ...media("07"),
  },
  {
    slug: "assets-bmu",
    number: "08",
    title: "Assets BMU",
    blurb: "Internal app for recording and managing Brawijaya Multi Usaha's assets.",
    tags: ["#WEB", "#ASSETMANAGEMENT", "#DASHBOARD"],
    role: "Backend & Frontend Developer",
    timeline: "2026 · 2 months",
    stack: ["Express.js", "Next.js", "PostgreSQL", "Prisma", "TypeScript", "Tailwind", "Shadcn"],
    // Staging offline (404 at time of writing).
    liveUrl: undefined,
    ink: "#54543f",
    problem: "Scattered company assets were hard to track — their whereabouts and condition — without a single record.",
    built: "An asset-tracking app: an Express API over PostgreSQL via Prisma, with a Next.js and Shadcn dashboard.",
    hardPart: "Keeping asset records consistent as data grows — the schema and relations had to stay clean so each asset's history never blurs.",
    outcome: "Assets are recorded in one place, with their condition and history.",
    logo: "/projects/logo-bmu.webp",
    ...media("08"),
  },
  {
    slug: "feedback-bmu",
    number: "09",
    title: "Feedback BMU",
    blurb: "Brawijaya Multi Usaha's feedback channel — a public form plus a dashboard to follow up.",
    tags: ["#WEB", "#FORM", "#DASHBOARD"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2025 · 1 month",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn"],
    liveUrl: "https://feedback.brawijayamultiusaha.co.id/",
    ink: "#2b3450",
    problem: "Feedback from the public and partners arrived through many channels and was hard to collect and act on tidily.",
    built: "A short public feedback form, plus an internal dashboard to read and sort submissions. Designed in Figma, built with Next.js.",
    hardPart: "Making the form short enough that people will fill it in, yet still capturing enough context for the team to act.",
    outcome: "Feedback comes in through one channel and the team reviews it from one dashboard.",
    logo: "/projects/logo-bmu.webp",
    ...media("09"),
  },
  {
    slug: "due-diligence-form-bmu",
    number: "10",
    title: "Due Diligence Form BMU",
    blurb: "BMU's legal due-diligence form with a dashboard for reviewing submissions.",
    tags: ["#WEB", "#FORM", "#DASHBOARD"],
    role: "UI/UX Designer, Frontend Developer",
    timeline: "2025 · 1 month",
    stack: ["Figma", "Next.js", "TypeScript", "Tailwind", "Shadcn"],
    liveUrl: "https://legal.brawijayamultiusaha.co.id/",
    ink: "#2b3450",
    problem: "Legal due diligence needs structured collection of data and documents, not files scattered across email.",
    built: "A staged due-diligence form with document upload, plus a dashboard to review submissions. Designed in Figma and built with Next.js.",
    hardPart: "Breaking a long form into stages that don't tire the user while keeping the data legally required complete.",
    outcome: "Due-diligence data is collected in a structured way and reviewed from one dashboard.",
    logo: "/projects/logo-bmu.webp",
    ...media("10"),
  },
  {
    slug: "coe-cbsa",
    number: "11",
    title: "CoE CBSA",
    blurb: "Site for Universitas Brawijaya's centre of excellence in community-based sustainable agroindustry.",
    tags: ["#WEB", "#LANDINGPAGE", "#CMS"],
    role: "Full-stack Developer",
    timeline: "2026 · 4 months",
    stack: ["Figma", "Laravel", "TypeScript", "Tailwind", "MySQL", "Shadcn", "GSAP"],
    liveUrl: "https://stg-coecbsa.vercel.app/",
    ink: "#2f3a5c",
    problem: "The centre combines research, technology and community empowerment, but had no single home to convey its programs and collaborations.",
    built: "A company-profile site plus CMS: content managed through Laravel and MySQL, the front end in Tailwind with GSAP motion. Design direction set in Figma.",
    hardPart: "Arranging many kinds of program content so the team can manage it while it still reads as one coherent narrative up front.",
    outcome: "The centre has one site that explains its programs and invites collaboration, with content it manages itself.",
    logo: "/projects/logo-coecbsa.webp",
    ...media("11"),
  },
  {
    slug: "kembara-id",
    number: "12",
    title: "Kembara.id",
    blurb: "Kembara.id — rent mountain gear with automatic payment, from tents to carriers.",
    tags: ["#WEBAPP", "#PRODUCT", "#B2C"],
    role: "Full-stack Developer",
    timeline: "2026 · 2 months",
    stack: ["Laravel", "Next.js", "TypeScript", "Tailwind", "MySQL", "Shadcn", "GSAP", "Render", "Vercel", "Midtrans"],
    liveUrl: "https://stg-kembara.vercel.app/",
    ink: "#3a4258",
    problem: "Renting mountain gear is usually still manual: check availability over chat, pay separately, with no single place to order.",
    built: "My own product: a rental catalogue with ordering and automatic payment via Midtrans. Laravel backend on Render, Next.js front end on Vercel.",
    hardPart: "Keeping gear availability accurate while orders and payments run at once — stock had to be right before money changes hands.",
    outcome: "A rental can be ordered and paid automatically in one place, without back-and-forth chat.",
    logo: "/projects/logo-kembara.webp",
    ...media("12"),
  },
  {
    slug: "saku-mini-wallet",
    number: "13",
    title: "Saku Mini Wallet",
    blurb: "Saku Mini Wallet — balance, cash flow and wallet activity in one summary.",
    tags: ["#WEBAPP", "#PRODUCT", "#FINTECH"],
    role: "Full-stack Developer",
    timeline: "2026 · 2 months",
    stack: ["Laravel", "Next.js", "TypeScript", "Tailwind", "MySQL", "Shadcn", "GSAP", "Render", "Vercel"],
    liveUrl: "https://stg-saku.vercel.app/",
    ink: "#4a4a3a",
    problem: "Tracking money in and out of a small wallet is often messy without one clear summary.",
    built: "A mini wallet by Kembara.id: balance, cash flow and recent activity on one page. Laravel backend on Render, Next.js front end on Vercel.",
    hardPart: "Showing money accurately — every balance and entry has to stay consistent and never mislead, however small the figure.",
    outcome: "A user sees their balance, cash flow and latest activity in one summary.",
    logo: "/projects/logo-saku.webp",
    ...media("13"),
  },
  {
    slug: "dibiedu-lms",
    number: "14",
    title: "DibiEdu LMS",
    blurb: "DibiEdu — an LMS for bootcamp classes: materials, courses and a learner dashboard.",
    tags: ["#WEBAPP", "#LMS", "#DASHBOARD"],
    role: "Full-stack Developer",
    timeline: "2026 · 2 months",
    stack: ["Laravel", "Next.js", "TypeScript", "Tailwind", "MySQL", "Shadcn", "GSAP", "Render", "Vercel"],
    liveUrl: "https://dibiedu-lms.vercel.app/",
    ink: "#63593f",
    problem: "A bootcamp class needs one place for materials, courses and learner tracking, not scattered files.",
    built: "A full LMS: course listings, materials and a learner dashboard. Laravel backend on Render, Next.js front end on Vercel.",
    hardPart: "Structuring materials and learner progress so they stay clear as courses multiply — navigation must not get complicated too.",
    outcome: "Materials, courses and bootcamp learner progress live in one place.",
    logo: "/projects/logo-dibiedu.webp",
    ...media("14"),
  },
]

/** The home page stack — the featured four. */
export const featured = cases.filter((c) => c.featured)

export const getCase = (slug?: string) => cases.find((c) => c.slug === slug)

export const caseNeighbours = (slug: string) => {
  const i = cases.findIndex((c) => c.slug === slug)
  if (i === -1) return { prev: undefined, next: undefined }
  return {
    prev: i > 0 ? cases[i - 1] : cases[cases.length - 1],
    next: i < cases.length - 1 ? cases[i + 1] : cases[0],
  }
}
