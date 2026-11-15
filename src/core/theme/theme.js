export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
};

export const radii = {
  control: 10,
  card: 12,
  pill: 999,
};

export const palettes = {
  light: {
    background: '#fafafa',
    surface: '#ffffff',
    foreground: '#18181b',
    muted: '#71717a',
    border: '#e4e4e7',
    accent: '#4f46e5',
    danger: '#dc2626',
  },
  dark: {
    background: '#09090b',
    surface: '#18181b',
    foreground: '#fafafa',
    muted: '#a1a1aa',
    border: '#27272a',
    accent: '#818cf8',
    danger: '#f87171',
  },
};

export function resolveTheme(mode, systemScheme = 'light') {
  const scheme = mode === 'system' ? systemScheme : mode;
  return palettes[scheme] ? { scheme, colors: palettes[scheme] } : { scheme: 'light', colors: palettes.light };
}
