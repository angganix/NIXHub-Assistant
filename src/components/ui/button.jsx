import { Pressable, Text } from 'react-native';

const variants = {
  primary: 'bg-accent-600 active:bg-accent-700',
  secondary: 'bg-zinc-100 active:bg-zinc-200 dark:bg-zinc-800 dark:active:bg-zinc-700',
  ghost: 'bg-transparent active:bg-zinc-100 dark:active:bg-zinc-800',
};
const labelVariants = {
  primary: 'text-white',
  secondary: 'text-zinc-900 dark:text-zinc-100',
  ghost: 'text-zinc-800 dark:text-zinc-100',
};

export function Button({ title, onPress, variant = 'primary', disabled = false, accessibilityLabel }) {
  const kind = variants[variant] ? variant : 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-11 items-center justify-center rounded-xl px-4 py-2 ${variants[kind]} ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`text-sm font-semibold ${labelVariants[kind]}`}>{title}</Text>
    </Pressable>
  );
}
