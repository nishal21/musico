'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { PlayIcon, HeartIcon, MagnifyingGlassIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <MagnifyingGlassIcon className="w-8 h-8" />,
      title: "Discover Music",
      description: "Explore the latest releases and timeless classics from artists worldwide"
    },
    {
      icon: <HeartIcon className="w-8 h-8" />,
      title: "Create Playlists",
      description: "Save your favorite songs and build personalized collections"
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Floating orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-xl animate-pulse"
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}

        {/* Musical notes floating */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`note-${i}`}
            className="absolute text-4xl text-white/10 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {['♪', '♫', '♬', '♩'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-3xl animate-pulse">🎵</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Musico
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            {theme === 'light' ? (
              <MoonIcon className="w-6 h-6 text-white" />
            ) : (
              <SunIcon className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Your Music,
              </span>
              <br />
              <span className="text-white">Your Way</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover, and fall in love with music like never before.
              Explore millions of songs, create playlists, and let the rhythm guide you.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onEnterApp}
              className="group px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-2">
                <PlayIconSolid className="w-5 h-5 group-hover:animate-pulse" />
                Start Exploring
              </span>
            </button>
            
          </div>

     </div>
      </section>    

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-2xl">🎵</div>
            <span className="text-white font-semibold">Musico</span>
          </div>
          <p className="text-gray-400 text-sm mb-2">
            Song information is sourced from MusicBrainz. If a song is not available in MusicBrainz, it cannot be displayed in this app.
          </p>
          <p className="text-gray-400">
            © 2025 Musico. All rights reserved. Made with ❤️ for music lovers.
          </p>
        </div>
      </footer>
    </div>
  );
}