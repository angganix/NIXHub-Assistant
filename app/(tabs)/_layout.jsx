import { Tabs } from 'expo-router';
import { MessageCircle, Boxes, Compass, Library, Settings } from 'lucide-react-native';
import { useLocale } from '../../src/core/i18n/locale-context';
import { useTheme } from '../../src/core/theme/theme-context';

const icons = { chat: MessageCircle, models: Boxes, explore: Compass, library: Library, settings: Settings };
const routes = ['chat', 'models', 'explore', 'library', 'settings'];

export default function TabLayout() {
  const { t } = useLocale();
  const { colors } = useTheme();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 62, paddingTop: 7, paddingBottom: 6 },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
    }}>
      {routes.map((route) => {
        const Icon = icons[route];
        return <Tabs.Screen key={route} name={route} options={{ title: t(`tabs.${route}`), tabBarIcon: ({ color, size }) => <Icon color={color} size={size} /> }} />;
      })}
    </Tabs>
  );
}
