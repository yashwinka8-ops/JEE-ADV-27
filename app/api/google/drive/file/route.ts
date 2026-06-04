import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function DELETE(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('id');

    if (!fileId) return NextResponse.json({ error: 'File ID missing' }, { status: 400 });

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.accessToken}` }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Drive Delete Error:", errorData);
      return NextResponse.json({ error: 'Failed to delete from Drive' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name } = body;

    if (!id || !name) return NextResponse.json({ error: 'Missing id or name' }, { status: 400 });

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}`, {
      method: 'PATCH',
      headers: { 
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Drive Rename Error:", errorData);
      return NextResponse.json({ error: 'Failed to rename in Drive' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ id: data.id, name: data.name });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
