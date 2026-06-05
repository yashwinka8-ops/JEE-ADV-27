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
    // Get label list with message counts
    const res = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/labels',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.error?.message || 'Failed to fetch Gmail' }, { status: res.status });
    }

    const data = await res.json();

    // Find INBOX label for unread count
    const inboxLabel = (data.labels || []).find((l: any) => l.id === 'INBOX');

    // If we found INBOX, get detailed info
    let unreadCount = 0;
    if (inboxLabel) {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/labels/INBOX`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (detailRes.ok) {
        const detail = await detailRes.json();
        unreadCount = detail.messagesUnread || 0;
      }
    }

    // Get recent threads for preview
    const threadsRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=5&labelIds=INBOX&q=is:unread',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    let threads: any[] = [];
    if (threadsRes.ok) {
      const threadsData = await threadsRes.json();
      // Get thread details for subjects
      const threadIds = (threadsData.threads || []).slice(0, 5);
      threads = await Promise.all(
        threadIds.map(async (t: any) => {
          try {
            const tRes = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/threads/${t.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!tRes.ok) return null;
            const tData = await tRes.json();
            const msg = tData.messages?.[0];
            const headers = msg?.payload?.headers || [];
            const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No subject)';
            const from = headers.find((h: any) => h.name === 'From')?.value || '';
            const date = headers.find((h: any) => h.name === 'Date')?.value || '';
            // Extract just the name from "Name <email>" format
            const fromName = from.replace(/<.*>/, '').trim() || from;
            return { id: t.id, subject, from: fromName, date, snippet: msg?.snippet || '' };
          } catch {
            return null;
          }
        })
      );
      threads = threads.filter(Boolean);
    }

    return NextResponse.json({ unreadCount, threads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
