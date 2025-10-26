# Musico - Discover Music

A modern, beautiful music discovery app built with Next.js, React, and TypeScript. Discover and explore music with detailed information, cover art, and listening links sourced from MusicBrainz.

## ✨ Features

- 🎵 **Music Discovery**: Explore the latest releases and timeless classics
- 🎨 **Beautiful UI**: Modern design with dark/light theme support
- 📱 **PWA Support**: Install as a native app on mobile and desktop
- 🔍 **Advanced Search**: Search by artist, album, or track
- ❤️ **Favorites**: Save your favorite songs and build playlists
- 🎯 **Offline Ready**: Basic offline functionality with service worker
- 📊 **Detailed Info**: Comprehensive music metadata from MusicBrainz

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd musico
```

2. Install dependencies:
```bash
npm install
```

3. Generate PWA icons:
```bash
npm run generate-icons
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 PWA Installation

Musico is a Progressive Web App (PWA) that can be installed on your device:

### Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Tap the "Share" button
3. Select "Add to Home Screen" or "Install App"

### Desktop (Chrome/Edge)
1. Open the app in your browser
2. Click the install icon in the address bar or use the app menu

### Features
- **Offline Support**: Basic caching for faster loading
- **Native App Experience**: Runs fullscreen without browser UI
- **Push Notifications**: Ready for future notification features
- **Background Sync**: Automatic data synchronization

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate-icons` - Generate PWA icons from SVG

## 🏗️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Heroicons
- **Data Source**: MusicBrainz API
- **PWA**: Service Worker + Web App Manifest

## 📊 Data Source

Song information is sourced from [MusicBrainz](https://musicbrainz.org/), the open music encyclopedia. If a song is not available in MusicBrainz, it cannot be displayed in this app.

## 🎨 Customization

### Themes
The app supports both light and dark themes that automatically adapt to your system preferences.

### PWA Icons
Icons are generated from `public/icon.svg`. To customize:
1. Edit the SVG file
2. Run `npm run generate-icons` to regenerate PNG icons

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.
