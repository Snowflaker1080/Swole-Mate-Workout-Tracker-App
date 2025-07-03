import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Proxy image requests to bypass CORS issues
router.get('/image-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing image URL");

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch image");
    }

    res.set('Content-Type', response.headers.get('content-type'));
    res.set('Cache-Control', 'public, max-age=86400'); // caching
    response.body.pipe(res);
  } catch (error) {
    console.error('Image proxy failed:', error);
    res.status(500).send("Internal server error while proxying image");
  }
});

export default router;