import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

// Helper to find or create a Google Drive folder
async function getOrCreateFolder(folderName: string, parentId: string, accessToken: string): Promise<string | null> {
  const query = encodeURIComponent(`name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!searchRes.ok) {
    const text = await searchRes.text();
    console.error("Search Folder Error:", text);
    throw new Error(`Search Folder Error: ${text}`);
  }
  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) return searchData.files[0].id;

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: folderName, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }),
  });
  if (!createRes.ok) {
    const text = await createRes.text();
    console.error("Create Folder Error:", text);
    throw new Error(`Create Folder Error: ${text}`);
  }
  const createData = await createRes.json();
  return createData.id;
}

// Helper to get a map of { fileName: fileId } for a folder
async function getFilesInFolder(folderId: string, accessToken: string): Promise<Record<string, string>> {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return {};
  const data = await res.json();
  const map: Record<string, string> = {};
  (data.files || []).forEach((f: any) => { map[f.name] = f.id; });
  return map;
}

// Helper to upload a text file to Drive (creates new or updates existing)
async function uploadTextFile(name: string, content: string, parentId: string, accessToken: string, existingFileId?: string) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const metadata: any = { name, mimeType: 'text/plain' };
  if (!existingFileId) {
    metadata.parents = [parentId]; // Only set parents when creating, not updating
  }
  
  const multipartRequestBody = delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    content +
    close_delim;

  const url = existingFileId 
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    
  await fetch(url, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { journals, dreams, goals, brainNotes, relationships } = await req.json();

    // 1. Ensure Folder Structure
    const rootId = await getOrCreateFolder('Life OS', 'root', session.accessToken);
    if (!rootId) throw new Error("Root folder fail");
    
    // Create subfolders
    const journalFolder = await getOrCreateFolder('Journals', rootId, session.accessToken);
    const dreamsFolder = await getOrCreateFolder('Dreams', rootId, session.accessToken);
    const goalsFolder = await getOrCreateFolder('Goals', rootId, session.accessToken);
    const notesFolder = await getOrCreateFolder('Brain Notes', rootId, session.accessToken);
    const relsFolder = await getOrCreateFolder('Relationships Data', rootId, session.accessToken);

    if (!journalFolder || !dreamsFolder || !goalsFolder || !notesFolder || !relsFolder) throw new Error("Subfolder fail");

    // Fetch existing files in all subfolders
    const [jFiles, dFiles, gFiles, nFiles, rFiles] = await Promise.all([
      getFilesInFolder(journalFolder, session.accessToken),
      getFilesInFolder(dreamsFolder, session.accessToken),
      getFilesInFolder(goalsFolder, session.accessToken),
      getFilesInFolder(notesFolder, session.accessToken),
      getFilesInFolder(relsFolder, session.accessToken)
    ]);

    // 2. Upload Data (Parallel to speed up, but chunked)
    const promises: Promise<any>[] = [];

    // Journals
    (journals || []).forEach((j: any) => {
      const fileName = `Journal_${j.date}.txt`;
      const content = `Date: ${j.date}\nMood: ${j.mood}\n\nWhat happened:\n${j.what}\n\nWins:\n${j.wins}\n\nFailures:\n${j.failures}\n\nNotes:\n${j.notes}`;
      promises.push(uploadTextFile(fileName, content, journalFolder, session.accessToken, jFiles[fileName]));
    });

    // Dreams
    (dreams || []).forEach((d: any) => {
      const fileName = `Dream_${d.title}.txt`;
      const content = `Title: ${d.title}\nCategory: ${d.category}\nTags: ${(d.tags || []).join(', ')}\n\nWhy:\n${d.why}\n\nSteps:\n${d.steps}`;
      promises.push(uploadTextFile(fileName, content, dreamsFolder, session.accessToken, dFiles[fileName]));
    });

    // Goals
    (goals || []).forEach((g: any) => {
      const fileName = `Goal_${g.title}.txt`;
      const content = `Title: ${g.title}\nCategory: ${g.category}\nTarget Date: ${g.targetDate}\nProgress: ${g.progress}%\n\nNotes:\n${g.notes}`;
      promises.push(uploadTextFile(fileName, content, goalsFolder, session.accessToken, gFiles[fileName]));
    });

    // Notes
    (brainNotes || []).forEach((n: any) => {
      const fileName = `Note_${n.title}.txt`;
      const content = `Title: ${n.title}\nFolder: ${n.folder}\nTags: ${(n.tags || []).join(', ')}\n\nContent:\n${n.content}`;
      promises.push(uploadTextFile(fileName, content, notesFolder, session.accessToken, nFiles[fileName]));
    });

    // Relationships Metadata
    (relationships || []).forEach((r: any) => {
      const fileName = `Person_${r.name}.txt`;
      let content = `Name: ${r.name}\nNickname: ${r.nickname || 'None'}\nType: ${r.type}\nBirthday: ${r.birthday || 'Unknown'}\n`;
      content += `Phone: ${r.phone || 'None'}\nInstagram: ${r.instagram || 'None'}\nLocation: ${r.location || 'Unknown'}\n`;
      content += `\nLikes: ${r.likes || 'None'}\nDislikes: ${r.dislikes || 'None'}\nFav Food: ${r.favFood || 'None'}\nGift Ideas: ${r.giftIdeas || 'None'}\n`;
      content += `\nNotes:\n${r.notes || 'None'}\n`;
      
      content += `\n--- Memories ---\n`;
      (r.memories || []).forEach((m: any) => { content += `[${m.date}] ${m.note}\n`; });
      
      content += `\n--- Conversations ---\n`;
      (r.conversationLog || []).forEach((c: any) => { content += `[${c.date}] ${c.note}\n`; });

      promises.push(uploadTextFile(fileName, content, relsFolder, session.accessToken, rFiles[fileName]));
    });

    // Wait for all uploads to complete
    await Promise.allSettled(promises);

    return NextResponse.json({ success: true, count: promises.length });
  } catch (err: any) {
    console.error('Drive Sync Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
