const express = require('express');
const ical = require('node-ical');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing ?url=' });

  try {
    const data = await ical.async.fromURL(url);
    const events = Object.values(data).filter(e => e.type === 'VEVENT');

   const parsed = events.map(event => {
  let reservation_id = event.reservation_id ||'';
  let uid = event.uid || '';
  let description = event.description || '';

  // Try to extract RVshare reservation ID from description
  const rvshareMatch = description.match(/reservations\/(\d+)/);
  if (rvshareMatch) {
    reservation_id = rvshareMatch[1];
    uid = rvshareMatch[1]; // optional override
  }

  return {
    summary: event.summary,
    reservation_id,
    start: event.start,
    end: event.end,
    uid,
    location: event.location || '',
    description
  };
});


    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Parsing failed', details: err.message });
  }
});

app.listen(port, () => console.log(`Running on port ${port}`));
