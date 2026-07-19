/**
 * Static mock data for Phase 4.2 visual layout prototypes.
 * This file supports UI rendering only. It contains no business logic.
 */
export const mockSubjects = [
  {
    id: "mathematics",
    title: "Mathematics",
    subtitle: "Algebra, calculus, statistics",
    count: 28,
    accent: "#70b4ff",
  },
  {
    id: "physics",
    title: "Physics",
    subtitle: "Mechanics, thermodynamics, optics",
    count: 18,
    accent: "#9bd57e",
  },
  {
    id: "chemistry",
    title: "Chemistry",
    subtitle: "Organic, inorganic, analysis",
    count: 14,
    accent: "#ffb86c",
  },
  {
    id: "programming",
    title: "Programming",
    subtitle: "Python, JavaScript, data structures",
    count: 22,
    accent: "#8f94ff",
  },
  {
    id: "biology",
    title: "Biology",
    subtitle: "Cell systems, genetics, ecology",
    count: 12,
    accent: "#69d4c6",
  },
  {
    id: "history",
    title: "History",
    subtitle: "Civilizations, revolutions, culture",
    count: 10,
    accent: "#ff8fc7",
  },
];

const sharedVideoBase = [
  {
    id: "math-01",
    title: "Vector spaces and linear transformations",
    subject: "Mathematics",
    duration: "1h 12m",
    resolution: "1080p",
    progress: 38,
    isNew: false,
    added: "Today",
    description: "A foundational lecture on vector spaces, bases, and transformations.",
  },
  {
    id: "math-02",
    title: "Differential equations patterns",
    subject: "Mathematics",
    duration: "54m",
    resolution: "720p",
    progress: 0,
    isNew: true,
    added: "1 day ago",
    description: "Visual walkthrough of linear differential equations and stability.",
  },
  {
    id: "phys-01",
    title: "Newton’s laws in the real world",
    subject: "Physics",
    duration: "47m",
    resolution: "1080p",
    progress: 76,
    isNew: false,
    added: "3 days ago",
    description: "Applied physics examples using real-life motion and force diagrams.",
  },
  {
    id: "phys-02",
    title: "Waves, sound, and oscillations",
    subject: "Physics",
    duration: "1h 03m",
    resolution: "1080p",
    progress: 0,
    isNew: true,
    added: "Today",
    description: "An introductory tour of wave motion, frequency, and harmonic systems.",
  },
  {
    id: "chem-01",
    title: "Organic molecules and bonding",
    subject: "Chemistry",
    duration: "58m",
    resolution: "1080p",
    progress: 14,
    isNew: false,
    added: "5 days ago",
    description: "Core concepts of organic chemistry with structure and notation.",
  },
  {
    id: "chem-02",
    title: "Chemical equilibrium made simple",
    subject: "Chemistry",
    duration: "49m",
    resolution: "720p",
    progress: 0,
    isNew: false,
    added: "1 week ago",
    description: "Strategies for solving equilibrium systems and reaction quotients.",
  },
  {
    id: "prog-01",
    title: "Asynchronous JavaScript patterns",
    subject: "Programming",
    duration: "39m",
    resolution: "1080p",
    progress: 0,
    isNew: true,
    added: "Today",
    description: "A visual introduction to async/await, promises, and task coordination.",
  },
  {
    id: "prog-02",
    title: "Data structures in practice",
    subject: "Programming",
    duration: "1h 08m",
    resolution: "1080p",
    progress: 22,
    isNew: false,
    added: "2 days ago",
    description: "Comparing lists, trees, and maps with real code examples.",
  },
  {
    id: "bio-01",
    title: "Genetics and inheritance patterns",
    subject: "Biology",
    duration: "52m",
    resolution: "720p",
    progress: 0,
    isNew: false,
    added: "1 week ago",
    description: "Fundamentals of genes, alleles, and Mendelian inheritance.",
  },
  {
    id: "bio-02",
    title: "Ecosystems and food webs",
    subject: "Biology",
    duration: "43m",
    resolution: "1080p",
    progress: 11,
    isNew: false,
    added: "4 days ago",
    description: "How energy flows through ecosystems and the science of biomes.",
  },
  {
    id: "hist-01",
    title: "The industrial revolution in context",
    subject: "History",
    duration: "46m",
    resolution: "1080p",
    progress: 0,
    isNew: false,
    added: "2 weeks ago",
    description: "A narrative of social and technological change in the 19th century.",
  },
  {
    id: "hist-02",
    title: "Modern world politics overview",
    subject: "History",
    duration: "59m",
    resolution: "1080p",
    progress: 4,
    isNew: false,
    added: "6 days ago",
    description: "A survey of contemporary political movements and institutions.",
  },
  {
    id: "math-03",
    title: "Probability and random variables",
    subject: "Mathematics",
    duration: "51m",
    resolution: "1080p",
    progress: 0,
    isNew: false,
    added: "1 day ago",
    description: "Statistical intuition for probability distributions and events.",
  },
  {
    id: "phys-03",
    title: "Thermodynamics fundamentals",
    subject: "Physics",
    duration: "1h 15m",
    resolution: "720p",
    progress: 0,
    isNew: false,
    added: "3 days ago",
    description: "Heat, work, and energy concepts for introductory thermodynamics.",
  },
  {
    id: "prog-03",
    title: "Software architecture patterns",
    subject: "Programming",
    duration: "1h 20m",
    resolution: "1080p",
    progress: 0,
    isNew: false,
    added: "5 days ago",
    description: "A high-level guide to modules, services, and maintainable systems.",
  },
  {
    id: "chem-03",
    title: "Reactions and stoichiometry",
    subject: "Chemistry",
    duration: "44m",
    resolution: "1080p",
    progress: 0,
    isNew: false,
    added: "2 days ago",
    description: "Core stoichiometry calculations for reaction quantities.",
  },
  {
    id: "bio-03",
    title: "Cellular communications",
    subject: "Biology",
    duration: "38m",
    resolution: "1080p",
    progress: 0,
    isNew: true,
    added: "Today",
    description: "Signal transduction and cellular messaging systems.",
  },
  {
    id: "hist-03",
    title: "Ancient civilizations primer",
    subject: "History",
    duration: "41m",
    resolution: "720p",
    progress: 0,
    isNew: false,
    added: "1 week ago",
    description: "A concise look at early empires and their lasting influence.",
  },
];

export const mockStats = [
  { label: "Subjects", value: "6", helper: "Organized topic collections" },
  { label: "Videos", value: "20", helper: "Static layout preview" },
  { label: "Resume", value: "5", helper: "Continue watching cards" },
  { label: "Activity", value: "8", helper: "Recent offline actions" },
];

export const mockContinueWatching = [
  sharedVideoBase[0],
  sharedVideoBase[2],
  sharedVideoBase[7],
];

export const mockRecentlyAdded = [
  sharedVideoBase[1],
  sharedVideoBase[3],
  sharedVideoBase[12],
  sharedVideoBase[17],
];

export const mockActivity = [
  {
    title: "Resume: Waves, sound, and oscillations",
    meta: "Physics · 76% complete",
    timestamp: "2h ago",
  },
  {
    title: "Added: Asynchronous JavaScript patterns",
    meta: "Programming · New",
    timestamp: "Today",
  },
  {
    title: "Review: Chemical equilibrium made simple",
    meta: "Chemistry · 14m watched",
    timestamp: "Yesterday",
  },
];

export const mockSearchSuggestions = [
  "Neural networks",
  "Differential equations",
  "Quantum mechanics",
  "Cell signaling",
  "Industrial revolution",
];

export const mockFavorites = [
  {
    title: "Historic engineering achievements",
    subtitle: "History",
  },
];

export const mockHistory = [
  {
    title: "Quantum mechanics lecture",
    description: "Continued from 23m ago",
    time: "Today",
  },
  {
    title: "Organic molecules and bonding",
    description: "Completed 4 days ago",
    time: "Yesterday",
  },
  {
    title: "Data structures in practice",
    description: "Started 2 days ago",
    time: "3 days ago",
  },
];

export const mockSettings = [
  {
    section: "Appearance",
    controls: [
      { label: "Theme", value: "System", type: "select" },
      { label: "Navigation density", value: "Cozy", type: "select" },
    ],
  },
  {
    section: "Playback",
    controls: [
      { label: "Default speed", value: "1x", type: "select" },
      { label: "Autoplay next", value: "Disabled", type: "switch" },
    ],
  },
  {
    section: "Storage",
    controls: [
      { label: "Cache location", value: "Local downloads", type: "text" },
      { label: "Download limit", value: "None", type: "text" },
    ],
  },
  {
    section: "Library",
    controls: [
      { label: "Source path", value: "downloads/", type: "text" },
      { label: "Auto-scan", value: "Disabled", type: "switch" },
    ],
  },
];

export const mockAbout = {
  version: "4.2.0-preview",
  build: "static-ui-shell",
  description: "A production-ready layout preview for the offline study library.",
};

export const mockPlayer = {
  title: "Vector spaces and linear transformations",
  subject: "Mathematics",
  duration: "1h 12m",
  resolution: "1080p",
  description: "A foundational walkthrough of vector spaces, bases, and transformations for offline learning.",
};

export const mockUpNext = [
  sharedVideoBase[7],
  sharedVideoBase[12],
  sharedVideoBase[5],
];

export const mockRelated = [
  sharedVideoBase[0],
  sharedVideoBase[10],
  sharedVideoBase[16],
];

export const mockRecentSearches = [
  "offline library UI",
  "thermodynamics",
  "calculus review",
  "history timeline",
];

export const mockFilters = [
  { label: "All subjects", type: "dropdown" },
  { label: "Newest first", type: "dropdown" },
  { label: "Any duration", type: "dropdown" },
];
