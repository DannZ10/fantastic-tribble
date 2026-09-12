/* ─────────────────────────────────────────────────────────────
   IDENTITY — edit this file and the whole site follows.

   Every value below marked TODO is a placeholder waiting on real
   copy. Nothing else in the codebase hardcodes any of it.
   ───────────────────────────────────────────────────────────── */

export const site = {
  /** Shown in the header lockup. TODO: confirm */
  name: 'DZI',
  /** Full name for the About page. TODO: confirm */
  fullName: 'Dann',
  /** Header eyebrow, like BARCELONA, SPAIN on the reference. TODO: confirm */
  location: 'Malang, Indonesia',
  /** Public contact address. TODO: confirm this is the one to show */
  email: 'hamdan.ysf26@gmail.com',
  domain: 'dannzone.site',
  url: 'https://dannzone.site',

  /**
   * The big title behind the hero subject. Cycles every 5 seconds.
   * Keep these short — they are set very large and must not wrap.
   */
  heroRoles: ['FULL-STACK DEV', 'WEB ENGINEER', 'PRODUCT BUILDER', 'UI ENGINEER'],

  /** The two lines flanking the subject, bottom left and bottom right. */
  roleLeft: 'Full-stack developer',
  roleRight: 'End-to-end / ships it',

  /** Ticker on the Work page. */
  marquee: [
    'TypeScript',
    'React',
    'Node',
    'Postgres',
    'Vite',
    'Design systems',
    'Web performance',
  ],

  /** About page body. TODO: replace with your own voice */
  bio: "I'm Dann, a full-stack developer who builds web products end to end. I work mostly in TypeScript — React on the front, Node and Postgres behind it — and I care about the parts of a product that are felt rather than seen: how fast it responds, whether it holds up on a bad connection, whether it still makes sense a year later. I design as well as build, so I can take an idea from an empty repository to something people use without thinking about it.",

  /** TODO: confirm handles. Remove any you don't want shown. */
  socials: [
    { label: 'Instagram', short: 'ig', href: 'https://instagram.com/' },
    { label: 'GitHub', short: 'gh', href: 'https://github.com/' },
    { label: 'LinkedIn', short: 'in', href: 'https://linkedin.com/in/' },
  ],
} as const

export type Site = typeof site
