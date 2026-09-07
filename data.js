/* ==========================================================
   Site content
   Edit this file to update your profile, links, skills or projects.
   No HTML changes are required for normal content updates.
   ========================================================== */

const SITE_DATA = {
  profile: {
    name: "Abbas Aghebati",
    startedYear: 2024,
    typingTitles: [
      "JavaScript Developer",
      "Backend-Focused Web Developer",
      "Telegram Bot Developer",
      "Web Application Builder"
    ]
  },

  links: [
    {
      name: "GitHub",
      description: "Code, repositories and experiments",
      url: "https://github.com/abbasaghebaty",
      tone: "github"
    },
    {
      name: "Telegram",
      description: "Direct contact",
      url: "https://t.me/abbas_js",
      tone: "telegram"
    },
    {
      name: "Telegram Channel",
      description: "Projects and updates",
      url: "https://t.me/abbas.aghebaty",
      tone: "telegram"
    },
    {
      name: "Instagram",
      description: "Personal updates",
      url: "https://instagram.com/abbas.aghebaty",
      tone: "instagram"
    },
    {
      name: "YouTube",
      description: "Videos and tutorials",
      url: "https://youtube.com/@abbas.aghebaty",
      tone: "youtube"
    }
  ],

  skills: [
    { name: "JavaScript", tone: "blue" },
    { name: "HTML & CSS", tone: "amber" },
    { name: "Backend Development", tone: "purple" },
    { name: "Telegram Bots", tone: "teal" },
    { name: "Web Applications", tone: "blue" },
    { name: "REST APIs", tone: "purple" },
    { name: "Cloudflare Workers & D1", tone: "amber" },
    { name: "Git & GitHub", tone: "teal" },
    { name: "Responsive Design", tone: "blue" }
  ],

  projects: [
    {
      name: "Increase Photo Resolution",
      description: "A browser-based image upscaling tool built around the Canvas API, with a simple and responsive workflow.",
      tags: ["JavaScript", "Canvas API", "Image Processing"],
      repo: "https://github.com/abbasaghebaty/Increase-photo-resolotion",
      demo: "https://abbasaghebaty.github.io/Increase-photo-resolotion/",
      icon: "IMG"
    },
    {
      name: "Caption Generator",
      description: "A caption-generation tool for Telegram shop content, focused on reusable templates and consistent formatting.",
      tags: ["JavaScript", "Telegram", "Automation"],
      repo: "https://github.com/abbasaghebaty/Caption-Generator",
      demo: "https://abbasaghebaty.github.io/Caption-Generator/",
      icon: "CAP"
    },
    {
      name: "YourClean Telegram Bot",
      description: "A Telegram bot for shop workflows, product lookup, customer interaction and fast access to store information.",
      tags: ["Node.js", "Telegram Bot API", "Automation"],
      repo: "https://github.com/abbasaghebaty/Yourclean-bot",
      demo: "https://t.me/YourClean_bot",
      demoLabel: "Open bot",
      icon: "BOT"
    },
    {
      name: "Shoma Shop",
      description: "A responsive storefront for a local shop, with product presentation, contact details and a cleaner customer experience.",
      tags: ["HTML", "CSS", "JavaScript"],
      repo: "https://github.com/abbasaghebaty/Shoma.shop",
      demo: "https://shoma-shop.ir/",
      icon: "SHOP"
    },
    {
      name: "Personal Portfolio",
      description: "This website — a modular personal hub for projects, social links and development work.",
      tags: ["HTML", "CSS", "JavaScript"],
      repo: "https://github.com/abbasaghebaty/about-me",
      icon: "WEB",
      current: true
    }
  ]
};
