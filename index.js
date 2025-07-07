import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// 1) Explicitly allow your GitHub Pages origin (or '*' if you prefer):
const corsOptions = {
  origin: 'https://ndustrialinternal.github.io',
  methods: ['POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight for /graphql
app.options('/graphql', cors(corsOptions));

const UPSTREAM = process.env.UPSTREAM_URL;
const TOKEN   = process.env.API_TOKEN;   // raw token

app.post('/graphql', async (req, res) => {
  try {
    // Forward the client’s JSON body upstream
    const headers = { 'Content-Type': 'application/json' };
    if (TOKEN) headers['Authorization'] = TOKEN;

    const upstreamRes = await fetch(UPSTREAM, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body)
    });

    const payload = await upstreamRes.json();

    // Re-apply CORS headers on the response
    res.set('Access-Control-Allow-Origin', corsOptions.origin);
    res.set('Access-Control-Allow-Methods', corsOptions.methods.join(','));
    res.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));

    res.status(upstreamRes.status).json(payload);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Bad Gateway', details: err.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Proxy listening on port ${port}`);
});
