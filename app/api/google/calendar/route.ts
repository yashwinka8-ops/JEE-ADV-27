import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAccessToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function GET(req: NextRequest) {
  const token = getAccessToken(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    // Get events for the next 7 days
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const params = new URLSearchParams({
      timeMin: now.toISOString(),
      timeMax: weekLater.toISOString(),
      maxResults: '20',
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.error?.message || 'Failed to fetch calendar' }, { status: res.status });
    }

    const data = await res.json();
    const events = (data.items || []).map((e: any) => ({
      id: e.id,
      summary: e.summary || '(No title)',
      start: e.start?.dateTime || e.start?.date || '',
      end: e.end?.dateTime || e.end?.date || '',
      htmlLink: e.htmlLink || '',
      location: e.location || '',
      colorId: e.colorId || '0',
    }));

    return NextResponse.json({ events });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
