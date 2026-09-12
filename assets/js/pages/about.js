import { profile } from "../data.js";

export function render(container) {
  container.innerHTML = `
    <div class="page" data-page="about">
      <div class="page__header">
        <div class="page__eyebrow">Profile</div>
        <h1 class="page__title">About Me</h1>
        <p class="page__desc">Who I am, what I focus on, and how I got here.</p>
      </div>

      <div class="panel about-bio">
        ${profile.bio.map((p) => `<p>${p}</p>`).join("")}
      </div>

      <div class="section-block">
        <div class="section-block__head">
          <div class="section-block__title">Focus areas</div>
        </div>
        <div class="focus-grid">
          ${profile.focus
            .map(
              (f) => `
            <div class="panel focus-card">
              <div class="focus-card__title">${f.title}</div>
              <div class="focus-card__desc">${f.desc}</div>
            </div>`
            )
            .join("")}
        </div>
      </div>

      <div class="section-block">
        <div class="section-block__head">
          <div class="section-block__title">Learning journey</div>
        </div>
        <div class="panel" style="padding: var(--sp-6);">
          <div class="timeline">
            ${profile.journey
              .map(
                (j) => `
              <div class="timeline__item">
                <div class="timeline__period">${j.period}</div>
                <div class="timeline__title">${j.title}</div>
                <div class="timeline__desc">${j.desc}</div>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}
