import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized. No access token.' }, { status: 401 });
    }

    // Fetch the 10 most recent media items
    const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=10', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Photos API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch from Google Photos API' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ mediaItems: data.mediaItems || [] });

  } catch (error) {
    console.error('Photos API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
