import { View } from 'react-native';

export function Card({ children, className = '' }) {
  return <View className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>{children}</View>;
}
