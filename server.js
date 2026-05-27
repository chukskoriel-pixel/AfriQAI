// backend/server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Paths to data files
const DATA_DIR = path.join(__dirname, 'data');
const STORIES_FILE = path.join(DATA_DIR, 'stories.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');
const HERO_FILE = path.join(DATA_DIR, 'hero.json');

// Ensure data files exist
async function initDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    if (!await fileExists(STORIES_FILE)) await fs.writeFile(STORIES_FILE, '[]');
    if (!await fileExists(STATS_FILE)) await fs.writeFile(STATS_FILE, JSON.stringify({ views: {}, likes: {} }, null, 2));
    if (!await fileExists(HERO_FILE)) await fs.writeFile(HERO_FILE, JSON.stringify({ id: null, story: null }, null, 2));
  } catch (err) { console.error('Init error:', err); }
}

async function fileExists(filePath) {
  try { await fs.access(filePath); return true; } catch { return false; }
}

// OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Fallback rewrite if no API key
async function rewriteWithAI(originalTitle, originalContent) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      title: originalTitle + " (AFRIQAI)",
      content: originalContent.substring(0, 250) + "… [Rewritten by AFRIQAI]"
    };
  }
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a professional African news editor. Rewrite the following news in a unique, engaging, and clear style. Keep the same facts but change wording. Output as JSON: {"title": "new title", "content": "new summary (max 200 words)"}' },
        { role: 'user', content: `Original title: ${originalTitle}\nOriginal content: ${originalContent.substring(0, 1500)}` }
      ],
      temperature: 0.7,
    });
    const parsed = JSON.parse(response.choices[0].message.content);
    return { title: parsed.title, content: parsed.content };
  } catch (err) {
    console.error('AI rewrite failed:', err.message);
    return { title: originalTitle + " (updated)", content: originalContent.substring(0, 300) + "…" };
  }
}

// Fetch RSS feed and convert to articles
async function fetchRSSFeed(feedUrl) {
  const response = await axios.get(feedUrl);
  const parser = require('xml2js').Parser;
  const xmlParser = new parser({ explicitArray: false });
  const result = await xmlParser.parseStringPromise(response.data);
  let items = result.rss?.channel?.item || result.feed?.entry || [];
  if (!Array.isArray(items)) items = [items];
  return items.map(item => ({
    originalTitle: item.title || 'No title',
    originalContent: item.description || item.summary || item.content || '',
    link: item.link || '',
    pubDate: item.pubDate || new Date().toISOString(),
  }));
}

// Auto‑generate articles from RSS and store in stories.json
async function autoGenerateNews() {
  const RSS_URL = 'https://www.aljazeera.com/xml/rss/africa.xml'; // Change if you want
  console.log('Fetching RSS from', RSS_URL);
  const rawArticles = await fetchRSSFeed(RSS_URL);
  const newStories = [];

  for (let art of rawArticles.slice(0, 5)) {
    const rewritten = await rewriteWithAI(art.originalTitle, art.originalContent);
    const sections = ['Politics', 'Economy', 'Technology', 'Health', 'Sport'];
    const section = sections[Math.floor(Math.random() * sections.length)];
    const story = {
      id: Date.now() + Math.random(),
      title: rewritten.title,
      excerpt: rewritten.content,
      fullContent: rewritten.content + " [Full story available on original source]",
      section: section,
      imageUrl: 'https://via.placeholder.com/400x200?text=News+Image',
      publishedAt: new Date().toISOString(),
      originalLink: art.link,
      views: 0,
      likes: 0
    };
    newStories.push(story);
  }

  const existing = JSON.parse(await fs.readFile(STORIES_FILE, 'utf-8'));
  const all = [...newStories, ...existing];
  const unique = all.filter((s, idx, self) => self.findIndex(t => t.id === s.id) === idx);
  await fs.writeFile(STORIES_FILE, JSON.stringify(unique.slice(0, 100), null, 2));
  console.log(`Added ${newStories.length} new auto‑generated stories`);
}

// API Routes
app.get('/api/stories', async (req, res) => {
  const stories = JSON.parse(await fs.readFile(STORIES_FILE, 'utf-8'));
  res.json(stories);
});

app.get('/api/hero', async (req, res) => {
  const heroData = JSON.parse(await fs.readFile(HERO_FILE, 'utf-8'));
  if (heroData.id) {
    const stories = JSON.parse(await fs.readFile(STORIES_FILE, 'utf-8'));
    const heroStory = stories.find(s => s.id === heroData.id);
    res.json(heroStory || null);
  } else {
    res.json(null);
  }
});

app.post('/api/hero', async (req, res) => {
  const { storyId } = req.body;
  await fs.writeFile(HERO_FILE, JSON.stringify({ id: storyId, story: null }, null, 2));
  res.json({ success: true });
});

app.post('/api/generate-news', async (req, res) => {
  await autoGenerateNews();
  res.json({ success: true, message: 'News generated from RSS' });
});

app.post('/api/view/:id', async (req, res) => {
  const storyId = req.params.id;
  const stats = JSON.parse(await fs.readFile(STATS_FILE, 'utf-8'));
  stats.views[storyId] = (stats.views[storyId] || 0) + 1;
  await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
  res.json({ success: true });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Schedule auto‑generation every 6 hours
setInterval(autoGenerateNews, 6 * 60 * 60 * 1000);
autoGenerateNews().catch(console.error);

initDataFiles().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
