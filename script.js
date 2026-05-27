// frontend/script.js
// Backend URL (your live Render backend)
const BACKEND_URL = 'https://afriqai-backend.onrender.com';

async function loadHero() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/hero`);
    const hero = await res.json();
    if (hero && hero.title) {
      document.getElementById('hero-container').innerHTML = `
        <div class="hero-card">
          <h1>${hero.title}</h1>
          <p>${hero.excerpt}</p>
          <a href="#">Read more</a>
        </div>`;
    } else {
      document.getElementById('hero-container').innerHTML = '<p>No hero story set. Use /admin to choose one.</p>';
    }
  } catch (err) {
    console.error('Hero load error:', err);
  }
}

async function loadHomepage() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/stories`);
    const allStories = await res.json();
    const heroRes = await fetch(`${BACKEND_URL}/api/hero`);
    const heroData = await heroRes.json();
    const heroId = heroData?.id;
    const otherStories = allStories.filter(s => s.id !== heroId).slice(0, 6);
    const grid = document.getElementById('news-grid');
    if (grid) {
      grid.innerHTML = otherStories.map(s => `
        <div class="news-card">
          <img src="${s.imageUrl || 'https://via.placeholder.com/400x200'}" alt="${s.title}" />
          <h3>${s.title}</h3>
          <p>${s.excerpt.substring(0, 100)}...</p>
          <small>${s.section}</small>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Homepage load error:', err);
  }
}

function loadSection(section) {
  fetch(`${BACKEND_URL}/api/stories`)
    .then(res => res.json())
    .then(stories => {
      const filtered = stories.filter(s => s.section === section);
      const grid = document.getElementById('news-grid');
      if (grid) {
        grid.innerHTML = filtered.map(s => `
          <div class="news-card">
            <h3>${s.title}</h3>
            <p>${s.excerpt.substring(0, 100)}...</p>
            <small>${s.section}</small>
          </div>
        `).join('');
      }
    })
    .catch(err => console.error('Section load error:', err));
}

// On page load
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
  loadHero();
  loadHomepage();
}

// If you have menu buttons, attach event listeners like:
// document.getElementById('menu-politics').onclick = () => loadSection('Politics');
// document.getElementById('menu-economy').onclick = () => loadSection('Economy');
// etc.
