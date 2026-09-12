import { skillGroups } from "../data.js";
import { icon } from "../utils/icons.js";

export function render(container) {
  container.innerHTML = `
    <div class="page" data-page="skills">
      <div class="page__header">
        <div class="page__eyebrow">Capabilities</div>
        <h1 class="page__title">Skills</h1>
        <p class="page__desc">What I work with day to day, grouped by area.</p>
      </div>

      <div class="skills-groups">
        ${skillGroups
          .map(
            (g) => `
          <div class="panel skill-group">
            <div class="skill-group__head">
              <div class="skill-group__icon">${icon(toIconKey(g.icon))}</div>
              <div class="skill-group__title">${g.category}</div>
              <div class="skill-group__count">${g.skills.length}</div>
            </div>
            <div class="skill-group__tags">
              ${g.skills
                .map(
                  (s) =>
                    `<span class="tag tag--${s.tag}"><span class="tag__dot"></span>${s.name}</span>`
                )
                .join("")}
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;
}

function toIconKey(key) {
  const map = {
    code: "code",
    layout: "layout",
    send: "send",
    image: "image",
    "git-branch": "gitBranch"
  };
  return map[key] || "code";
}
