import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

// Helper to find or create a Google Drive folder
async function getOrCreateFolder(folderName: string, parentId: string, accessToken: string): Promise<string | null> {
  // 1. Search for the folder
  const query = encodeURIComponent(`name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!searchRes.ok) return null;
  const searchData = await searchRes.json();
  
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id; // Folder exists
  }

  // 2. Create the folder if it doesn't exist
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });

  if (!createRes.ok) return null;
  const createData = await createRes.json();
  return createData.id;
}

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized. No access token.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const relationshipId = formData.get('relationshipId') as string;
    const relationshipName = formData.get('relationshipName') as string || 'Unknown Person';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // -- Ensure Folder Structure Exists --
    const lifeOsFolderId = await getOrCreateFolder('Life OS', 'root', session.accessToken);
    if (!lifeOsFolderId) throw new Error("Could not create Life OS folder");
    
    const relFolderId = await getOrCreateFolder('Relationships', lifeOsFolderId, session.accessToken);
    if (!relFolderId) throw new Error("Could not create Relationships folder");
    
    const personFolderId = await getOrCreateFolder(relationshipName, relFolderId, session.accessToken);
    if (!personFolderId) throw new Error(`Could not create folder for ${relationshipName}`);


    // -- Upload the File --
    const metadata = {
      name: file.name,
      mimeType: file.type,
      description: `Uploaded from LifeOS Tracker for Relationship ID: ${relationshipId}`,
      parents: [personFolderId], // Put it in the specific person's folder
    };

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const fileBuffer = await file.arrayBuffer();

    let multipartRequestBody = delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + file.type + '\r\n\r\n';
    
    const encoder = new TextEncoder();
    const prefixBuffer = encoder.encode(multipartRequestBody);
    const suffixBuffer = encoder.encode(close_delim);
    
    const combinedBuffer = new Uint8Array(prefixBuffer.byteLength + fileBuffer.byteLength + suffixBuffer.byteLength);
    combinedBuffer.set(prefixBuffer, 0);
    combinedBuffer.set(new Uint8Array(fileBuffer), prefixBuffer.byteLength);
    combinedBuffer.set(suffixBuffer, prefixBuffer.byteLength + fileBuffer.byteLength);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combinedBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Drive Upload Error:', errorText);
      return NextResponse.json({ error: 'Failed to upload to Google Drive' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ 
      id: data.id, 
      name: data.name, 
      url: data.webViewLink, 
      mimeType: data.mimeType 
    });

  } catch (error) {
    console.error('Drive Upload API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
