import { profile, projects, skillGroups } from "../data.js";
import { getRepos, getPublicEvents } from "../utils/github.js";
import { relativeTime } from "../utils/format.js";
import { describeEvent } from "./activity.js";

export async function render(container) {
  container.innerHTML = `
    <div class="page" data-page="overview">
      <div class="page__header">
        <div class="page__eyebrow">Dashboard</div>
        <h1 class="page__title">Overview</h1>
        <p class="page__desc">A snapshot of who I am, what I'm building and where things stand right now.</p>
      </div>

      <div class="panel hero-panel">
        <div class="hero-panel__avatar">${profile.initials}</div>
        <div>
          <div class="hero-panel__name">${profile.name}</div>
          <div class="hero-panel__role">${profile.role}</div>
          <p class="hero-panel__bio">${profile.bio[0]}</p>
        </div>
      </div>

      <div class="section-block">
        <div class="stat-grid" id="ov-stats">
          ${statSkeleton("Projects")}
          ${statSkeleton("Public repos")}
          ${statSkeleton("Skill areas")}
          ${statSkeleton("Status")}
        </div>
      </div>

      <div class="section-block split-2">
        <div>
          <div class="section-block__head">
            <div class="section-block__title">Recent activity</div>
            <a class="section-block__hint" href="#/activity">View all →</a>
          </div>
          <div class="panel overview-feed" id="ov-feed">
            ${loadingRows(4)}
          </div>
        </div>

        <div>
          <div class="section-block__head">
            <div class="section-block__title">At a glance</div>
          </div>
          <div class="panel quick-list">
            <div class="quick-list__row">
              <span class="quick-list__label">Location</span>
              <span class="quick-list__value">${profile.location}</span>
            </div>
            <div class="quick-list__row">
              <span class="quick-list__label">Primary stack</span>
              <span class="quick-list__value">JavaScript · HTML · CSS</span>
            </div>
            <div class="quick-list__row">
              <span class="quick-list__label">Latest project</span>
              <a class="quick-list__value" href="#/projects">${projects[0].title}</a>
            </div>
            <div class="quick-list__row">
              <span class="quick-list__label">GitHub</span>
              <a class="quick-list__value" href="https://github.com/abbasaghebaty" target="_blank" rel="noopener">github.com/abbasaghebaty</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const statsEl = container.querySelector("#ov-stats");
  const feedEl = container.querySelector("#ov-feed");

  const [{ repos }, { events }] = await Promise.all([
    getRepos(),
    getPublicEvents()
  ]);

  statsEl.innerHTML = `
    ${statCard("Projects", projects.length)}
    ${statCard("Public repos", repos.length)}
    ${statCard("Skill areas", skillGroups.length)}
    ${statCard("Status", "Available", true)}
  `;

  if (events.length) {
    feedEl.innerHTML = events
      .slice(0, 4)
      .map(
        (e) => `
        <div class="overview-feed__row">
          <span class="overview-feed__dot"></span>
          <span class="overview-feed__text">${describeEvent(e)}</span>
          <span class="overview-feed__time">${relativeTime(e.created_at)}</span>
        </div>`
      )
      .join("");
  } else {
    feedEl.innerHTML = `<div class="state-block"><span class="state-block__title">No recent public activity to show.</span></div>`;
  }
}

function statSkeleton(label) {
  return `
    <div class="stat-card">
      <div class="stat-card__label">${label}</div>
      <div class="skeleton" style="width:48px;height:26px;"></div>
    </div>`;
}

function statCard(label, value, isStatus) {
  return `
    <div class="stat-card">
      <div class="stat-card__label">${label}</div>
      <div class="stat-card__value" ${
        isStatus ? 'style="font-size: var(--fs-base); display:flex; align-items:center; gap:8px;"' : ""
      }>
        ${isStatus ? '<span class="status-pill__dot"></span>' : ""}${value}
      </div>
    </div>`;
}

function loadingRows(n) {
  return Array.from({ length: n })
    .map(
      () =>
        `<div class="overview-feed__row"><div class="skeleton" style="width:100%;height:14px;"></div></div>`
    )
    .join("");
}
