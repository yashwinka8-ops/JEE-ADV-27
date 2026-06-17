import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAccessToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

// GET: Fetch lists and tasks for a specific list
export async function GET(req: NextRequest) {
  const token = getAccessToken(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const url = new URL(req.url);
  const listId = url.searchParams.get('listId');

  try {
    // 1. Fetch all task lists
    const listsRes = await fetch(
      'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!listsRes.ok) {
      const err = await listsRes.json();
      return NextResponse.json(
        { error: err.error?.message || 'Failed to fetch task lists' },
        { status: listsRes.status }
      );
    }

    const listsData = await listsRes.json();
    const lists = listsData.items || [];
    
    if (lists.length === 0) {
      return NextResponse.json({ tasks: [], lists: [], defaultListId: null, listTitle: '' });
    }

    // Determine the active list
    const activeList = listId ? lists.find((l: any) => l.id === listId) || lists[0] : lists[0];
    const activeListId = activeList.id;

    // 2. Fetch tasks for the active list
    const params = new URLSearchParams({
      maxResults: '80',
      showCompleted: 'true',
      showHidden: 'true',
    });

    const tasksRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${activeListId}/tasks?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!tasksRes.ok) {
      const err = await tasksRes.json();
      return NextResponse.json(
        { error: err.error?.message || 'Failed to fetch tasks' },
        { status: tasksRes.status }
      );
    }

    const tasksData = await tasksRes.json();
    const tasks = (tasksData.items || []).map((t: any) => ({
      id: t.id,
      title: t.title || '(Untitled)',
      status: t.status || 'needsAction', // 'completed' or 'needsAction'
      due: t.due || null,
      notes: t.notes || '',
      updated: t.updated || '',
      position: t.position || '',
    }));

    return NextResponse.json({
      tasks,
      lists: lists.map((l: any) => ({ id: l.id, title: l.title })),
      activeListId,
      listTitle: activeList.title,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new task in a list
export async function POST(req: NextRequest) {
  const token = getAccessToken(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { listId, title, notes, due } = await req.json();
    if (!listId) return NextResponse.json({ error: 'Missing listId' }, { status: 400 });
    if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });

    const body: any = { title };
    if (notes) body.notes = notes;
    if (due) body.due = due; // Must be RFC 3339 timestamp (e.g. 2026-10-15T00:00:00.000Z)

    const res = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error('Google Tasks POST failed. Response code:', res.status, 'Error:', err);
      return NextResponse.json(
        { error: err.error?.message || 'Failed to create task' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      id: data.id,
      title: data.title,
      status: data.status,
      due: data.due || null,
      notes: data.notes || '',
      updated: data.updated || '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update an existing task's status, title, due date, or notes
export async function PATCH(req: NextRequest) {
  const token = getAccessToken(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { listId, taskId, status, title, notes, due } = await req.json();
    if (!listId || !taskId) return NextResponse.json({ error: 'Missing listId or taskId' }, { status: 400 });

    // Build patch request body. 
    // If completing a task, we set status = 'completed'. If uncompleting, status = 'needsAction'.
    const body: any = {};
    if (status !== undefined) body.status = status;
    if (title !== undefined) body.title = title;
    if (notes !== undefined) body.notes = notes;
    if (due !== undefined) body.due = due;

    const res = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error('Google Tasks PATCH failed. Response code:', res.status, 'Error:', err);
      return NextResponse.json(
        { error: err.error?.message || 'Failed to update task' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      id: data.id,
      title: data.title,
      status: data.status,
      due: data.due || null,
      notes: data.notes || '',
      updated: data.updated || '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a task
export async function DELETE(req: NextRequest) {
  const token = getAccessToken(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const listId = url.searchParams.get('listId');
    const taskId = url.searchParams.get('taskId');

    if (!listId || !taskId) {
      return NextResponse.json({ error: 'Missing listId or taskId' }, { status: 400 });
    }

    const res = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error('Google Tasks DELETE failed. Response code:', res.status, 'Error:', err);
      return NextResponse.json(
        { error: err.error?.message || 'Failed to delete task' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
