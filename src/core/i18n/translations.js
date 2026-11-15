export const translations = {
  id: {
    tabs: { chat: 'Chat', models: 'Model', explore: 'Jelajahi', library: 'Pustaka', settings: 'Pengaturan' },
    app: { name: 'NIXHub Assistant', welcome: 'Asisten AI-mu, dalam satu tempat.', comingSoon: 'Segera hadir', newChat: 'Percakapan baru', noProvider: 'Tambahkan provider untuk mulai chat.', addProvider: 'Tambah provider' },
    chat: { search: 'Cari percakapan', empty: 'Belum ada percakapan. Mulai chat baru.', emptyThread: 'Kirim pesan pertama untuk memulai.', messageInput: 'Pesan', messagePlaceholder: 'Tulis pesan…', send: 'Kirim pesan', cancel: 'Hentikan respons', delete: 'Hapus percakapan', back: 'Kembali', noProvider: 'Belum ada provider aktif. Tambahkan di Model.' },
  },
  en: {
    tabs: { chat: 'Chat', models: 'Models', explore: 'Explore', library: 'Library', settings: 'Settings' },
    app: { name: 'NIXHub Assistant', welcome: 'Your AI assistant, all in one place.', comingSoon: 'Coming soon', newChat: 'New chat', noProvider: 'Add a provider to start chatting.', addProvider: 'Add provider' },
    chat: { search: 'Search conversations', empty: 'No conversations yet. Start a new chat.', emptyThread: 'Send your first message to begin.', messageInput: 'Message', messagePlaceholder: 'Write a message…', send: 'Send message', cancel: 'Stop response', delete: 'Delete conversation', back: 'Back', noProvider: 'No active provider. Add one in Models.' },
  },
};

/** @param {'id'|'en'} locale @param {string} key */
export function translate(locale, key) {
  const value = key.split('.').reduce((node, part) => node?.[part], translations[locale]);
  return typeof value === 'string' ? value : key;
}
