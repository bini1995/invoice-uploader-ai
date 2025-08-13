const fs = require('fs');
const path = require('path');
const site = process.env.SITE_URL || 'https://clarifyops.com';
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${site}/</loc>\n  </url>\n</urlset>`;
fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), sitemap);
const robots = `# https://www.robotstxt.org/robotstxt.html\nUser-agent: *\nDisallow:\nSitemap: ${site}/sitemap.xml\n`;
fs.writeFileSync(path.join(__dirname, '..', 'public', 'robots.txt'), robots);
