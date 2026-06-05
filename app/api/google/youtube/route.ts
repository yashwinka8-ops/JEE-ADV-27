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
    // Fetch liked videos playlist
    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!channelRes.ok) {
      const err = await channelRes.json();
      return NextResponse.json({ error: err.error?.message || 'Failed to fetch YouTube' }, { status: channelRes.status });
    }

    const channelData = await channelRes.json();
    const likedPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.likes;

    let videos: any[] = [];

    if (likedPlaylistId) {
      const playlistRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${likedPlaylistId}&maxResults=12`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (playlistRes.ok) {
        const playlistData = await playlistRes.json();
        videos = (playlistData.items || []).map((item: any) => ({
          id: item.snippet?.resourceId?.videoId || item.id,
          title: item.snippet?.title || '(Untitled)',
          thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
          channelTitle: item.snippet?.videoOwnerChannelTitle || item.snippet?.channelTitle || '',
          publishedAt: item.snippet?.publishedAt || '',
        }));
      }
    }

    // If no liked videos, try subscriptions feed
    if (videos.length === 0) {
      const subRes = await fetch(
        'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=12&order=relevance',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (subRes.ok) {
        const subData = await subRes.json();
        videos = (subData.items || []).map((item: any) => ({
          id: item.snippet?.resourceId?.channelId || item.id,
          title: item.snippet?.title || '(Untitled)',
          thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
          channelTitle: item.snippet?.title || '',
          publishedAt: item.snippet?.publishedAt || '',
          isChannel: true,
        }));
      }
    }

    return NextResponse.json({ videos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
