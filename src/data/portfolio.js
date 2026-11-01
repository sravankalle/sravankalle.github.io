/*
 * ─────────────────────────────────────────────────────────────
 *  All site content lives here. Edit this file to update the site.
 * ─────────────────────────────────────────────────────────────
 *
 *  Each carousel item:
 *    id         unique string
 *    category   'projects' | 'experience' | 'education' | 'skills'
 *    title      shown large on the card (keep it short: ~2 lines)
 *    meta       one line under the title (company, school, role…)
 *    period     dates, shown in the detail panel
 *    summary    a short paragraph for the detail panel
 *    highlights optional bullet points for the detail panel
 *    tags       technologies/keywords; shown on the card and as chips
 *    links      optional [{ label, url }]
 *    icon       the 3D shape on the card — one of: chart, institution, ticket,
 *               gamepad, mic, shield, pin, chat, certificate, cap, code,
 *               layers, database, cloud, gear, nodes (see components/Icons.jsx)
 */

export const profile = {
  name: 'Sravan Kalle',
  role: 'Software Engineer',
  tagline:
    'I build scalable software — from fintech platforms and multi-tenant ERPs to real-time multiplayer games.',
  location: 'Bengaluru',
  available: true,
  links: [
    { label: 'GitHub', url: 'https://github.com/sravankalle' },
    { label: 'Email', url: 'mailto:sravan.dhira@gmail.com' },
    // To add a résumé link: put the PDF at public/resume.pdf and uncomment.
    // { label: 'Résumé', url: '/resume.pdf' },
  ],
}

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Stack' },
]

// Small label printed on each card.
export const categoryLabels = {
  projects: 'Project',
  experience: 'Experience',
  education: 'Education',
  skills: 'Stack',
}

export const items = [
  // ── Experience ───────────────────────────────────────────
  {
    id: 'e-qapita',
    icon: 'chart',
    category: 'experience',
    title: 'Software Development Engineer',
    meta: 'Qapita · Fintech',
    period: 'Jan 2025 — Present',
    summary:
      'Working on Qapita’s fintech platform in C# and .NET — opening it up to new kinds of users and helping take the product to the US market. Built with domain-driven design, test-driven development and event sourcing.',
    highlights: [
      'Enabled the platform for different types of users through a dashboards framework',
      'Improved the product for US users as part of the US go-to-market',
      'Built features for seamless migrations from Charles Schwab’s Equiview to Qapita',
    ],
    tags: ['C#', '.NET', 'DDD', 'TDD', 'Event sourcing', 'Fintech'],
  },
  {
    id: 'e-saksham',
    icon: 'institution',
    category: 'experience',
    title: 'Lead Backend Engineer',
    meta: 'Saksham · Bengaluru',
    period: 'Jun 2023 — 2024',
    summary:
      'Building a multi-tenant ERP for colleges — a single source of truth for academic and administrative data, designed to scale across many institutions.',
    highlights: [
      'Role-based access control (RBAC) that maps roles and permissions across diverse organisational structures',
      'Marks and Bloom’s taxonomy calculations that show students where they’re doing well and where to improve',
      'Built-in attendance and marks registers for real-time tracking by professors',
      'NLP engine that turns voice or typed queries into Excel reports of academic data',
    ],
    tags: ['Multi-tenant', 'RBAC', 'NLP', 'Scalability'],
  },
  {
    id: 'e-bmsce-fests',
    icon: 'ticket',
    category: 'experience',
    title: 'Software Developer & Team Lead',
    meta: 'BMSCE Fests · Bengaluru',
    period: 'Oct 2021 — Mar 2023',
    summary:
      'Led the digitisation of event registration and ticketing for the flagship festivals at BMS College of Engineering.',
    highlights: [
      'Microservice architecture for scalable, real-time registration across platforms',
      'Real-time ticket management and analytics dashboards for organisers',
      'Ticket inventory tracking and dynamic pricing',
      '100% increase in sales over previous years through frictionless registration and payment flows',
    ],
    tags: ['Microservices', 'Ticketing', 'Payments', 'Analytics'],
  },
  {
    id: 'e-mindtrak',
    icon: 'gamepad',
    category: 'experience',
    title: 'Backend Developer',
    meta: 'MindTrak Technologies · Bengaluru',
    period: 'Oct 2020 — Feb 2021',
    summary:
      'Backend for a real-time multiplayer mobile game, built for low latency and high concurrency.',
    highlights: [
      'Scalable APIs on MongoDB and AWS with high availability',
      'Matchmaking algorithms and core game logic on a JavaScript backend',
      'Server-side optimisation for low-latency gameplay during peak activity',
    ],
    tags: ['JavaScript', 'MongoDB', 'AWS', 'Real-time'],
  },
  {
    id: 'e-protocol',
    icon: 'mic',
    category: 'experience',
    title: 'Vice President',
    meta: 'Protocol Club · BMSCE',
    period: 'May 2021 — Apr 2022',
    summary:
      'Organised and ran club events including workshops and seminars, and mentored junior members.',
    highlights: [
      'Coordinated workshops and seminars on diverse technical topics',
      'Guided and supported junior members in their development',
    ],
    tags: ['Leadership', 'Events', 'Mentoring'],
  },

  // ── Projects ─────────────────────────────────────────────
  {
    id: 'p-topic-mod-bot',
    icon: 'shield',
    category: 'projects',
    title: 'Topic Moderation Bot',
    meta: 'Discord moderation by meaning, not keywords',
    period: '2026',
    summary:
      'A Discord bot that catches messages about banned topics by what they mean. Each server sets its own topics, and an LLM judge reads every new or edited message alongside the recent conversation to decide whether it matches.',
    highlights: [
      'LLM judge with structured outputs and channel context, so slang, indirect references and replies are caught while “lol” as laughter isn’t',
      '/topic add turns a topic name into a precise description, example messages and aliases using the model',
      'Local pre-filter (alias match + embedding similarity) scores every message so clearly unrelated ones can skip the LLM',
      'Safe rollout: log-only by default, confidence threshold, daily LLM call cap, then per-server switch to auto-delete',
      'Dashboard (Hono API + Next.js) showing every verdict, the context the model saw, its confidence and reasoning — with Correct/Wrong labelling',
      'Eval toolkit: synthetic cases plus labelled verdicts give per-topic precision/recall across thresholds',
      'Privacy-minded retention: unlabelled message text is cleared after 30 days',
    ],
    tags: ['TypeScript', 'discord.js', 'OpenAI', 'Embeddings', 'SQLite', 'Hono', 'Next.js'],
  },
  {
    id: 'p-parkit',
    icon: 'pin',
    category: 'projects',
    title: 'Park It',
    meta: 'Real-time parking reservations app',
    summary:
      'A cross-platform mobile app for reserving parking spots in real time, with in-app car services you can book while parked.',
    highlights: [
      'Live lot selection and availability tracking',
      'Schedule cleaning or maintenance while the car is parked',
      'One codebase for iOS and Android',
    ],
    tags: ['TypeScript', 'React Native'],
  },
  {
    id: 'p-whatsapp',
    icon: 'chat',
    category: 'projects',
    title: 'WhatsApp API Wrapper',
    meta: 'Simpler WhatsApp Business API integration',
    summary:
      'A wrapper around the WhatsApp Cloud API that abstracts the intricate calls behind simple methods for messages, contacts and media.',
    highlights: [
      'Simplified message handling, contact management and media sharing',
      'Plug-and-play setup that shortens integration time',
    ],
    tags: ['TypeScript', 'WhatsApp Cloud API'],
    links: [{ label: 'Source', url: 'https://github.com/sravankalle/whatsapp-cloud-api-wrapper' }],
  },
  {
    id: 'p-renamer',
    icon: 'certificate',
    category: 'projects',
    title: 'Batch Certificate Renamer',
    meta: 'OCR-powered bulk file renaming',
    summary:
      'A Python script that reads text from certificate images with OCR and renames files automatically — no more renaming hundreds of files by hand.',
    highlights: [
      'Extracts the relevant text from each image for context-aware names',
      'Handles large batches of image-based documents',
    ],
    tags: ['Python', 'Tesseract OCR'],
  },

  // ── Education ────────────────────────────────────────────
  {
    id: 'ed-bmsce',
    icon: 'cap',
    category: 'education',
    title: 'B.E. Computer Science',
    meta: 'BMS College of Engineering · Bengaluru',
    period: '2019 — 2023',
    summary: 'Bachelor of Engineering in Computer Science.',
    highlights: ['Vice President, Protocol Club', 'Software Developer & Team Lead, BMSCE Fests'],
    tags: ['Computer Science'],
  },

  // ── Stack / technologies ─────────────────────────────────
  {
    id: 's-languages',
    icon: 'code',
    category: 'skills',
    title: 'Languages',
    meta: 'What I write',
    summary: 'Programming languages I work in.',
    tags: ['C#', 'Python', 'TypeScript', 'JavaScript', 'Java', 'Go', 'C'],
  },
  {
    id: 's-frameworks',
    icon: 'layers',
    category: 'skills',
    title: 'Frameworks',
    meta: 'Backend, web and mobile',
    summary: 'Frameworks I build with.',
    tags: ['.NET', 'React', 'Spring', 'Flask', 'Hono', 'Express', 'Svelte', 'React Native'],
  },
  {
    id: 's-practices',
    icon: 'nodes',
    category: 'skills',
    title: 'Architecture',
    meta: 'How I design and build',
    summary: 'Design approaches and practices I use day to day.',
    tags: ['DDD', 'TDD', 'Event sourcing', 'Microservices'],
  },
  {
    id: 's-databases',
    icon: 'database',
    category: 'skills',
    title: 'Databases',
    meta: 'Relational, document and cache',
    summary: 'Datastores I use.',
    tags: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'],
  },
  {
    id: 's-cloud',
    icon: 'cloud',
    category: 'skills',
    title: 'Cloud',
    meta: 'Where things run',
    summary: 'Cloud platforms I deploy to.',
    tags: ['AWS', 'GCP', 'Linode', 'DigitalOcean'],
  },
  {
    id: 's-tools',
    icon: 'gear',
    category: 'skills',
    title: 'Tools',
    meta: 'Build, ship, collaborate',
    summary: 'Day-to-day tooling.',
    tags: ['Jenkins', 'Docker', 'Git', 'Jira'],
  },
]
