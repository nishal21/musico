'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, MagnifyingGlassIcon, SpeakerWaveIcon, SpeakerXMarkIcon, BackwardIcon, ForwardIcon, ArrowPathIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid';

interface Station {
  id: number;
  name: string;
}

interface Song {
  album: string;
  artist: string;
  album_art: string;
  station: string;
  song: string;
  url: string;
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [songQueue, setSongQueue] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_JANGO_API_URL || 'http://localhost:3000';
  const proxyUrl = process.env.NEXT_PUBLIC_PROXY_API_URL || '';

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    const filtered = stations.filter(station =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStations(filtered);
  }, [stations, searchQuery]);

  // Update progress bar
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => {
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadedmetadata', updateProgress);

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('loadedmetadata', updateProgress);
      };
    }
  }, [currentSong]);

  const fetchStations = async () => {
    try {
      setApiError(null);
      const response = await fetch(`${apiUrl}/stations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setStations(data.stations);
        setFilteredStations(data.stations);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      setApiError('Unable to connect to music service. Please check your API configuration.');
    }
  };

  const fetchSongQueue = async (stationId: number, count: number = 10) => {
    try {
      const response = await fetch(`${apiUrl}/stations/${stationId}/songs?count=${count}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        // Filter out duplicate songs based on song title and artist
        const uniqueSongs = data.songs.filter((song: Song, index: number, self: Song[]) =>
          index === self.findIndex(s => s.song === song.song && s.artist === song.artist)
        );
        setSongQueue(uniqueSongs);
        setCurrentSongIndex(0);
        return uniqueSongs;
      }
    } catch (error) {
      console.error('Error fetching song queue:', error);
    }
    return [];
  };  const playSong = async (song: Song, stationId: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const proxiedStreamUrl = proxyUrl ? `${proxyUrl}${encodeURIComponent(song.url)}` : song.url;

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = proxiedStreamUrl;
    audio.volume = volume;

    audio.addEventListener('canplaythrough', () => {
      audio.play();
      setIsPlaying(true);
    });

    audio.addEventListener('error', () => {
      setIsPlaying(false);
    });

    audio.addEventListener('play', () => {
      setIsPlaying(true);
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      // Auto-play next song when current song ends
      playNextSong();
    });

    audioRef.current = audio;
  };

  const togglePlayPause = async () => {
    if (!selectedStation) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
    } else if (audioRef.current) {
      // Resume existing audio
      audioRef.current.play();
    } else if (currentSong) {
      // Start new song
      playSong(currentSong, selectedStation.id);
    } else {
      // Fetch and start new song from queue
      const songs = await fetchSongQueue(selectedStation.id, 10);
      if (songs.length > 0) {
        setCurrentSong(songs[0]);
        playSong(songs[0], selectedStation.id);
      }
    }
  };

  const selectStation = async (station: Station) => {
    setSelectedStation(station);
    setIsLoading(true);

    // Fetch song queue for the station
    const songs = await fetchSongQueue(station.id, 100);
    if (songs.length > 0) {
      setCurrentSong(songs[0]);
      playSong(songs[0], station.id);
    }

    setIsLoading(false);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressChange = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const playNextSong = async () => {
    if (songQueue.length === 0 || !selectedStation) return;

    let nextIndex = (currentSongIndex + 1) % songQueue.length;

    // If we're near the end of the queue, fetch more songs
    if (nextIndex <= 2 && songQueue.length < 30) {
      const moreSongs = await fetchSongQueue(selectedStation.id, 20);
      if (moreSongs.length > songQueue.length) {
        // Recalculate nextIndex after fetching more songs
        nextIndex = (currentSongIndex + 1) % songQueue.length;
      }
    }

    setCurrentSongIndex(nextIndex);
    const nextSong = songQueue[nextIndex];
    setCurrentSong(nextSong);
    playSong(nextSong, selectedStation.id);
  };

  const playPreviousSong = async () => {
    if (songQueue.length === 0) return;

    const prevIndex = currentSongIndex === 0 ? songQueue.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
    const prevSong = songQueue[prevIndex];
    setCurrentSong(prevSong);
    playSong(prevSong, selectedStation!.id);
  };

  const getNextStation = () => {
    if (!selectedStation || stations.length === 0) return null;
    const currentIndex = stations.findIndex(s => s.id === selectedStation.id);
    const nextIndex = (currentIndex + 1) % stations.length;
    return stations[nextIndex];
  };

  const getPreviousStation = () => {
    if (!selectedStation || stations.length === 0) return null;
    const currentIndex = stations.findIndex(s => s.id === selectedStation.id);
    const prevIndex = currentIndex === 0 ? stations.length - 1 : currentIndex - 1;
    return stations[prevIndex];
  };

  const playNextStation = async () => {
    const nextStation = getNextStation();
    if (nextStation) {
      await selectStation(nextStation);
    }
  };

  const playPreviousStation = async () => {
    const prevStation = getPreviousStation();
    if (prevStation) {
      await selectStation(prevStation);
    }
  };

  const playRandomStation = async () => {
    if (stations.length === 0) return;

    const randomIndex = Math.floor(Math.random() * stations.length);
    const randomStation = stations[randomIndex];
    await selectStation(randomStation);
  };

  const playRandomSong = async () => {
    if (songQueue.length === 0 || !selectedStation) return;

    const randomIndex = Math.floor(Math.random() * songQueue.length);
    setCurrentSongIndex(randomIndex);
    const randomSong = songQueue[randomIndex];
    setCurrentSong(randomSong);
    playSong(randomSong, selectedStation.id);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Musico
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 font-medium"
              >
                ← Back to Landing
              </button>
              <p className="hidden sm:block text-sm text-gray-400">Stream music from Jango stations</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Stations Sidebar */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 sm:p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 text-gray-200">Stations</h2>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search stations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 text-white placeholder-gray-400 text-sm"
                  />
                </div>
              </div>

              {/* Stations List */}
              <div className="space-y-2 max-h-96 lg:max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {filteredStations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => selectStation(station)}
                    className={`w-full p-3 rounded-xl border transition-all duration-200 text-left group ${
                      selectedStation?.id === station.id
                        ? 'border-blue-500 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:bg-gray-700/50 hover:border-gray-600 text-gray-300'
                    }`}
                  >
                    <h3 className="font-medium text-sm truncate group-hover:text-white transition-colors">
                      {station.name}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Player */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 sm:p-8">
              {selectedStation && currentSong ? (
                <div className="space-y-6">
                  {/* Random Controls */}
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={playRandomStation}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-sm rounded-xl transition-all duration-200 font-medium border border-gray-700 hover:border-gray-600 shadow-lg"
                      title="Random Station"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Random Station</span>
                      <span className="sm:hidden">Station</span>
                    </button>
                    <button
                      onClick={playRandomSong}
                      disabled={songQueue.length === 0}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm rounded-xl transition-all duration-200 font-medium border border-gray-700 hover:border-gray-600 shadow-lg"
                      title="Random Song"
                    >
                      <ArrowsRightLeftIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Random Song</span>
                      <span className="sm:hidden">Song</span>
                    </button>
                  </div>

                  {/* Album Art */}
                  <div className="flex justify-center">
                    {currentSong.album_art ? (
                      <div className="relative group">
                        <img
                          src={currentSong.album_art}
                          alt={`${currentSong.album} cover`}
                          className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto rounded-2xl shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ) : (
                      <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-2xl border border-gray-700">
                        <div className="text-4xl sm:text-6xl lg:text-7xl">🎵</div>
                      </div>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="text-center space-y-2">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                      {currentSong.song}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-300 font-medium">
                      {currentSong.artist}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentSong.album}
                    </p>
                    <p className="text-sm text-blue-400 font-medium bg-blue-500/10 px-3 py-1 rounded-full inline-block mt-2">
                      {selectedStation.name}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <input
                      ref={progressRef}
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => handleProgressChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-400 px-1">
                      <span className="font-mono">{formatTime(currentTime)}</span>
                      <span className="font-mono">{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-4 sm:space-x-6">
                    <button
                      onClick={playPreviousSong}
                      className="p-3 sm:p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-200 border border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl"
                    >
                      <BackwardIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>

                    <button
                      onClick={togglePlayPause}
                      disabled={isLoading}
                      className="p-4 sm:p-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 border-b-2 border-white"></div>
                      ) : isPlaying ? (
                        <PauseIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                      ) : (
                        <PlayIconSolid className="w-7 h-7 sm:w-8 sm:h-8" />
                      )}
                    </button>

                    <button
                      onClick={playNextSong}
                      className="p-3 sm:p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-200 border border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl"
                    >
                      <ForwardIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Station Navigation */}
                  <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                    <button
                      onClick={playPreviousStation}
                      className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm rounded-xl transition-all duration-200 border border-gray-700 hover:border-gray-600"
                    >
                      ← Prev Station
                    </button>
                    <div className="px-3 sm:px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700">
                      <span className="text-xs sm:text-sm text-gray-400 font-mono">
                        {currentSongIndex + 1} / {songQueue.length}
                      </span>
                    </div>
                    <button
                      onClick={playNextStation}
                      className="px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs sm:text-sm rounded-xl transition-all duration-200 border border-gray-700 hover:border-gray-600"
                    >
                      Next Station →
                    </button>
                  </div>

                  {/* Volume & Stream */}
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="flex items-center space-x-3 w-full sm:w-auto max-w-xs">
                      <SpeakerXMarkIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <SpeakerWaveIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>

                    {currentSong.url && (
                      <button
                        onClick={() => window.open(proxyUrl ? `${proxyUrl}${encodeURIComponent(currentSong.url)}` : currentSong.url, '_blank')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        Open Stream
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16 lg:py-20">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 mx-auto mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-gray-700">
                    <div className="text-3xl sm:text-4xl lg:text-5xl">🎵</div>
                  </div>
                  {apiError ? (
                    <div className="space-y-4">
                      <h2 className="text-xl sm:text-2xl font-semibold text-red-400 mb-2">Connection Error</h2>
                      <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto mb-4">
                        {apiError}
                      </p>
                      <button
                        onClick={fetchStations}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-300 mb-2">Select a station</h2>
                      <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                        Choose from {stations.length} available stations to start your music journey
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        }

        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        }

        .scrollbar-thin {
          scrollbar-width: thin;
        }

        .scrollbar-thumb-gray-700 {
          scrollbar-color: rgb(55 65 81) transparent;
        }
      `}</style>
    </div>
  );
}