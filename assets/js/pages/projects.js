import { projects } from "../data.js";
import { icon } from "../utils/icons.js";

export function render(container) {
  container.innerHTML = `
    <div class="page" data-page="projects">
      <div class="page__header">
        <div class="page__eyebrow">Work</div>
        <h1 class="page__title">Projects</h1>
        <p class="page__desc">Things I've built and shipped, from web apps to Telegram bots.</p>
      </div>

      <div class="section-block__head">
        <div class="section-block__hint">${projects.length} projects</div>
        <div class="view-toggle" role="tablist" aria-label="Project view">
          <button class="view-toggle__btn is-active" data-view="cards" type="button">Cards</button>
          <button class="view-toggle__btn" data-view="table" type="button">Table</button>
        </div>
      </div>

      <div id="projects-view"></div>
    </div>
  `;

  const viewEl = container.querySelector("#projects-view");
  const toggleBtns = container.querySelectorAll(".view-toggle__btn");

  function setView(view) {
    toggleBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.view === view));
    viewEl.innerHTML = view === "table" ? tableView() : cardsView();
  }

  toggleBtns.forEach((btn) =>
    btn.addEventListener("click", () => setView(btn.dataset.view))
  );

  setView("cards");
}

function cardsView() {
  return `
    <div class="card-grid">
      ${projects
        .map(
          (p) => `
        <div class="panel project-card">
          <div class="project-card__top">
            <div class="project-card__icon">${p.icon}</div>
            <span class="project-card__status ${
              p.status === "Current" ? "project-card__status--current" : ""
            }">${p.status}</span>
          </div>
          <div class="project-card__title">${p.title}</div>
          <p class="project-card__desc">${p.desc}</p>
          <div class="project-card__tags">
            ${p.tech
              .map(
                (t) =>
                  `<span class="tag tag--${t.tag}"><span class="tag__dot"></span>${t.name}</span>`
              )
              .join("")}
          </div>
          <div class="project-card__actions">
            ${
              p.links.github
                ? `<a class="btn" href="${p.links.github}" target="_blank" rel="noopener">${icon(
                    "github"
                  )} Code</a>`
                : ""
            }
            ${
              p.links.demo
                ? `<a class="btn btn--primary" href="${p.links.demo}" target="_blank" rel="noopener">${
                    p.links.demoLabel || "Live demo"
                  } ${icon("arrow")}</a>`
                : ""
            }
          </div>
        </div>`
        )
        .join("")}
    </div>
  `;
}

function tableView() {
  return `
    <div class="data-table-wrap">
      <table class="data-table projects-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Description</th>
            <th>Stack</th>
            <th>Status</th>
            <th>Links</th>
          </tr>
        </thead>
        <tbody>
          ${projects
            .map(
              (p) => `
            <tr>
              <td class="cell-primary">${p.icon} ${p.title}</td>
              <td class="cell-desc">${p.desc}</td>
              <td>${p.tech.map((t) => t.name).join(", ")}</td>
              <td>${p.status}</td>
              <td>
                ${
                  p.links.github
                    ? `<a href="${p.links.github}" target="_blank" rel="noopener">Code</a>`
                    : ""
                }
                ${p.links.github && p.links.demo ? " · " : ""}
                ${
                  p.links.demo
                    ? `<a href="${p.links.demo}" target="_blank" rel="noopener">${
                        p.links.demoLabel || "Demo"
                      }</a>`
                    : ""
                }
              </td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}
