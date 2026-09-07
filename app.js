(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const elements = {
    profileName: $("#profileName"),
    skills: $("#skills"),
    links: $("#links"),
    projects: $("#projects"),
    projectCount: $("#projectCount"),
    stats: $("#stats"),
    typingText: $("#typingText"),
    clock: $("#clock"),
    year: $("#year"),
    updated: $("#updated"),
    background: $("#background")
  };

  const externalAttrs = 'target="_blank" rel="noopener noreferrer"';

  function renderSkills() {
    elements.skills.innerHTML = SITE_DATA.skills.map((skill) => {
      const tone = skill.tone ? ` skill--${skill.tone}` : "";
      return `
        <span class="skill${tone}">
          <span class="skill__dot" aria-hidden="true"></span>
          ${escapeHtml(skill.name)}
        </span>
      `;
    }).join("");
  }

  function renderLinks() {
    elements.links.innerHTML = SITE_DATA.links.map((link) => `
      <a class="link-card" href="${escapeAttr(link.url)}" ${externalAttrs}>
        <div class="link-card__top">
          <span class="link-card__mark" aria-hidden="true">${getLinkMark(link.name)}</span>
          <span class="link-card__arrow" aria-hidden="true">↗</span>
        </div>
        <div>
          <h3>${escapeHtml(link.name)}</h3>
          <p>${escapeHtml(link.description)}</p>
        </div>
      </a>
    `).join("");
  }

  function renderProjects() {
    elements.projects.innerHTML = SITE_DATA.projects.map((project) => {
      const currentLabel = project.current
        ? '<span class="project-card__current">You are viewing it</span>'
        : "";

      const tags = project.tags.map((tag) =>
        `<span class="tag">${escapeHtml(tag)}</span>`
      ).join("");

      const repoLink = project.repo
        ? `<a href="${escapeAttr(project.repo)}" ${externalAttrs}>GitHub ↗</a>`
        : "";

      const demoLink = project.demo
        ? `<a class="secondary" href="${escapeAttr(project.demo)}" ${externalAttrs}>${escapeHtml(project.demoLabel || "Live demo")} ↗</a>`
        : "";

      const current = project.current ? " project-card--current" : "";

      return `
        <article class="project-card${current}">
          <div class="project-card__icon" aria-hidden="true">${escapeHtml(project.icon || "APP")}</div>
          <div class="project-card__body">
            <h3>${escapeHtml(project.name)}</h3>
            ${currentLabel}
            <p>${escapeHtml(project.description)}</p>
            <div class="project-card__tags">${tags}</div>
          </div>
          <div class="project-card__actions">
            ${repoLink}
            ${demoLink}
          </div>
        </article>
      `;
    }).join("");

    elements.projectCount.textContent = `${SITE_DATA.projects.length} projects`;
  }

  function renderStats(repoCount = null) {
    const years = Math.max(1, new Date().getFullYear() - SITE_DATA.profile.startedYear);
    const stats = [
      { value: SITE_DATA.projects.length, label: "Featured projects" },
      { value: repoCount ?? "—", label: "Public GitHub repos" },
      { value: `${years}+`, label: "Years building" }
    ];

    elements.stats.innerHTML = stats.map((stat) => `
      <div class="stat">
        <div class="stat__number">${escapeHtml(String(stat.value))}</div>
        <div class="stat__label">${escapeHtml(stat.label)}</div>
      </div>
    `).join("");
  }

  function getLinkMark(name) {
    const marks = {
      GitHub: "GH",
      Telegram: "TG",
      "Telegram Channel": "TG",
      Instagram: "IG",
      YouTube: "YT"
    };
    return marks[name] || "↗";
  }

  function startTyping() {
    const titles = SITE_DATA.profile.typingTitles;
    let titleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = titles[titleIndex];
      elements.typingText.textContent = current.slice(0, charIndex);

      if (!deleting) {
        charIndex++;
        if (charIndex > current.length) {
          deleting = true;
          setTimeout(tick, 1700);
          return;
        }
        setTimeout(tick, 55 + Math.random() * 30);
        return;
      }

      charIndex--;
      if (charIndex <= 0) {
        deleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        setTimeout(tick, 280);
        return;
      }

      setTimeout(tick, 26);
    }

    tick();
  }

  function updateClock() {
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tehran",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(new Date());

    const [hours, minutes, seconds] = time.split(":");
    elements.clock.innerHTML = [hours, minutes, seconds]
      .map((value, index) =>
        `<span class="clock__digit">${escapeHtml(value)}</span>${index < 2 ? '<span class="clock__colon">:</span>' : ""}`
      ).join("");
  }

  async function loadRepoCount() {
    const endpoint = `https://api.github.com/users/${encodeURIComponent("abbasaghebaty")}`;

    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(7000)
      });

      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      const data = await response.json();
      if (typeof data.public_repos !== "number") throw new Error("Invalid repo count");

      renderStats(data.public_repos);
    } catch (error) {
      console.warn("Could not load GitHub repo count:", error.message);
      renderStats();
    }
  }

  function setupReveal() {
    const revealElements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealElements.forEach((element) => observer.observe(element));
  }

  function setupParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener("mousemove", (event) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 20;
      targetY = (event.clientY / window.innerHeight - 0.5) * 20;
    }, { passive: true });

    function frame() {
      x += (targetX - x) * 0.05;
      y += (targetY - y) * 0.05;

      const orbs = elements.background.querySelectorAll(".orb");
      if (orbs[0]) orbs[0].style.transform = `translate(${x}px, ${y}px)`;
      if (orbs[1]) orbs[1].style.transform = `translate(${-x * 0.7}px, ${-y * 0.7}px)`;
      if (orbs[2]) orbs[2].style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  const now = new Date();
  elements.profileName.textContent = SITE_DATA.profile.name;
  elements.year.textContent = now.getFullYear();
  elements.updated.textContent = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  renderSkills();
  renderLinks();
  renderProjects();
  renderStats();
  startTyping();
  updateClock();
  setInterval(updateClock, 1000);
  loadRepoCount();
  setupReveal();
  setupParallax();
})();
