import { NextRequest, NextResponse } from 'next/server';

function getAccessToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

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

export async function POST(req: NextRequest) {
  const token = getAccessToken(req);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const relationshipName = formData.get('relationshipName') as string;
    const relationshipId = formData.get('relationshipId') as string;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Create folder structure: Life OS > Relationships > [Person Name]
    const rootRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("name='Life OS' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'root' in parents")}&fields=files(id)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const rootData = await rootRes.json();
    let lifeOsId = rootData.files?.[0]?.id;
    if (!lifeOsId) {
      const r = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Life OS', mimeType: 'application/vnd.google-apps.folder' }),
      });
      lifeOsId = (await r.json()).id;
    }

    const relFolderId = await getOrCreateFolder(token, 'Relationships', lifeOsId);
    const personFolderId = await getOrCreateFolder(token, relationshipName || 'Person', relFolderId);

    // Upload the file
    const arrayBuffer = await file.arrayBuffer();
    const metadata = JSON.stringify({ name: file.name, parents: [personFolderId] });
    const form = new FormData();
    form.append('metadata', new Blob([metadata], { type: 'application/json' }));
    form.append('file', new Blob([arrayBuffer], { type: file.type }));

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      console.error('Upload error:', err);
      return NextResponse.json({ error: 'Google Drive upload failed', detail: err }, { status: 500 });
    }

    const uploaded = await uploadRes.json();
    return NextResponse.json({
      id: uploaded.id,
      name: uploaded.name,
      url: uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`,
      mimeType: uploaded.mimeType,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
