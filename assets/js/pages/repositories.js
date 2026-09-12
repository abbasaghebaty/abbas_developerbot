import { getRepos } from "../utils/github.js";
import { relativeTime } from "../utils/format.js";
import { languageColors } from "../data.js";
import { icon } from "../utils/icons.js";

export async function render(container) {
  container.innerHTML = `
    <div class="page" data-page="repositories">
      <div class="page__header">
        <div class="page__eyebrow">Live from GitHub</div>
        <h1 class="page__title">Repositories</h1>
        <p class="page__desc">Every public repository, pulled live from the GitHub API.</p>
      </div>

      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Repository</th>
              <th>Description</th>
              <th>Language</th>
              <th>Stars</th>
              <th>Forks</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody id="repo-rows">
            ${skeletonRows(6)}
          </tbody>
        </table>
      </div>
      <div class="source-note" id="repo-source"></div>
    </div>
  `;

  const rowsEl = container.querySelector("#repo-rows");
  const sourceEl = container.querySelector("#repo-source");
  const { repos, live } = await getRepos();

  rowsEl.innerHTML = repos
    .map((r) => {
      const color = languageColors[r.language] || "#5c6478";
      return `
      <tr>
        <td class="cell-primary">
          <div class="repo-name-cell">${icon("repo")}
            <a href="${r.html_url}" target="_blank" rel="noopener">${r.name}</a>
          </div>
        </td>
        <td>${r.description || "—"}</td>
        <td>
          <span class="repo-lang-cell">
            ${r.language ? `<span class="lang-dot" style="background:${color}"></span>${r.language}` : "—"}
          </span>
        </td>
        <td class="cell-mono">${r.stargazers_count ?? 0}</td>
        <td class="cell-mono">${r.forks_count ?? 0}</td>
        <td class="cell-mono">${r.updated_at ? relativeTime(r.updated_at) : "—"}</td>
      </tr>`;
    })
    .join("");

  sourceEl.innerHTML = live
    ? `<span class="source-note__dot source-note__dot--live"></span> Live data from the GitHub API`
    : `<span class="source-note__dot source-note__dot--cached"></span> GitHub API unavailable right now — showing a cached list`;
}

function skeletonRows(n) {
  return Array.from({ length: n })
    .map(
      () => `
      <tr>
        <td><div class="skeleton" style="width:120px;height:14px;"></div></td>
        <td><div class="skeleton" style="width:220px;height:14px;"></div></td>
        <td><div class="skeleton" style="width:70px;height:14px;"></div></td>
        <td><div class="skeleton" style="width:24px;height:14px;"></div></td>
        <td><div class="skeleton" style="width:24px;height:14px;"></div></td>
        <td><div class="skeleton" style="width:70px;height:14px;"></div></td>
      </tr>`
    )
    .join("");
}
