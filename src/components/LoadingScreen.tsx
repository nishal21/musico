'use client';

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentNote, setCurrentNote] = useState(0);

  const musicalNotes = ['♪', '♫', '♬', '♩', '♭', '♯'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNote(prev => (prev + 1) % musicalNotes.length);
    }, 200);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [onComplete, musicalNotes.length]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="text-center relative z-10">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="text-6xl mb-4 animate-bounce">
            {musicalNotes[currentNote]}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Musico
          </h1>
          <p className="text-white/80 text-lg md:text-xl">
            Your Musical Journey Begins
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 md:w-80 mx-auto mb-6">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/60 text-sm mt-2">
            Loading amazing music... {progress}%
          </p>
        </div>

        {/* Musical waveform animation */}
        <div className="flex justify-center items-end space-x-1 h-12">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-cyan-400 to-pink-400 rounded-full animate-pulse"
              style={{
                height: `${20 + Math.sin((Date.now() * 0.001) + i * 0.5) * 15}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating musical notes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl text-white/30 animate-bounce"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + Math.sin(i) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.3}s`
            }}
          >
            {musicalNotes[i % musicalNotes.length]}
          </div>
        ))}
      </div>
    </div>
  );
}