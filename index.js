import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// 1. Parse JSON bodies
app.use(express.json());

// 2. Universal CORS middleware
app.use((req, res, next) => {
  // allow your GitHub Pages origin (or use '*' to allow all)
  res.header('Access-Control-Allow-Origin', 'https://ndustrialinternal.github.io');
  res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  // intercept OPTIONS and return immediately
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const UPSTREAM = process.env.UPSTREAM_URL;
const TOKEN    = process.env.API_TOKEN;   // just the raw token string

app.post('/graphql', async (req, res) => {
  try {
    // Build headers exactly like insomnia/curl does:
    const headers = { 'Content-Type': 'application/json' };
    if (TOKEN) {
      headers['Authorization'] = `token ${TOKEN}`;
    }

    const upstreamRes = await fetch(UPSTREAM, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body)
    });
    const payload = await upstreamRes.json();

    res.status(upstreamRes.status).json(payload);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Bad Gateway', details: err.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Proxy listening on port ${port}`));
