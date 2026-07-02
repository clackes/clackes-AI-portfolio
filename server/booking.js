// Booking endpoint: creates a Google Calendar event with a Google Meet link and
// lets Google email the invite (with the Meet link) to both the guest and the
// host. No SDK — just the REST API over fetch + an OAuth refresh token.
//
// Enable it by filling these in .env (see .env.example):
//   GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN
//   GOOGLE_CALENDAR_ID   (optional, default "primary")
//   BOOKING_HOST_EMAIL   (optional, added as a guest so you also get the invite)
//
// Without those it runs in "stub" mode: it validates + logs the booking and
// returns ok, so the frontend flow works end-to-end during local development.
import { Router } from 'express';

export const booking = Router();

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const HOST_EMAIL = process.env.BOOKING_HOST_EMAIL || '';

const configured = Boolean(CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN);

const pad = (n) => String(n).padStart(2, '0');
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
const isTime = (v) => /^\d{2}:\d{2}$/.test(String(v || ''));

function endTime(time, durationMin) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + (Number(durationMin) || 30);
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

// Exchange the long-lived refresh token for a short-lived access token.
async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`OAuth token refresh failed: ${data.error || res.status}`);
  }
  return data.access_token;
}

booking.get('/book/health', (_req, res) => {
  res.json({ ok: true, mode: configured ? 'calendar' : 'stub' });
});

// POST /api/book  { name, email, topic, date:'YYYY-MM-DD', time:'HH:mm', tz, durationMin }
booking.post('/book', async (req, res) => {
  const { name, email, topic = '', date, time, tz, durationMin = 30 } = req.body || {};

  // Validate
  if (!String(name || '').trim() || !isEmail(email) || !isDate(date) || !isTime(time) || !tz) {
    return res.status(400).json({ ok: false, error: 'invalid_input' });
  }

  const cleanName = String(name).trim().slice(0, 120);
  const cleanTopic = String(topic).trim().slice(0, 1000);
  const start = `${date}T${time}:00`;
  const end = `${date}T${endTime(time, durationMin)}:00`;

  // No credentials yet → stub so the UI flow works locally.
  if (!configured) {
    console.log('[booking] (stub) new request:', { name: cleanName, email, date, time, tz, topic: cleanTopic });
    return res.json({ ok: true, mode: 'stub' });
  }

  try {
    const accessToken = await getAccessToken();

    const attendees = [{ email: String(email).trim() }];
    if (HOST_EMAIL) attendees.push({ email: HOST_EMAIL, organizer: true });

    const requestId = `av-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const eventBody = {
      summary: `Intro call · ${cleanName} × Alberto Vergani`,
      description:
        (cleanTopic ? `Topic:\n${cleanTopic}\n\n` : '') +
        `Booked via albertovergani.com\nGuest: ${cleanName} <${email}>`,
      start: { dateTime: start, timeZone: tz },
      end: { dateTime: end, timeZone: tz },
      attendees,
      guestsCanModify: false,
      reminders: { useDefault: true },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
      `?conferenceDataVersion=1&sendUpdates=all`;

    const gRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });
    const event = await gRes.json();
    if (!gRes.ok) {
      console.error('[booking] Calendar API error:', event?.error || gRes.status);
      return res.status(502).json({ ok: false, error: 'calendar_failed' });
    }

    const meetLink =
      event.hangoutLink ||
      event.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ||
      null;

    console.log('[booking] event created:', event.id, meetLink);
    res.json({ ok: true, mode: 'calendar', meetLink, htmlLink: event.htmlLink });
  } catch (err) {
    console.error('[booking] error:', err?.message || err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});
