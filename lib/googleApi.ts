// lib/googleApi.ts

// Find the Life OS Drive folder
export async function getDriveFolder(accessToken: string): Promise<string | null> {
  const query = "name='Life OS' and mimeType='application/vnd.google-apps.folder' and trashed=false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id, name)`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

// Create the Life OS folder
export async function createDriveFolder(accessToken: string): Promise<string | null> {
  const url = 'https://www.googleapis.com/drive/v3/files';
  
  const metadata = {
    name: 'Life OS',
    mimeType: 'application/vnd.google-apps.folder',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.id;
}

// Find a specific file in the folder
export async function getFileInFolder(accessToken: string, fileName: string, folderId: string): Promise<string | null> {
  const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id)`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

// Upload or update a file in the Drive folder
export async function syncFileToDrive(accessToken: string, fileName: string, fileContent: string, folderId: string) {
  const existingFileId = await getFileInFolder(accessToken, fileName, folderId);
  
  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
    parents: existingFileId ? undefined : [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([fileContent], { type: 'text/plain' }));

  const url = existingFileId 
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

  const method = existingFileId ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Failed to sync ${fileName}`);
  }
  
  return await res.json();
}

// Fetch Google Photos
export async function fetchGooglePhotos(accessToken: string) {
  const today = new Date();
  const dateFilter = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  };

  const url = 'https://photoslibrary.googleapis.com/v1/mediaItems:search';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filters: {
        dateFilter: {
          dates: [dateFilter],
        },
      },
      pageSize: 10,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch Google Photos');
  }
  
  const data = await res.json();
  return data.mediaItems || [];
}

// Upload a binary File object to Google Drive
export async function uploadFileToDrive(accessToken: string, file: File, folderId: string) {
  const metadata = {
    name: file.name,
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const url = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload ${file.name}`);
  }
  
  return await res.json();
}
