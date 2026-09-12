// تابع نمونه برای رندر داینامیک پروژه‌ها در جدول (در صورتی که پروژه‌ها از گیت‌هاب یا JS لود می‌شوند)
function renderProjectsTable(projects) {
  const container = document.getElementById('projects-list');
  if (!container) return;

  container.innerHTML = projects.map(project => `
    <tr>
      <td class="project-title-cell">${project.name || project.title}</td>
      <td>${project.description || 'بدون توضیحات'}</td>
      <td>
        ${(project.topics || project.tech || []).map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
      </td>
      <td class="project-links-cell">
        ${project.homepage ? `<a href="${project.homepage}" target="_blank" class="btn-link">دمو</a>` : ''}
        ${project.html_url ? `<a href="${project.html_url}" target="_blank" class="btn-link github">گیت‌هاب</a>` : ''}
      </td>
    </tr>
  `).join('');
}
