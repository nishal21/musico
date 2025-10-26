'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PlayIcon } from '@heroicons/react/24/solid';
import { useTheme } from '@/contexts/ThemeContext';

interface Release {
  id: string;
  title: string;
  'artist-credit'?: Array<{ name?: string; artist?: { name?: string } }>;
  date?: string;
  country?: string;
  disambiguation?: string;
  tags?: Array<{ name: string }>;
  genres?: Array<{ name: string }>;
  rating?: { value: number; 'votes-count': number };
  'label-info'?: Array<{ label?: { name: string } }>;
  'release-group'?: { type?: string };
  media?: Array<{
    tracks?: Array<{
      number: number;
      title: string;
      length?: number;
    }>;
  }>;
}

export default function SongPage() {
  const { theme } = useTheme();
  const params = useParams();
  const id = params.id as string;
  const [release, setRelease] = useState<Release | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverError, setCoverError] = useState(false);

  const baseURL = 'https://musicbrainz.org/ws/2/';
  const headers = {
    'User-Agent': 'Musico/1.0 (your-email@example.com)'
  };

  // Simple cache implementation
  const cache = {
    get: (key: string) => {
      if (typeof window === 'undefined') return null;
      const item = localStorage.getItem(key);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    },
    set: (key: string, data: any, ttl = 3600000) => {
      if (typeof window === 'undefined') return;
      const item = {
        data: data,
        expiry: Date.now() + ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
    }
  };

  useEffect(() => {
    if (id) {
      loadRelease(id);
    }
  }, [id]);

  const loadRelease = async (releaseId: string) => {
    const cacheKey = `release_${releaseId}`;
    let data = cache.get(cacheKey);
    if (data) {
      setRelease(data);
      loadCover(data);
      setLoading(false);
      return;
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${baseURL}release/${releaseId}?inc=artist-credits+recordings+labels+tags+genres+ratings&fmt=json`, { 
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      data = await response.json();
      cache.set(cacheKey, data);
      setRelease(data);
      loadCover(data);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error loading release:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCover = async (rel: Release) => {
    const cacheKey = `cover_${rel.id}`;
    let cachedUrl = cache.get(cacheKey);
    if (cachedUrl) {
      setCoverUrl(cachedUrl);
      return;
    }

    const artist = rel['artist-credit']
      ? rel['artist-credit'].map(ac => ac.name || (ac.artist && ac.artist.name) || 'Unknown').join(', ')
      : 'Unknown Artist';

    try {
      // Try Cover Art Archive first with timeout
      const controller1 = new AbortController();
      const timeoutId1 = setTimeout(() => controller1.abort(), 5000); // 5 second timeout for cover

      try {
        const caaUrl = `https://coverartarchive.org/release/${rel.id}/front`;
        const response = await fetch(caaUrl, { signal: controller1.signal });
        clearTimeout(timeoutId1);
        if (response.ok) {
          cache.set(cacheKey, caaUrl, 86400000); // Cache for 24 hours
          setCoverUrl(caaUrl);
          return;
        }
      } catch (error) {
        clearTimeout(timeoutId1);
        // Continue to fallback
      }

      // Fallback to our API with timeout
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 5000); // 5 second timeout for API

      try {
        const encodedArtist = encodeURIComponent(artist);
        const encodedAlbum = encodeURIComponent(rel.title);
        const apiResponse = await fetch(`/api/cover/${encodedArtist}/${encodedAlbum}`, { signal: controller2.signal });
        clearTimeout(timeoutId2);
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          if (data.coverUrl) {
            cache.set(cacheKey, data.coverUrl, 86400000); // Cache for 24 hours
            setCoverUrl(data.coverUrl);
          }
        }
      } catch (error) {
        clearTimeout(timeoutId2);
        console.error('Error loading cover:', error);
      }
    } catch (error) {
      console.error('Error loading cover:', error);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `(${minutes}:${seconds.toString().padStart(2, '0')})`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-700">Release not found</div>
      </div>
    );
  }

  const artist = release['artist-credit']
    ? release['artist-credit'].map(ac => ac.name || (ac.artist && ac.artist.name) || 'Unknown').join(', ')
    : 'Unknown Artist';
  const type = release['release-group'] ? release['release-group'].type : 'Release';
  const date = release.date || 'Unknown';
  const label = release['label-info'] && release['label-info'][0] && release['label-info'][0].label ? release['label-info'][0].label.name : 'Unknown Label';
  const country = release.country || 'Unknown';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white p-3 sm:p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Link href="/discover" className="text-white hover:text-blue-200 transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              {coverUrl && !coverError ? (
                <img
                  src={coverUrl}
                  alt="Cover"
                  className="rounded-2xl object-cover shadow-lg w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
                  onError={() => setCoverError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="text-gray-500 dark:text-gray-400 text-sm sm:text-lg font-medium flex flex-col items-center">
                    <div className="text-3xl mb-2">🎵</div>
                    <div>No Cover</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-grow">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {release.title}
              </h1>
              <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-6 font-medium">{artist}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <strong className="text-gray-900 dark:text-white text-lg">Type:</strong>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{type}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <strong className="text-gray-900 dark:text-white text-lg">Release Date:</strong>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{date}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <strong className="text-gray-900 dark:text-white text-lg">Label:</strong>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{label}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <strong className="text-gray-900 dark:text-white text-lg">Country:</strong>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{country}</p>
                </div>
                {release.tags && release.tags.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 md:col-span-2">
                    <strong className="text-gray-900 dark:text-white text-lg">Tags:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {release.tags.map((tag) => (
                        <span key={tag.name} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {release.genres && release.genres.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 md:col-span-2">
                    <strong className="text-gray-900 dark:text-white text-lg">Genres:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {release.genres.map((genre) => (
                        <span key={genre.name} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {release.rating && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 md:col-span-2">
                    <strong className="text-gray-900 dark:text-white text-lg">Rating:</strong>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      ⭐ {release.rating.value}/5 ({release.rating['votes-count']} votes)
                    </p>
                  </div>
                )}
                {release.disambiguation && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 md:col-span-2">
                    <strong className="text-gray-900 dark:text-white text-lg">Note:</strong>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 italic">{release.disambiguation}</p>
                  </div>
                )}
              </div>

                            <div className="mb-8">
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Listen:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${release.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-3 sm:px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 sm:gap-3 min-h-[48px]"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1384/1384086.png"
                      alt="YouTube"
                      className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                      loading="lazy"
                    />
                    <span className="hidden sm:inline">YouTube</span>
                    <span className="sm:hidden text-sm">YouTube</span>
                  </a>
                  <a
                    href={`https://open.spotify.com/search/${encodeURIComponent(`${artist} ${release.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-3 sm:px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 sm:gap-3 min-h-[48px]"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/87/87409.png"
                      alt="Spotify"
                      className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                      loading="lazy"
                    />
                    <span className="hidden sm:inline">Spotify</span>
                    <span className="sm:hidden text-sm">Spotify</span>
                  </a>
                  <a
                    href={`https://music.apple.com/us/search?term=${encodeURIComponent(`${artist} ${release.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-3 py-3 sm:px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 sm:gap-3 min-h-[48px]"
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/831/831337.png"
                      alt="Apple Music"
                      className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                      loading="lazy"
                    />
                    <span className="hidden sm:inline">Apple Music</span>
                    <span className="sm:hidden text-sm">Apple Music</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {release.media && release.media[0] && release.media[0].tracks && (
            <div className="mt-8 lg:mt-12">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 gap-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Tracklist:</h3>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Click any track to listen on YouTube</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 lg:p-6">
                <ol className="space-y-2 lg:space-y-3">
                  {release.media[0].tracks.map((track) => (
                    <li key={track.number} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 lg:py-3 px-3 lg:px-4 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 group">
                      <button
                        onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${track.title}`)}`, '_blank')}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-left flex items-center gap-2 group/track flex-1 min-w-0 cursor-pointer"
                        title={`Search for "${track.title}" by ${artist} on YouTube`}
                      >
                        <PlayIcon className="w-3 h-3 lg:w-4 lg:h-4 opacity-0 group-hover/track:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                        <span className="truncate">{track.number}. {track.title}</span>
                      </button>
                      <span className="text-gray-600 dark:text-gray-300 font-mono text-sm lg:text-base mt-1 sm:mt-0 sm:ml-4 flex-shrink-0">
                        {formatDuration(track.length)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}