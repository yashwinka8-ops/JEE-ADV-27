import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAccessToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = getAccessToken(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { id } = await context.params;
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/threads/${id}?format=full`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.error?.message || 'Failed to fetch thread' }, { status: res.status });
    }

    const data = await res.json();
    
    // Parse the messages
    const messages = (data.messages || []).map((msg: any) => {
      const headers = msg.payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No subject)';
      const from = headers.find((h: any) => h.name === 'From')?.value || '';
      const date = headers.find((h: any) => h.name === 'Date')?.value || '';
      
      let bodyText = '';
      let bodyHtml = '';

      // Function to recursively extract parts
      const extractParts = (parts: any[]) => {
        for (const part of parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            bodyText += Buffer.from(part.body.data, 'base64').toString('utf8');
          } else if (part.mimeType === 'text/html' && part.body?.data) {
            bodyHtml += Buffer.from(part.body.data, 'base64').toString('utf8');
          } else if (part.parts) {
            extractParts(part.parts);
          }
        }
      };

      if (msg.payload?.parts) {
        extractParts(msg.payload.parts);
      } else if (msg.payload?.body?.data) {
        // If it's a simple message with no parts
        if (msg.payload.mimeType === 'text/html') {
          bodyHtml = Buffer.from(msg.payload.body.data, 'base64').toString('utf8');
        } else {
          bodyText = Buffer.from(msg.payload.body.data, 'base64').toString('utf8');
        }
      }

      return {
        id: msg.id,
        subject,
        from,
        date,
        bodyHtml: bodyHtml || bodyText || msg.snippet || 'No content',
        bodyText,
      };
    });

    return NextResponse.json({ id: data.id, messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
