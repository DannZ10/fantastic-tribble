/* ─────────────────────────────────────────────────────────────
   PROJECTS — the single source of truth.

   The home stack, the Work list, the routes, the prev/next nav and
   the detail pages all read from this array.

   ⚠ The names, numbering and URLs below are REAL. The prose fields
   (blurb, problem, built, hardPart, outcome), the roles, the dates
   and the stacks are NOT filled in — they are marked TODO rather
   than invented, because these are real clients and real systems and
   a plausible-sounding fabrication about them would be worse than an
   obvious blank. Fill them from PROJECTS-INTAKE.md.
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
  /** Shown on the home page — currently the ones whose media has landed. */
  featured?: boolean
  /** Drives the per-project accent. */
  ink: string
  problem: string
  built: string
  /** The one technical decision worth defending in a review. */
  hardPart: string
  outcome: string
  /** Frame sequence for the scroll-scrubbed phone (featured only). */
  frames: { dir: string; count: number }
  /** Detail-page screenshots. */
  shots: string[]
  /** Small mark shown in place of a "Project NN" label on the Work page. */
  logo: string
  /** Desktop screenshot that follows the cursor on hover. */
  preview: string
}

/** Deliberately obvious, so it can never be mistaken for finished copy. */
const TODO = 'TODO — belum diisi. Lihat PROJECTS-INTAKE.md.'
const TODO_STACK = ['Stack belum diisi']

const media = (n: string, shots = 2) => ({
  logo: `/projects/logo-${n}.webp`,
  preview: `/projects/preview-${n}.webp`,
  frames: { dir: `/frames/case${n}`, count: 48 },
  shots: Array.from(
    { length: shots },
    (_, i) => `/projects/shot-${n}-${String(i + 1).padStart(2, '0')}.webp`,
  ),
})

export const cases: Case[] = [
  {
    slug: 'sdgs-universitas-brawijaya',
    number: '01',
    title: 'SDGs Universitas Brawijaya',
    blurb: TODO,
    tags: ['#INTERNAL'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    // Internal, reachable only over VPN — no public link, on purpose.
    liveUrl: undefined,
    ink: '#252f4c',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('01'),
  },
  {
    slug: 'brawijaya-multi-usaha',
    number: '02',
    title: 'Brawijaya Multi Usaha',
    blurb: TODO,
    tags: ['#WEB'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    liveUrl: 'https://brawijayamultiusaha.co.id/',
    featured: true,
    ink: '#252f4c',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('02'),
  },
  {
    slug: 'brawijaya-core',
    number: '03',
    title: 'Brawijaya Core',
    blurb: TODO,
    tags: ['#WEB'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    liveUrl: 'https://www.brawijayacore.com/',
    featured: true,
    ink: '#545441',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('03'),
  },
  {
    slug: 'smart-test-brawijaya-core',
    number: '04',
    title: 'Smart Test by Brawijaya Core',
    blurb: TODO,
    tags: ['#WEBAPP'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    liveUrl: 'https://test.brawijayacore.com/',
    featured: true,
    ink: '#3a3f52',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('04'),
  },
  {
    slug: 'brawijaya-catering',
    number: '05',
    title: 'Brawijaya Catering',
    blurb: TODO,
    tags: ['#WEB'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    // URL menyusul.
    liveUrl: undefined,
    ink: '#4a4a3a',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('05'),
  },
  {
    slug: 'brawijaya-tour-and-travel',
    number: '06',
    title: 'Brawijaya Tour and Travel',
    blurb: TODO,
    tags: ['#WEB'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    liveUrl: 'https://www.brawijayatourandtravel.com/',
    ink: '#3a4258',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('06'),
  },
  {
    slug: 'depo-agro',
    number: '07',
    title: 'Depo Agro',
    blurb: TODO,
    tags: ['#WEB'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    liveUrl: 'https://www.depoagro.id/',
    ink: '#3f4a3a',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('07'),
  },
  {
    slug: 'feedback-bmu',
    number: '08',
    title: 'Feedback BMU',
    blurb: TODO,
    tags: ['#WEBAPP'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    liveUrl: 'https://feedback.brawijayamultiusaha.co.id/',
    ink: '#54543f',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('08'),
  },
  {
    slug: 'due-diligence-form-bmu',
    number: '09',
    title: 'Due Diligence Form BMU',
    blurb: TODO,
    tags: ['#WEBAPP', '#LEGAL'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    liveUrl: 'https://legal.brawijayamultiusaha.co.id/',
    ink: '#2b3450',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('09'),
  },
  {
    slug: 'coe-cbsa',
    number: '10',
    title: 'CoE CBSA',
    blurb: TODO,
    tags: ['#WEBAPP', '#STAGING'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    liveUrl: 'https://stg-coecbsa.vercel.app/',
    ink: '#2f3a5c',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('10'),
  },
  {
    slug: 'kembara-id',
    number: '11',
    title: 'Kembara.id',
    blurb: TODO,
    tags: ['#PRODUCT', '#STAGING'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    liveUrl: 'https://stg-kembara.vercel.app/',
    ink: '#3a4258',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('11'),
  },
  {
    slug: 'saku-mini-wallet',
    number: '12',
    title: 'Saku Mini Wallet',
    blurb: TODO,
    tags: ['#PRODUCT', '#FINTECH', '#STAGING'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    liveUrl: 'https://stg-saku.vercel.app/',
    // The demo login is deliberately NOT stored here. This repository is
    // public; anything committed to it is published along with it.
    ink: '#4a4a3a',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('12'),
  },
  {
    slug: 'dibiedu-lms',
    number: '13',
    title: 'DibiEdu LMS',
    blurb: TODO,
    tags: ['#LMS', '#BOOTCAMP'],
    role: TODO,
    timeline: TODO,
    stack: TODO_STACK,
    liveUrl: 'https://dibiedu-lms.vercel.app/',
    ink: '#63593f',
    problem: TODO,
    built: TODO,
    hardPart: TODO,
    outcome: TODO,
    ...media('13'),
  },
]

/** The home page stack — only projects whose media is actually in place. */
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
