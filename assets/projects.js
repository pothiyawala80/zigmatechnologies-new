/* ============================================================
   ZIGMA — PAST WORK / PROJECT LIST
   ------------------------------------------------------------
   This ONE file feeds the "Work" section of every design.
   To add a project: copy one { ... } block, paste it at the
   top of the list, and change the text. Save. Done.

   Easier still: open  add-project.html  in your browser, fill
   the form, and it gives you a ready block to paste here.

   Fields
     title     (required)  Project name
     client    (optional)  Client or company name
     category  (required)  e.g. "Web App", "Mobile", "AI", "Cloud"
     year      (optional)  e.g. "2025"
     summary   (required)  One short line about what you did
     tags      (optional)  ["React", "AWS"]  – tech used
     image     (optional)  "assets/work/my-shot.jpg"  – leave "" for an auto cover
     link      (optional)  "https://..."  – live site / case study
     color     (optional)  "#7c5cff"  – accent for the auto cover

   ⚠ The four entries below are EXAMPLES — replace them with
     your real projects before going live.
   ============================================================ */

window.ZIGMA_PROJECTS = [
  {
    title: "CarePulse Patient Portal",
    client: "Example Healthcare Client",
    category: "Web App",
    year: "2025",
    summary: "Appointment booking, records and tele-consults in one secure portal.",
    tags: ["Ruby on Rails", "React", "AWS"],
    image: "",
    link: "",
    color: "#22d3ee"
  },
  {
    title: "EstateIQ Listings",
    client: "Example Real-Estate Client",
    category: "Mobile",
    year: "2025",
    summary: "Cross-platform property app with map search and virtual tours.",
    tags: ["React Native", "Firebase"],
    image: "",
    link: "",
    color: "#a78bfa"
  },
  {
    title: "ShelfSense Retail AI",
    client: "Example Retail Client",
    category: "AI / ML",
    year: "2024",
    summary: "Demand forecasting model that cut stock-outs across 40 stores.",
    tags: ["Python", "TensorFlow", "GCP"],
    image: "",
    link: "",
    color: "#f472b6"
  },
  {
    title: "FleetTrack Logistics",
    client: "Example Logistics Client",
    category: "Cloud / IoT",
    year: "2024",
    summary: "Real-time fleet dashboard with IoT sensors and route analytics.",
    tags: ["Azure", "IoT", "DevOps"],
    image: "",
    link: "",
    color: "#facc15"
  }
];
