'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface MusicItem {
  id: string;
  title: string;
  'artist-credit'?: Array<{ name?: string; artist?: { name?: string } }>;
  artists?: Array<{ name: string }>;
  type?: string;
}

interface MusicCardProps {
  item: MusicItem;
  onClick: () => void;
}

export default function MusicCard({ item, onClick }: MusicCardProps) {
  const { theme } = useTheme();
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const title = item.title || 'Unknown';
  const artist = item['artist-credit']
    ? item['artist-credit'].map(ac => ac.name || (ac.artist && ac.artist.name) || 'Unknown').join(', ')
    : item.artists
    ? item.artists[0].name
    : 'Unknown Artist';
  const type = item.type || 'Release';

  // Simple cache implementation for cover images
  const coverCache = {
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
    set: (key: string, data: any, ttl = 86400000) => { // 24 hours for covers
      if (typeof window === 'undefined') return;
      const item = {
        data: data,
        expiry: Date.now() + ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
    }
  };

  useEffect(() => {
    const loadCover = async () => {
      const cacheKey = `cover_${item.id}`;
      let cachedUrl = coverCache.get(cacheKey);
      if (cachedUrl) {
        setCoverUrl(cachedUrl);
        setLoading(false);
        return;
      }

      try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        // Try Cover Art Archive first
        const caaUrl = `https://coverartarchive.org/release/${item.id}/front`;
        const response = await fetch(caaUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Musico/1.0 (your-email@example.com)'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          coverCache.set(cacheKey, caaUrl);
          setCoverUrl(caaUrl);
        } else {
          throw new Error('Cover Art Archive returned error');
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Cover fetch timed out, trying fallback API');
        } else {
          console.error('Error loading cover from Cover Art Archive:', error);
        }
        
        // Fallback to our API
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for fallback
          
          const encodedArtist = encodeURIComponent(artist);
          const encodedAlbum = encodeURIComponent(title);
          const apiResponse = await fetch(`/api/cover/${encodedArtist}/${encodedAlbum}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (apiResponse.ok) {
            const data = await apiResponse.json();
            if (data.coverUrl) {
              coverCache.set(cacheKey, data.coverUrl);
              setCoverUrl(data.coverUrl);
            }
          }
        } catch (fallbackError) {
          console.error('Error loading cover from fallback API:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCover();
  }, [item.id, artist, title]);

  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer text-center transform hover:scale-105 hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto mb-3 sm:mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
        {loading ? (
          <div className="animate-pulse bg-gray-300 dark:bg-gray-600 w-full h-full rounded-lg"></div>
        ) : coverUrl && !imageError ? (
          <img
            src={coverUrl}
            alt="Cover"
            className="rounded-lg object-cover w-full h-full transition-transform duration-300 hover:scale-110"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm flex flex-col items-center justify-center">
            <div className="text-2xl mb-1">🎵</div>
            <div>No Cover</div>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 truncate text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-1 truncate text-sm sm:text-base">{artist}</p>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Type: {type}</p>
    </div>
  );
}