import { socials } from "../data.js";
import { icon } from "../utils/icons.js";

export function render(container) {
  container.innerHTML = `
    <div class="page" data-page="links">
      <div class="page__header">
        <div class="page__eyebrow">Elsewhere</div>
        <h1 class="page__title">Links & Socials</h1>
        <p class="page__desc">The best places to reach me or follow along.</p>
      </div>

      <div class="link-grid">
        ${socials
          .map(
            (s) => `
          <a class="panel link-card" href="${s.url}" target="_blank" rel="noopener noreferrer">
            <div class="link-card__icon">${icon(s.icon)}</div>
            <div class="link-card__body">
              <div class="link-card__name">${s.name}</div>
              <div class="link-card__desc">${s.desc}</div>
            </div>
            <div class="link-card__arrow">${icon("externalLink")}</div>
          </a>`
          )
          .join("")}
      </div>
    </div>
  `;
}
