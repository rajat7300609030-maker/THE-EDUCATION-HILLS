export interface BackgroundEffect {
  id: string;
  name: string;
  usesIntensity: boolean;
  previewClass: string;
}

export const BACKGROUND_EFFECTS: BackgroundEffect[] = [
  { id: 'none', name: 'None', usesIntensity: false, previewClass: '' },
  { id: 'darken', name: 'Darken', usesIntensity: true, previewClass: 'bg-black/50' },
  { id: 'lighten', name: 'Lighten', usesIntensity: true, previewClass: 'bg-white/50' },
  { id: 'grayscale', name: 'Grayscale', usesIntensity: true, previewClass: 'grayscale' },
  { id: 'sepia', name: 'Sepia', usesIntensity: true, previewClass: 'sepia' },
];
