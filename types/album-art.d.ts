declare module 'album-art' {
  function albumArt(artist: string, album: string): Promise<string | null>;
  export = albumArt;
}