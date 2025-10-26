import { NextRequest, NextResponse } from 'next/server';
import albumArt from 'album-art';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artist: string; album: string }> }
) {
  try {
    const { artist, album } = await params;
    const decodedArtist = decodeURIComponent(artist);
    const decodedAlbum = decodeURIComponent(album);

    // album-art has imprecise typings; coerce to any to inspect runtime shape
    const coverUrl: any = await albumArt(decodedArtist, decodedAlbum);

    if (coverUrl && typeof coverUrl === 'object' && coverUrl.url) {
      return NextResponse.json({ coverUrl: coverUrl.url });
    } else if (coverUrl && typeof coverUrl === 'string') {
      return NextResponse.json({ coverUrl });
    } else {
      return NextResponse.json({ error: 'No cover found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching cover:', error);
    return NextResponse.json({ error: 'Failed to fetch cover' }, { status: 500 });
  }
}