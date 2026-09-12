import { registerRoute, initRouter } from "./router.js";
import { initClock } from "./widgets/clock.js";
import { icon } from "./utils/icons.js";
import { profile, projects } from "./data.js";

import * as OverviewPage from "./pages/overview.js";
import * as AboutPage from "./pages/about.js";
import * as ProjectsPage from "./pages/projects.js";
import * as RepositoriesPage from "./pages/repositories.js";
import * as SkillsPage from "./pages/skills.js";
import * as LinksPage from "./pages/links.js";
import * as ActivityPage from "./pages/activity.js";

const NAV = [
  { path: "overview", label: "Overview", icon: "grid", module: OverviewPage },
  { path: "about", label: "About Me", icon: "user", module: AboutPage },
  {
    path: "projects",
    label: "Projects",
    icon: "folder",
    module: ProjectsPage,
    badge: () => projects.length
  },
  { path: "repositories", label: "Repositories", icon: "repo", module: RepositoriesPage },
  { path: "skills", label: "Skills", icon: "layers", module: SkillsPage },
  { path: "links", label: "Links", icon: "link", module: LinksPage },
  { path: "activity", label: "Activity", icon: "activity", module: ActivityPage }
];

function buildSidebar() {
  const nav = document.getElementById("sidebar-nav");
  nav.innerHTML = NAV.map(
    (item) => `
    <a class="nav-item" href="#/${item.path}" data-path="${item.path}">
      <span class="nav-item__icon">${icon(item.icon)}</span>
      <span class="nav-item__label">${item.label}</span>
      ${item.badge ? `<span class="nav-item__badge">${item.badge()}</span>` : ""}
    </a>`
  ).join("");
}

function setActiveNav(path) {
  document.querySelectorAll(".nav-item").forEach((a) => {
    a.classList.toggle("is-active", a.dataset.path === path);
  });
}

function setTopbar(path, route) {
  document.getElementById("topbar-crumb").textContent = "abbasaghebaty";
  document.getElementById("topbar-title").textContent = route.label;
  document.title = `${route.label} — ${profile.name}`;
}

function setupMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const menuBtn = document.getElementById("menu-toggle");

  function close() {
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-open");
  }
  function open() {
    sidebar.classList.add("is-open");
    overlay.classList.add("is-open");
  }

  menuBtn.addEventListener("click", () => {
    sidebar.classList.contains("is-open") ? close() : open();
  });
  overlay.addEventListener("click", close);
  window.addEventListener("hashchange", close);
}

function init() {
  document.getElementById("sidebar-name").textContent = profile.name;
  document.getElementById("sidebar-role").textContent = "Developer";

  buildSidebar();
  setupMobileSidebar();
  initClock(document.getElementById("clock-value"), profile.timezone);

  NAV.forEach((item) =>
    registerRoute(item.path, { label: item.label, render: item.module.render })
  );

  initRouter(document.getElementById("content-outlet"), (path, route) => {
    setActiveNav(path);
    setTopbar(path, route);
  });
}

document.addEventListener("DOMContentLoaded", init);
