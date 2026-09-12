import { getPublicEvents } from "../utils/github.js";
import { relativeTime, formatDate } from "../utils/format.js";
import { icon } from "../utils/icons.js";

const EVENT_ICON = {
  PushEvent: "push",
  CreateEvent: "gitBranch",
  WatchEvent: "star",
  ForkEvent: "gitBranch",
  IssuesEvent: "activity",
  PullRequestEvent: "gitBranch",
  PublicEvent: "repo"
};

export function describeEvent(e) {
  const repoName = e.repo?.name?.split("/")?.[1] || e.repo?.name || "a repository";
  const repoLink = `<a href="https://github.com/${e.repo?.name}" target="_blank" rel="noopener">${repoName}</a>`;

  switch (e.type) {
    case "PushEvent": {
      const count = e.payload?.commits?.length || 1;
      return `Pushed ${count} commit${count > 1 ? "s" : ""} to ${repoLink}`;
    }
    case "CreateEvent":
      return `Created ${e.payload?.ref_type || "a ref"} in ${repoLink}`;
    case "WatchEvent":
      return `Starred ${repoLink}`;
    case "ForkEvent":
      return `Forked ${repoLink}`;
    case "IssuesEvent":
      return `${cap(e.payload?.action)} an issue in ${repoLink}`;
    case "PullRequestEvent":
      return `${cap(e.payload?.action)} a pull request in ${repoLink}`;
    case "PublicEvent":
      return `Made ${repoLink} public`;
    default:
      return `Activity in ${repoLink}`;
  }
}

function cap(word) {
  if (!word) return "Updated";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export async function render(container) {
  container.innerHTML = `
    <div class="page" data-page="activity">
      <div class="page__header">
        <div class="page__eyebrow">Live from GitHub</div>
        <h1 class="page__title">Activity</h1>
        <p class="page__desc">A live feed of recent public GitHub activity — commits, new repos and more.</p>
      </div>
      <div class="panel feed" id="activity-feed">
        ${skeletonRows(6)}
      </div>
      <div class="source-note" id="activity-source"></div>
    </div>
  `;

  const feedEl = container.querySelector("#activity-feed");
  const sourceEl = container.querySelector("#activity-source");
  const { events, live } = await getPublicEvents();

  if (!events.length) {
    feedEl.innerHTML = `
      <div class="state-block">
        <span class="state-block__title">No recent public activity.</span>
        <span>Nothing has been pushed publicly in a while — check the Repositories page for full history.</span>
      </div>`;
  } else {
    feedEl.innerHTML = events
      .map(
        (e) => `
        <div class="feed__item">
          <div class="feed__icon">${icon(EVENT_ICON[e.type] || "activity")}</div>
          <div class="feed__body">
            <div class="feed__text">${describeEvent(e)}</div>
            <div class="feed__meta">${formatDate(e.created_at)} · ${relativeTime(e.created_at)}</div>
          </div>
        </div>`
      )
      .join("");
  }

  sourceEl.innerHTML = live
    ? `<span class="source-note__dot source-note__dot--live"></span> Live data from the GitHub API`
    : `<span class="source-note__dot source-note__dot--cached"></span> GitHub API unavailable right now — showing limited data`;
}

function skeletonRows(n) {
  return Array.from({ length: n })
    .map(
      () => `
      <div class="feed__item">
        <div class="skeleton" style="width:32px;height:32px;border-radius:10px;"></div>
        <div class="feed__body">
          <div class="skeleton" style="width:70%;height:14px;margin-bottom:8px;"></div>
          <div class="skeleton" style="width:40%;height:10px;"></div>
        </div>
      </div>`
    )
    .join("");
}
