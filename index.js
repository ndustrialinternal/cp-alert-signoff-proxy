import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());           // allow all origins (or lock down to your domain)
app.use(express.json());   // parse JSON bodies

const UPSTREAM = process.env.UPSTREAM_URL;
const API_KEY  = process.env.API_KEY;

app.post('/graphql', async (req, res) => {
  try {
    const upstreamRes = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'Authorization': API_KEY } : {})
      },
      body: JSON.stringify(req.body)
    });
    const json = await upstreamRes.json();
    res.status(upstreamRes.status).json(json);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Bad Gateway', details: err.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Proxy listening on port ${port}`);
});
