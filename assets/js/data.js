// ==========================================================================
// Site content. Kept faithful to the original about-me page — only the
// structure/presentation around it changed.
// ==========================================================================

export const GITHUB_USERNAME = "abbasaghebaty";

export const profile = {
  name: "Abbas Aghebaty",
  role: "JavaScript Developer · Web Developer · Open Source Creator",
  initials: "AA",
  location: "Tehran, Iran",
  timezone: "Asia/Tehran",
  bio: [
    "I build fast, responsive front-ends and small automation tools — from static websites and Telegram bots to Mini Apps — and share most of it as open source.",
    "Alongside development I also work on the visual side of projects: UI design, thumbnails, photo editing and menu design for local cafes and restaurants."
  ],
  focus: [
    {
      title: "Front-end engineering",
      desc: "Responsive, static-first websites built with plain JavaScript, HTML and CSS."
    },
    {
      title: "Telegram products",
      desc: "Bots and Mini Apps for stores and shop owners, from lookup tools to automation."
    },
    {
      title: "Visual design",
      desc: "UI design, thumbnails and menu design for cafes and restaurants."
    }
  ],
  journey: [
    {
      period: "Ongoing",
      title: "Building in public",
      desc: "Shipping small tools and static sites, publishing the source for each on GitHub."
    },
    {
      period: "Telegram ecosystem",
      title: "Bots & Mini Apps",
      desc: "Learned the Telegram Bot API and Mini Apps platform building tools for real shop owners."
    },
    {
      period: "Foundations",
      title: "JavaScript, HTML & CSS",
      desc: "Started with static websites and front-end fundamentals, then moved into interactive UI."
    }
  ]
};

export const skillGroups = [
  {
    category: "Languages & Web",
    icon: "code",
    skills: [
      { name: "JavaScript", tag: "blue" },
      { name: "HTML", tag: "amber" },
      { name: "CSS", tag: "blue" }
    ]
  },
  {
    category: "Front-end Development",
    icon: "layout",
    skills: [
      { name: "Front-end Development", tag: "purple" },
      { name: "Static Website Development", tag: "teal" },
      { name: "Responsive Design", tag: "teal" },
      { name: "UI Design", tag: "teal" }
    ]
  },
  {
    category: "Telegram Development",
    icon: "send",
    skills: [
      { name: "Telegram Bot Development", tag: "blue" },
      { name: "Telegram Mini Apps", tag: "purple" }
    ]
  },
  {
    category: "Design",
    icon: "image",
    skills: [
      { name: "Thumbnail Artist", tag: "rose" },
      { name: "Photo Editing", tag: "amber" },
      { name: "Graphic Design", tag: "purple" },
      { name: "Menu Design for Cafes & Restaurants", tag: "teal" }
    ]
  },
  {
    category: "Open Source",
    icon: "git-branch",
    skills: [
      { name: "Open Source Projects", tag: "blue" },
      { name: "GitHub", tag: "purple" }
    ]
  }
];

export const projects = [
  {
    icon: "🖼️",
    title: "Increase Photo Resolution",
    desc: "A lightweight web application that enhances image resolution with multiple upscale levels while maintaining a fast and responsive user experience.",
    tech: [
      { name: "JavaScript", tag: "blue" },
      { name: "Canvas API", tag: "purple" },
      { name: "Image Processing", tag: "teal" }
    ],
    status: "Live",
    links: {
      github: "https://github.com/abbasaghebaty/Increase-photo-resolotion",
      demo: "https://abbasaghebaty.github.io/Increase-photo-resolotion/"
    }
  },
  {
    icon: "✍️",
    title: "Caption Generator",
    desc: "An intelligent caption generation tool for Telegram shop owners with optimized formatting, emojis and category-based templates.",
    tech: [
      { name: "JavaScript", tag: "blue" },
      { name: "Telegram API", tag: "purple" },
      { name: "Automation", tag: "teal" }
    ],
    status: "Live",
    links: {
      github: "https://github.com/abbasaghebaty/Caption-Generator",
      demo: "https://abbasaghebaty.github.io/Caption-Generator/"
    }
  },
  {
    icon: "🤖",
    title: "YourClean Telegram Bot",
    desc: "A Telegram bot developed for store management, product lookup, customer interaction and quick access to shop information.",
    tech: [
      { name: "Node.js", tag: "blue" },
      { name: "Telegram Bot API", tag: "purple" },
      { name: "Store Management", tag: "teal" }
    ],
    status: "Live",
    links: {
      github: "https://github.com/abbasaghebaty/Yourclean-bot",
      demo: "https://t.me/YourClean_bot",
      demoLabel: "Open Bot"
    }
  },
  {
    icon: "🛍️",
    title: "Shoma Shop Website",
    desc: "A modern responsive website designed for a local shop featuring product showcases, contact information and optimized user experience.",
    tech: [
      { name: "HTML", tag: "amber" },
      { name: "CSS", tag: "purple" },
      { name: "JavaScript", tag: "blue" },
      { name: "Responsive", tag: "teal" }
    ],
    status: "Live",
    links: {
      github: "https://github.com/abbasaghebaty/Shoma.shop",
      demo: "http://shoma-shop.ir/"
    }
  },
  {
    icon: "🚀",
    title: "Personal Portfolio",
    desc: "My personal portfolio and dashboard that brings together all of my social links, featured projects and development journey in one place.",
    tech: [
      { name: "HTML", tag: "amber" },
      { name: "CSS", tag: "purple" },
      { name: "JavaScript", tag: "blue" }
    ],
    status: "Current",
    links: {
      github: "https://github.com/abbasaghebaty/about-me"
    }
  }
];

// Fallback list, used only if the live GitHub API request fails
// (offline, rate-limited, etc.)
export const fallbackRepos = [
  {
    name: "Shoma.shop",
    description: "A modern responsive website for a local shop.",
    language: "HTML",
    html_url: "https://github.com/abbasaghebaty/Shoma.shop",
    stargazers_count: 0,
    forks_count: 0,
    updated_at: null
  },
  {
    name: "Yourclean-bot",
    description: "Telegram bot for store management and product lookup.",
    language: "JavaScript",
    html_url: "https://github.com/abbasaghebaty/Yourclean-bot",
    stargazers_count: 0,
    forks_count: 0,
    updated_at: null
  },
  {
    name: "abbas_developerbot",
    description: "A Telegram bot project.",
    language: "CSS",
    html_url: "https://github.com/abbasaghebaty/abbas_developerbot",
    stargazers_count: 0,
    forks_count: 0,
    updated_at: null
  },
  {
    name: "Caption-Generator",
    description: "Caption generation tool for Telegram shop owners.",
    language: "HTML",
    html_url: "https://github.com/abbasaghebaty/Caption-Generator",
    stargazers_count: 0,
    forks_count: 0,
    updated_at: null
  },
  {
    name: "Increase-photo-resolotion",
    description: "Web app that enhances image resolution.",
    language: "HTML",
    html_url: "https://github.com/abbasaghebaty/Increase-photo-resolotion",
    stargazers_count: 0,
    forks_count: 0,
    updated_at: null
  },
  {
    name: "about-me",
    description: "Personal portfolio and dashboard.",
    language: "HTML",
    html_url: "https://github.com/abbasaghebaty/about-me",
    stargazers_count: 0,
    forks_count: 0,
    updated_at: null
  }
];

export const socials = [
  {
    name: "Instagram",
    desc: "Daily updates",
    url: "https://instagram.com/abbas.aghebaty",
    icon: "instagram"
  },
  {
    name: "Telegram Channel",
    desc: "Announcements & posts",
    url: "https://t.me/abbas.aghebaty",
    icon: "send"
  },
  {
    name: "Telegram",
    desc: "Chat with me",
    url: "https://t.me/abbas_js",
    icon: "send"
  },
  {
    name: "YouTube",
    desc: "Video tutorials",
    url: "https://youtube.com/@abbas.aghebaty",
    icon: "youtube"
  },
  {
    name: "GitHub",
    desc: "Open source projects",
    url: "https://github.com/abbasaghebaty",
    icon: "github"
  }
];

export const languageColors = {
  JavaScript: "#e3b23d",
  HTML: "#ee6f9a",
  CSS: "#5b9dfb",
  TypeScript: "#5b9dfb",
  Python: "#33c9b0",
  "Node.js": "#22c77a"
};
