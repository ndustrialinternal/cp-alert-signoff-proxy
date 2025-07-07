import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const UPSTREAM = process.env.UPSTREAM_URL;
const TOKEN   = process.env.API_TOKEN;   // raw token, no “Bearer ” prefix

app.post('/graphql', async (req, res) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (TOKEN) {
      headers['Authorization'] = TOKEN;
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
app.listen(port, () => {
  console.log(`Proxy listening on port ${port}`);
});
