import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children, className = '' }) {
  return <SafeAreaView className={`flex-1 bg-zinc-50 dark:bg-zinc-950 ${className}`}>{children}</SafeAreaView>;
}
