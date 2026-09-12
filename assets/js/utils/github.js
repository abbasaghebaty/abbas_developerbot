import { GITHUB_USERNAME, fallbackRepos } from "../data.js";

const API = "https://api.github.com";

async function safeFetch(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" }
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

export async function getRepos() {
  try {
    const data = await safeFetch(
      `${API}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`
    );
    const repos = data.filter((r) => !r.fork);
    return { repos: repos.length ? repos : fallbackRepos, live: true };
  } catch (err) {
    return { repos: fallbackRepos, live: false };
  }
}

export async function getPublicEvents() {
  try {
    const data = await safeFetch(
      `${API}/users/${GITHUB_USERNAME}/events/public?per_page=15`
    );
    return { events: data, live: true };
  } catch (err) {
    return { events: [], live: false };
  }
}

export async function getUser() {
  try {
    return await safeFetch(`${API}/users/${GITHUB_USERNAME}`);
  } catch (err) {
    return null;
  }
}
