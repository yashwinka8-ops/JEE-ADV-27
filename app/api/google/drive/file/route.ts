import { NextRequest, NextResponse } from 'next/server';

function getAccessToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

// DELETE a file from Drive
export async function DELETE(req: NextRequest) {
  const token = getAccessToken(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'No file id' }, { status: 400 });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    return NextResponse.json({ error: 'Delete failed' }, { status: res.status });
  }
  return NextResponse.json({ success: true });
}

// PATCH (rename) a file in Drive
export async function PATCH(req: NextRequest) {
  const token = getAccessToken(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id, name } = await req.json();
  if (!id || !name) return NextResponse.json({ error: 'Missing id or name' }, { status: 400 });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) return NextResponse.json({ error: 'Rename failed' }, { status: res.status });
  return NextResponse.json({ success: true });
}
