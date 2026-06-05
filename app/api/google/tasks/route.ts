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
    // 1. Get the default task list
    const listsRes = await fetch(
      'https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=1',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!listsRes.ok) {
      const err = await listsRes.json();
      return NextResponse.json({ error: err.error?.message || 'Failed to fetch task lists' }, { status: listsRes.status });
    }

    const listsData = await listsRes.json();
    const defaultList = listsData.items?.[0];
    if (!defaultList) return NextResponse.json({ tasks: [] });

    // 2. Fetch tasks from the default list
    const params = new URLSearchParams({
      maxResults: '30',
      showCompleted: 'false',
      showHidden: 'false',
    });

    const tasksRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${defaultList.id}/tasks?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!tasksRes.ok) {
      const err = await tasksRes.json();
      return NextResponse.json({ error: err.error?.message || 'Failed to fetch tasks' }, { status: tasksRes.status });
    }

    const tasksData = await tasksRes.json();
    const tasks = (tasksData.items || []).map((t: any) => ({
      id: t.id,
      title: t.title || '(Untitled)',
      status: t.status || 'needsAction',
      due: t.due || null,
      notes: t.notes || '',
      updated: t.updated || '',
    }));

    return NextResponse.json({ tasks, listTitle: defaultList.title });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
