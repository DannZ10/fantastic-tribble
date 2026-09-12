/* ─────────────────────────────────────────────────────────────
   CASE STUDIES — the single source of truth.

   The home page stack, the routes, the prev/next nav and the detail
   pages all read from this array. Adding a fourth case is one entry
   here and nothing else.

   ⚠ PLACEHOLDER CONTENT. Every case below is realistic but invented,
   so the site can be built and reviewed before your real write-ups
   land. Replace the prose, keep the shape.
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
  /** Drives the per-card accent. Overrides --case-ink on that card. */
  ink: string
  problem: string
  built: string
  /** The one technical decision worth defending in a review. */
  hardPart: string
  outcome: string
  /** Frame sequence for the scroll-scrubbed phone. */
  frames: { dir: string; count: number }
  /** Detail-page screenshots. */
  shots: string[]
  /** Small mark shown in place of a "Project NN" label on the Work page. */
  logo: string
  /** Desktop screenshot that follows the cursor on hover. */
  preview: string
}

export const cases: Case[] = [
  {
    slug: 'realtime-order-dashboard',
    number: '01',
    logo: '/projects/logo-01.webp',
    preview: '/projects/preview-01.webp',
    title: 'Realtime order dashboard',
    blurb: 'An operations console that keeps forty warehouse staff looking at the same numbers at the same moment.',
    tags: ['#FULLSTACK', '#REALTIME'],
    role: 'Sole developer — schema, API, interface',
    timeline: '4 months · 2025',
    stack: ['TypeScript', 'React', 'Node', 'Postgres', 'WebSocket'],
    liveUrl: undefined,
    repoUrl: undefined,
    ink: '#252f4c',
    problem:
      'Order state lived in three places — a spreadsheet, a chat thread and someone\'s memory. Two people could pick the same order and neither would find out until the packing bench. The floor was losing roughly an hour a day to reconciliation.',
    built:
      'A single console backed by one Postgres table as the source of truth, with a WebSocket fan-out so every connected client sees a state change within a frame or two of it committing. Optimistic UI on the client, but the server is authoritative — a rejected write rolls the client back visibly rather than silently.',
    hardPart:
      'Optimistic updates and a realtime feed fight each other: the echo of your own write arrives after you already applied it, and naive handling makes the row flicker. I tagged every mutation with a client-generated id and had the server echo it back, so a client can recognise its own write and skip re-applying it. Rows from other clients apply normally. The flicker disappeared and the code got shorter.',
    outcome:
      'Double-picks went to zero in the first week. Median time from status change to it appearing on another screen is under 200ms on the warehouse wifi.',
    frames: { dir: '/frames/case01', count: 48 },
    shots: ['/work/1.webp', '/work/2.webp', '/work/3.webp'],
  },
  {
    slug: 'field-survey-offline',
    number: '02',
    logo: '/projects/logo-02.webp',
    preview: '/projects/preview-02.webp',
    title: 'Offline-first field survey',
    blurb: 'A data collection tool for agricultural surveyors working where there is no signal at all.',
    tags: ['#OFFLINE', '#PWA'],
    role: 'Full-stack — sync engine and interface',
    timeline: '3 months · 2025',
    stack: ['TypeScript', 'React', 'IndexedDB', 'Node', 'Postgres'],
    liveUrl: undefined,
    repoUrl: undefined,
    ink: '#545441',
    problem:
      'Surveyors were filling in paper forms in the field and re-typing them at the office that evening. Transcription introduced errors nobody could trace back, and a full day of work could be lost to a soaked notebook.',
    built:
      'A progressive web app that treats the network as an optional extra. Every response is written to IndexedDB immediately and queued; when a connection appears, the queue drains in order. The surveyor never sees a loading state and never needs to know whether they are online.',
    hardPart:
      'Two surveyors editing the same household record offline for three days produces a genuine conflict, and last-write-wins would quietly destroy someone\'s afternoon. I moved the sync unit from the record to the individual field with a timestamp per field, so two people editing different questions on the same household merge cleanly. Only a true same-field conflict surfaces to a human, and that turned out to be about 1% of cases.',
    outcome:
      'Transcription was eliminated. Survey turnaround went from same-evening to same-minute, and the error rate on numeric fields dropped by roughly two thirds.',
    frames: { dir: '/frames/case02', count: 48 },
    shots: ['/work/4.webp', '/work/5.webp', '/work/6.webp'],
  },
  {
    slug: 'component-library',
    number: '03',
    logo: '/projects/logo-03.webp',
    preview: '/projects/preview-03.webp',
    title: 'Design system and component library',
    blurb: 'One set of components, four product teams, and an end to every team inventing its own button.',
    tags: ['#DESIGNSYSTEM', '#DX'],
    role: 'Lead — architecture, tokens, docs',
    timeline: '6 months · 2024–2025',
    stack: ['TypeScript', 'React', 'CSS custom properties', 'Vite'],
    liveUrl: undefined,
    repoUrl: undefined,
    ink: '#3a3f52',
    problem:
      'Four teams had shipped four button components, three modal implementations and two conflicting spacing scales. A visual change agreed in a design review took weeks to land because it had to be made four times, and it never landed identically.',
    built:
      'A component library built on CSS custom properties rather than a runtime theming layer, so themes cost nothing at render time and can be scoped to any subtree with a single class. Every component ships with its accessibility behaviour already handled — focus management, keyboard interaction, reduced motion — so teams cannot skip it by accident.',
    hardPart:
      'The hard problem was not technical, it was adoption. A library nobody migrates to is worse than no library, because now there are five buttons. I wrote a codemod that rewrote the three most common legacy imports automatically and shipped it alongside the first release, so migrating was a pull request rather than a project. Adoption went from opt-in to near-total in about six weeks.',
    outcome:
      'A token change now ships to all four products in one pull request. Bundle size dropped by 34KB gzipped, mostly from deleting the duplicate implementations.',
    frames: { dir: '/frames/case03', count: 48 },
    shots: ['/work/7.webp', '/work/8.webp', '/work/9.webp'],
  },
  // ── Placeholders beyond the first three, so the Work page's pagination is
  // ── real. Replace each with an actual project; delete any you don't need.
  {
    slug: 'invoice-automation',
    number: '04',
    logo: '/projects/logo-04.webp',
    preview: '/projects/preview-04.webp',
    title: 'Invoice automation service',
    blurb: 'A background worker that turns a mailbox full of PDFs into reconciled ledger entries.',
    tags: ['#BACKEND', '#AUTOMATION'],
    role: 'Backend developer',
    timeline: '2 months · 2024',
    stack: ['TypeScript', 'Node', 'Postgres'],
    ink: '#2f3a5c',
    problem: 'Finance re-keyed every supplier invoice by hand, which cost two days a month and produced errors nobody could trace.',
    built: 'A queue-backed worker that reads the mailbox, extracts line items, matches them against purchase orders, and posts only what it is confident about. Anything ambiguous goes to a review screen rather than being guessed.',
    hardPart: 'Confidence scoring. Auto-posting a wrong entry is far more expensive than asking a human, so the threshold is deliberately conservative and every auto-posted entry keeps the source snippet it came from.',
    outcome: 'Around 80% of invoices post without a human touching them; the rest arrive pre-filled.',
    frames: { dir: '/frames/case01', count: 48 },
    shots: ['/work/10.webp', '/work/11.webp'],
  },
  {
    slug: 'booking-platform',
    number: '05',
    logo: '/projects/logo-05.webp',
    preview: '/projects/preview-05.webp',
    title: 'Multi-tenant booking platform',
    blurb: 'One codebase serving twelve venues, each convinced the product was built for them.',
    tags: ['#SAAS', '#MULTITENANT'],
    role: 'Full-stack developer',
    timeline: '5 months · 2024',
    stack: ['TypeScript', 'React', 'Node', 'Postgres', 'Stripe'],
    ink: '#4a4a3a',
    problem: 'Each venue had its own forked deployment. A bug fix meant twelve pull requests, and the forks had drifted far enough that some no longer applied cleanly.',
    built: 'A single application with tenant resolution at the edge, row-level isolation in Postgres, and per-tenant theming driven entirely by CSS custom properties so a brand change costs no runtime work.',
    hardPart: 'Collapsing twelve drifted forks into one schema without losing anyone data. I wrote a reconciliation migration that ran against each fork inside a transaction and refused to commit if row counts did not match.',
    outcome: 'Twelve deployments became one. Onboarding a venue went from a week to an afternoon.',
    frames: { dir: '/frames/case02', count: 48 },
    shots: ['/work/12.webp', '/work/13.webp'],
  },
  {
    slug: 'analytics-pipeline',
    number: '06',
    logo: '/projects/logo-06.webp',
    preview: '/projects/preview-06.webp',
    title: 'Event analytics pipeline',
    blurb: 'Clickstream ingestion that stays honest about what it dropped.',
    tags: ['#DATA', '#PIPELINE'],
    role: 'Backend developer',
    timeline: '3 months · 2024',
    stack: ['TypeScript', 'Node', 'Postgres', 'Redis'],
    ink: '#3a4258',
    problem: 'Product decisions were being made on dashboard numbers nobody could reproduce, and the pipeline silently discarded malformed events.',
    built: 'An ingestion service that validates at the edge, writes rejects to a dead-letter table with the reason attached, and shows both accepted and rejected counts on the same dashboard.',
    hardPart: 'Making the drop rate visible rather than hidden. The moment rejects were on the dashboard, three long-standing instrumentation bugs surfaced in a week.',
    outcome: 'Every dashboard figure is now reproducible from raw events.',
    frames: { dir: '/frames/case03', count: 48 },
    shots: ['/work/1.webp', '/work/2.webp'],
  },
  {
    slug: 'design-tokens-cli',
    number: '07',
    logo: '/projects/logo-07.webp',
    preview: '/projects/preview-07.webp',
    title: 'Design token CLI',
    blurb: 'One token source, four platform outputs, zero hand-copied hex codes.',
    tags: ['#TOOLING', '#DX'],
    role: 'Sole developer',
    timeline: '6 weeks · 2024',
    stack: ['TypeScript', 'Node'],
    ink: '#3f4a3a',
    problem: 'Designers changed a colour in Figma and it reached production weeks later, differently, in each of four codebases.',
    built: 'A CLI that reads one token file and emits CSS custom properties, Swift, Kotlin and a JSON contract, with a check mode that fails CI when a platform has drifted.',
    hardPart: 'Getting the check mode to fail usefully. It reports which token, which platform, and what the expected value was, so the fix is obvious without opening the tool.',
    outcome: 'Token drift stopped being a recurring bug class.',
    frames: { dir: '/frames/case01', count: 48 },
    shots: ['/work/3.webp', '/work/4.webp'],
  },
  {
    slug: 'inventory-sync',
    number: '08',
    logo: '/projects/logo-08.webp',
    preview: '/projects/preview-08.webp',
    title: 'Inventory sync bridge',
    blurb: 'Keeping a warehouse system and a storefront agreeing on what exists.',
    tags: ['#INTEGRATION', '#RETAIL'],
    role: 'Full-stack developer',
    timeline: '2 months · 2023',
    stack: ['TypeScript', 'Node', 'Postgres'],
    ink: '#54543f',
    problem: 'The storefront oversold stock it no longer had, because the warehouse export ran nightly and the shop assumed it was live.',
    built: 'A bridge that reconciles continuously, treats the warehouse as authoritative, and holds a short reservation window on the storefront so a checkout in progress cannot be undercut.',
    hardPart: 'Deciding what to do when the two disagree. Rather than picking a winner silently, disagreements are logged with both values and resolved toward the warehouse, which made the underlying export bug findable.',
    outcome: 'Oversells dropped to near zero within a month.',
    frames: { dir: '/frames/case02', count: 48 },
    shots: ['/work/5.webp', '/work/6.webp'],
  },
  {
    slug: 'docs-search',
    number: '09',
    logo: '/projects/logo-09.webp',
    preview: '/projects/preview-09.webp',
    title: 'Documentation search',
    blurb: 'Full-text search over internal docs that actually finds the runbook.',
    tags: ['#SEARCH', '#INTERNAL'],
    role: 'Sole developer',
    timeline: '4 weeks · 2023',
    stack: ['TypeScript', 'Node', 'Postgres'],
    ink: '#2b3450',
    problem: 'Internal documentation existed but nobody could find anything in it, so the same questions were asked in chat every week.',
    built: 'Postgres full-text search with weighted fields, typo tolerance, and result snippets showing the matched line in context, with no external search service to operate.',
    hardPart: 'Ranking. Title matches had to beat body matches decisively, otherwise a long page mentioning a term twenty times buried the page actually about it.',
    outcome: 'Repeat questions in the support channel fell noticeably; the search box became the default first stop.',
    frames: { dir: '/frames/case03', count: 48 },
    shots: ['/work/7.webp', '/work/8.webp'],
  },
]


/** The three shown on the home page. */
export const featured = cases.slice(0, 3)

export const getCase = (slug?: string) => cases.find((c) => c.slug === slug)

export const caseNeighbours = (slug: string) => {
  const i = cases.findIndex((c) => c.slug === slug)
  if (i === -1) return { prev: undefined, next: undefined }
  return {
    prev: i > 0 ? cases[i - 1] : cases[cases.length - 1],
    next: i < cases.length - 1 ? cases[i + 1] : cases[0],
  }
}
