#!/usr/bin/env node
// Local-only editor. Saved output uses the chart's existing 3× shadow canvas.
import http from 'node:http';
import { readFile, writeFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { shadowExclusion } from './shadow-eligibility.mjs';

// Cache eligibility, not pixels. Restart the editor after replacing source art.
const eligibility = new Map();
const excluded = name => { if (!eligibility.has(name)) eligibility.set(name, shadowExclusion(name)); return eligibility.get(name); };

const root = fileURLToPath(new URL('../', import.meta.url));
const icons = path.join(root, 'content/icons');
const shadows = path.join(icons, 'shadows');
const configFile = path.join(shadows, 'overrides.json');
const configs = async () => JSON.parse(await readFile(configFile, 'utf8').catch(() => '{}'));
const valid = name => typeof name === 'string' && /^[a-z0-9][a-z0-9_-]*$/.test(name);
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/api/icons') {
      const candidates = (await readdir(icons)).filter(f => f.endsWith('.webp')).map(f => f.slice(0, -5)).sort();
      const checks = await Promise.all(candidates.map(async name => ({ name, reason: await excluded(name) })));
      const files = checks.filter(c => !c.reason).map(c => c.name);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ files, overrides: await configs(), round: JSON.parse(await readFile(path.join(shadows, 'round.json'), 'utf8')) }));
    }
    if (req.method === 'POST' && url.pathname === '/api/save') {
      // Reject cross-origin writes; this app only binds to loopback.
      if (req.headers.origin !== `http://${req.headers.host}` || req.headers['x-shadow-studio'] !== '1') {
        res.writeHead(403); return res.end('Open this page from its local address.');
      }
      let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 3_000_000) { res.writeHead(413); return res.end(); } }
      const data = JSON.parse(body);
      if (!valid(data.name) || !(await readdir(icons)).includes(`${data.name}.webp`)) throw Error('Unknown icon');
      const sharedRound = JSON.parse(await readFile(path.join(shadows, 'round.json'), 'utf8'));
      if (sharedRound.includes(data.name)) throw Error('Round objects keep the original shared shadow');
      const reason = await excluded(data.name);
      if (reason) throw Error(reason);
      if (!/^data:image\/png;base64,/.test(data.png)) throw Error('Expected a PNG shadow');
      const png = Buffer.from(data.png.split(',')[1], 'base64');
      const meta = await sharp(png).metadata();
      if (meta.width !== 768 || meta.height !== 768 || !meta.hasAlpha) throw Error('Expected a transparent 768×768 shadow');
      await mkdir(path.join(shadows, 'originals'), { recursive: true });
      const dest = path.join(shadows, `${data.name}.webp`);
      await copyFile(dest, path.join(shadows, 'originals', `${data.name}.webp`), 1).catch(e => { if (!['EEXIST', 'ENOENT'].includes(e.code)) throw e; });
      await sharp(png).resize(256, 256).webp({ quality: 90, alphaQuality: 100 }).toFile(dest);
      const all = await configs();
      all[data.name] = { ...data.settings, reviewed: true, updated: new Date().toISOString() };
      await writeFile(configFile, JSON.stringify(all, null, 2) + '\n');
      const roundFile = path.join(shadows, 'round.json');
      const round = JSON.parse(await readFile(roundFile, 'utf8'));
      if (round.includes(data.name)) await writeFile(roundFile, JSON.stringify(round.filter(n => n !== data.name), null, 1) + '\n');
      res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ saved: data.name }));
    }
    if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
    let file;
    if (url.pathname === '/') file = path.join(root, 'tools/shadow-studio.html');
    else if (url.pathname === '/wall-study') file = path.join(root, 'tools/shadow-wall-study.html');
    else if (['/src/shadow-geometry.js', '/src/long-shadow.js'].includes(url.pathname)) file = path.join(root, url.pathname.slice(1));
    else if (/^\/content\/icons\/(shadows\/)?[a-z0-9_-]+\.webp$/.test(url.pathname)) file = path.join(root, url.pathname.slice(1));
    else if (/^\/content\/icons\/shadow-candidates\/(wall-studies\/)?[a-z0-9_-]+\.png$/.test(url.pathname)) file = path.join(root, url.pathname.slice(1));
    else { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html' : file.endsWith('.png') ? 'image/png' : 'image/webp');
    res.setHeader('Cache-Control', 'no-store'); res.end(await readFile(file));
  } catch (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 400); res.end(error.message); }
});
server.listen(Number(process.env.SHADOW_PORT || 5190), '127.0.0.1', () => console.log(`Shadow studio: http://127.0.0.1:${server.address().port}`));
