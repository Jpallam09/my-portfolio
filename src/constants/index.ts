// The shape of each entry below is declared here, next to the data, so the
// arrays are checked against it as they are written. The sections import these
// types instead of redeclaring their own, which is what makes renaming a field
// below a compile error rather than a runtime `undefined`.
export type ServiceItem = {
  title: string;
};

export type Service = {
  title: string;
  description: string;
  items: ServiceItem[];
};

export type Framework = {
  id: number;
  name: string;
};

export type Project = {
  id: number;
  name: string;
  description: string;
  href: string;
  image: string;
  frameworks: Framework[];
};

export type Social = {
  name: string;
  href: string;
};

export const servicesData: Service[] = [
  {
    title: "Frontend",
    description:
      "Interfaces should feel effortless to use. I focus on responsive layouts, accessible interactions, and smooth motion so the product feels right on any device.",
    items: [
      { title: "React, TypeScript" },
      { title: "Tailwind CSS, shadcn/ui" },
      { title: "GSAP" },
    ],
  },
  {
    title: "Backend",
    description:
      "Good products need solid foundations. I work on API design, authentication, and server logic that stays reliable as traffic grows.",
    items: [
      { title: "Node.js, Next.js" },
      { title: "Laravel" },
      { title: "Django" },
    ],
  },
  {
    title: "Database",
    description:
      "Everything depends on the data layer. I work on schema design, query performance, and caching to keep things fast and consistent.",
    items: [
      { title: "MySQL, PostgreSQL" },
      { title: "MongoDB" },
      { title: "Redis" },
    ],
  },
  {
    title: "Deployment",
    description:
      "Getting a product live should be simple. I handle environments, hosting, and release pipelines so updates ship without drama.",
    items: [
      { title: "Vercel" },
      { title: "Hostinger VPS, Render" }
    ],
  },
];
export const projects: Project[] = [
  {
    id: 1,
    name: "SMND Document Management System",
    description:
      "A desktop application for managing district-wide teacher records and administrative documents, built for DepEd San Mateo North. Runs on Electron with offline-first file handling and external drive sync.",
    href: "https://github.com/Jpallam09/smnd-dms",
    image: "/assets/projects/smnd-ddms.webp",
    frameworks: [
      { id: 1, name: "Electron" },
      { id: 2, name: "React" },
      { id: 3, name: "Tailwind CSS" },
      { id: 4, name: "Shadcn/ui" },
    ],
  },
  {
    id: 2,
    name: "MDRRMO Incident Reporting System",
    description:
      "A municipal incident reporting platform with role-based dashboards, geotagged reports, an approval workflow for edits and deletions, and Meilisearch-powered search across records.",
    href: "https://github.com/Jpallam09/mdrrmo-smi",
    image: "/assets/projects/mdrrmo.webp",
    frameworks: [
      { id: 1, name: "Laravel" },
      { id: 2, name: "PHP" },
      { id: 3, name: "MySQL" },
      { id: 5, name: "Vite" },
    ],
  },
  {
    id: 3,
    name: "Quiz Review App",
    description:
      "An offline-first Expo app where admins manage reviewers and quizzes while users read and take them. Attempts save locally to SQLite and sync to Supabase when a connection is available.",
    href: "https://github.com/Jpallam09/expo-review-quiz-app",
    image: "/assets/projects/quiz-app-thumbnail.webp",
    frameworks: [
      { id: 1, name: "React Native" },
      { id: 2, name: "Expo" },
      { id: 3, name: "TypeScript" },
      { id: 4, name: "Supabase" },
      { id: 5, name: "SQLite" },
    ],
  },
  {
    id: 4,
    name: "FDAS Digital Archive System",
    description:
      "A Django document archive that organizes uploaded files into nested folders with typed categories, in-browser previews, and password protection for confidential records.",
    href: "https://github.com/Jpallam09/fdas",
    image: "/assets/projects/fdas.webp",
    frameworks: [
      { id: 1, name: "Django" },
      { id: 2, name: "Python" },
      { id: 3, name: "SQLite" },
    ],
  },
];
export const socials: Social[] = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/johnpaulallam/" },
  { name: "GitHub", href: "https://github.com/jpallam09" },
];

// Marquee word lists. These live here rather than inside the sections so the
// array is the same object on every render. The Marquee component rebuilds its
// animation whenever its items prop changes, and a list written inline in a
// component (`const items = ["a", "b"]`) is a brand new array each time, which
// means the animation would restart on every unrelated re-render.
export const marqueeValues: string[] = [
  "Scalability",
  "Performance",
  "Clean Code",
  "Reliability",
  "Usability",
];

// The repeating-item marquees are copied several times so the text has to be
// wide enough to fill the screen at any size. One copy is never enough.
export const marqueeRepeat = (text: string, count = 6) =>
  Array.from({ length: count }, () => text);

