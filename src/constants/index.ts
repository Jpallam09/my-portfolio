// index.js
export const servicesData = [
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
      { title: "MongoDB, Redis" },
      { title: "Redis" },
    ],
  },
  {
    title: "Deployment",
    description:
      "Getting a product live should be simple. I handle environments, hosting, and release pipelines so updates ship without drama.",
    items: [
      { title: "Vercel" },
      { title: "Hostinger VPS" },
      { title: "Render" }
    ],
  },
];
export const projects = [
  {
    id: 1,
    name: "Mobile Accessories E-commerce",
    description:
      "An online store specializing in phone accessories including cases, chargers, cables, and power banks with MagSafe compatibility.",
    href: "",
    image: "/assets/projects/mobile-accessories-store.jpg",
    bgImage: "/assets/backgrounds/blanket.jpg",
    frameworks: [
      { id: 1, name: "React" },
      { id: 2, name: "Next.js" },
      { id: 3, name: "Node.js" },
      { id: 4, name: "MongoDB" },
      { id: 5, name: "Tailwind CSS" },
    ],
  },
  {
    id: 2,
    name: "Plant Shop E-commerce",
    description:
      "An online store specializing in rare and decorative plants with a clean, user-friendly interface.",
    href: "",
    image: "/assets/projects/plant-shop.jpg",
    bgImage: "/assets/backgrounds/curtains.jpg",
    frameworks: [
      { id: 1, name: "React" },
      { id: 2, name: "Next.js" },
      { id: 3, name: "Stripe API" },
      { id: 4, name: "Tailwind CSS" },
    ],
  },
  {
    id: 3,
    name: "Apple Tech Marketplace",
    description:
      "An e-commerce platform for Apple products and accessories with deals and category filtering.",
    href: "",
    image: "/assets/projects/apple-tech-store.jpg",
    bgImage: "/assets/backgrounds/map.jpg",
    frameworks: [
      { id: 1, name: "Blazor" },
      { id: 2, name: "ASP.NET Core" },
      { id: 3, name: "SQL Server" },
      { id: 4, name: "Bootstrap" },
    ],
  },
  {
    id: 4,
    name: "Electronics & Gadgets Store",
    description:
      "A multi-category online shop featuring electronics, home appliances, and gaming gear with special offers.",
    href: "",
    image: "/assets/projects/electronics-store.jpg",
    bgImage: "/assets/backgrounds/poster.jpg",
    frameworks: [
      { id: 1, name: "Vue.js" },
      { id: 2, name: "Laravel" },
      { id: 3, name: "MySQL" },
      { id: 4, name: "SCSS" },
    ],
  },
  {
    id: 5,
    name: "Home Decor Marketplace",
    description:
      "A curated collection of designer home decor items, including furniture and artisan vases.",
    href: "",
    image: "/assets/projects/home-decor-store.jpg",
    bgImage: "/assets/backgrounds/table.jpg",
    frameworks: [
      { id: 1, name: "Angular" },
      { id: 2, name: "Firebase" },
      { id: 3, name: "GraphQL" },
      { id: 4, name: "Material UI" },
    ],
  },
  {
    id: 6,
    name: "Digital Game Store",
    description:
      "A gaming platform featuring discounted titles, top sellers, and genre-based browsing.",
    href: "",
    image: "/assets/projects/game-store.jpg",
    bgImage: "/assets/backgrounds/curtains.jpg",
    frameworks: [
      { id: 1, name: "Svelte" },
      { id: 2, name: "Node.js" },
      { id: 3, name: "MongoDB" },
      { id: 4, name: "Chakra UI" },
    ],
  },
];
export const socials = [
  { name: "Instagram", href: "https://www.instagram.com/ali.sanatidev/reels/" },
  {
    name: "Youtube",
    href: "https://www.youtube.com/channel/UCZhtUWTtk3bGJiMPN9T4HWA",
  },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/ali-sanati/" },
  { name: "GitHub", href: "https://github.com/Ali-Sanati" },
];

// Marquee word lists. These live here rather than inside the sections so the
// array is the same object on every render. The Marquee component rebuilds its
// animation whenever its items prop changes, and a list written inline in a
// component (`const items = ["a", "b"]`) is a brand new array each time, which
// means the animation would restart on every unrelated re-render.
export const marqueeValues = [
  "Innovation",
  "Precision",
  "Trust",
  "Collaboration",
  "Excellence",
];

// The repeating-item marquees are copied several times so the text has to be
// wide enough to fill the screen at any size. One copy is never enough.
export const marqueeRepeat = (text: string, count = 6) =>
  Array.from({ length: count }, () => text);

