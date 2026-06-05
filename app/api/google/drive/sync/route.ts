import { NextRequest, NextResponse } from 'next/server';

// Helper: get the Google access token from request header
function getAccessToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

// Helper: find or create a folder in Google Drive
async function getOrCreateFolder(token: string, name: string, parentId?: string): Promise<string> {
  const parentQuery = parentId ? ` and '${parentId}' in parents` : ` and 'root' in parents`;
  const query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentQuery}`;

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) return searchData.files[0].id;

  const meta: any = { name, mimeType: 'application/vnd.google-apps.folder' };
  if (parentId) meta.parents = [parentId];
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(meta),
  });
  const created = await createRes.json();
  return created.id;
}

// Helper: check if a file with given name exists in a folder
async function findFile(token: string, name: string, parentId: string): Promise<string | null> {
  const query = `name='${name}' and '${parentId}' in parents and trashed=false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  if (data.files && data.files.length > 0) return data.files[0].id;
  return null;
}

// Helper: create or update a plain text file in Drive
async function upsertTextFile(token: string, name: string, content: string, parentId: string) {
  const existingId = await findFile(token, name, parentId);
  const blob = new Blob([content], { type: 'text/plain' });

  if (existingId) {
    // Update existing
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' },
      body: blob,
    });
  } else {
    // Create new
    const meta = JSON.stringify({ name, parents: [parentId] });
    const form = new FormData();
    form.append('metadata', new Blob([meta], { type: 'application/json' }));
    form.append('file', blob);
    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  }
}

export async function POST(req: NextRequest) {
  const token = getAccessToken(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated. Please sign in with Google.' }, { status: 401 });

  try {
    const { journals, dreams, goals, brainNotes, relationships } = await req.json();
    let count = 0;

    // Root: Life OS
    const rootId = await getOrCreateFolder(token, 'Life OS');

    // ── Journals ─────────────────────────────────────────────
    if (journals && journals.length > 0) {
      const journalFolderId = await getOrCreateFolder(token, 'Journal', rootId);
      for (const entry of journals) {
        const name = `${entry.date || 'entry'}.txt`;
        const content = [
          `Date: ${entry.date}`,
          `Mood: ${entry.mood || 'N/A'}`,
          `Weather: ${entry.weather || 'N/A'}`,
          `\nEntry:\n${entry.content || ''}`,
          entry.tags?.length ? `\nTags: ${entry.tags.join(', ')}` : '',
        ].join('\n');
        await upsertTextFile(token, name, content, journalFolderId);
        count++;
      }
    }

    // ── Dreams ───────────────────────────────────────────────
    if (dreams && dreams.length > 0) {
      const dreamsFolderId = await getOrCreateFolder(token, 'Dreams', rootId);
      for (const dream of dreams) {
        const name = `${dream.title || 'dream'}.txt`;
        const content = [
          `Title: ${dream.title}`,
          `Category: ${dream.category || 'N/A'}`,
          `Priority: ${dream.priority || 'N/A'}`,
          `Deadline: ${dream.deadline || 'N/A'}`,
          `\nDescription:\n${dream.description || ''}`,
        ].join('\n');
        await upsertTextFile(token, name, content, dreamsFolderId);
        count++;
      }
    }

    // ── Goals ────────────────────────────────────────────────
    if (goals && goals.length > 0) {
      const goalsFolderId = await getOrCreateFolder(token, 'Goals', rootId);
      for (const goal of goals) {
        const name = `${goal.title || 'goal'}.txt`;
        const content = [
          `Title: ${goal.title}`,
          `Progress: ${goal.progress || 0}%`,
          `Category: ${goal.category || 'N/A'}`,
          `Target Date: ${goal.targetDate || 'N/A'}`,
          `\nDescription:\n${goal.description || ''}`,
        ].join('\n');
        await upsertTextFile(token, name, content, goalsFolderId);
        count++;
      }
    }

    // ── Brain Notes ──────────────────────────────────────────
    if (brainNotes && brainNotes.length > 0) {
      const brainFolderId = await getOrCreateFolder(token, 'Second Brain', rootId);
      for (const note of brainNotes) {
        const name = `${note.title || 'note'}.txt`;
        const content = [
          `Title: ${note.title}`,
          `Tags: ${(note.tags || []).join(', ')}`,
          `\nContent:\n${note.content || ''}`,
        ].join('\n');
        await upsertTextFile(token, name, content, brainFolderId);
        count++;
      }
    }

    // ── Relationships ────────────────────────────────────────
    if (relationships && relationships.length > 0) {
      const relRootId = await getOrCreateFolder(token, 'Relationships', rootId);
      for (const rel of relationships) {
        const personFolderId = await getOrCreateFolder(token, rel.name || 'Person', relRootId);
        const name = `${rel.name || 'info'}_profile.txt`;
        const content = [
          `Name: ${rel.name}`,
          `Nickname: ${rel.nickname || ''}`,
          `Type: ${rel.type}`,
          `Birthday: ${rel.birthday || ''}`,
          `Phone: ${rel.phone || ''}`,
          `Instagram: ${rel.instagram || ''}`,
          `Likes: ${(rel.likes || []).join(', ')}`,
          `Dislikes: ${(rel.dislikes || []).join(', ')}`,
          `Notes: ${rel.notes || ''}`,
          `\nMemories (${(rel.memories || []).length}):`,
          ...(rel.memories || []).map((m: any) => `  - [${m.date}] ${m.note}`),
          `\nConversation Logs (${(rel.conversationLogs || []).length}):`,
          ...(rel.conversationLogs || []).map((c: any) => `  - [${c.date}] ${c.summary}`),
        ].join('\n');
        await upsertTextFile(token, name, content, personFolderId);
        count++;
      }
    }

    return NextResponse.json({ success: true, count });
  } catch (err: any) {
    console.error('Sync error:', err);
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 });
  }
}
