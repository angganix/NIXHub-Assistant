export const translations = {
  id: {
    tabs: { chat: 'Chat', models: 'Model', explore: 'Jelajahi', library: 'Pustaka', settings: 'Pengaturan' },
    app: { name: 'NIXHub Assistant', welcome: 'Asisten AI-mu, dalam satu tempat.', comingSoon: 'Segera hadir', newChat: 'Percakapan baru', noProvider: 'Tambahkan provider untuk mulai chat.', addProvider: 'Tambah provider' },
  },
  en: {
    tabs: { chat: 'Chat', models: 'Models', explore: 'Explore', library: 'Library', settings: 'Settings' },
    app: { name: 'NIXHub Assistant', welcome: 'Your AI assistant, all in one place.', comingSoon: 'Coming soon', newChat: 'New chat', noProvider: 'Add a provider to start chatting.', addProvider: 'Add provider' },
  },
};

/** @param {'id'|'en'} locale @param {string} key */
export function translate(locale, key) {
  const value = key.split('.').reduce((node, part) => node?.[part], translations[locale]);
  return typeof value === 'string' ? value : key;
}
