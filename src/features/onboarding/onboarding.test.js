import { render, fireEvent } from '@testing-library/react-native';
import OnboardingScreen from './onboarding';
import { completeOnboarding } from './onboarding-state';
import { router } from 'expo-router';

jest.mock('lucide-react-native', () => ({ ShieldCheck: 'ShieldCheck', Sparkles: 'Sparkles' }));
jest.mock('../../components/ui/screen', () => ({ Screen: ({ children }) => children }));
jest.mock('expo-router', () => ({ router: { replace: jest.fn(), push: jest.fn() } }));
jest.mock('../../core/i18n/locale-context', () => ({ useLocale: () => ({ t: (key) => key }) }));
jest.mock('./onboarding-state', () => ({ completeOnboarding: jest.fn().mockResolvedValue(undefined) }));

test('onboarding requires disclosure acknowledgment for provider setup but allows skip', async () => {
  const screen = render(<OnboardingScreen />);
  const setup = screen.getByText('onboarding.addProvider').parent.parent;
  expect(setup.props.accessibilityState.disabled).toBe(true);
  fireEvent.press(setup);
  expect(router.replace).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('onboarding.acknowledge'));
  expect(screen.getByText('onboarding.addProvider').parent.parent.props.accessibilityState.disabled).toBe(false);
  fireEvent.press(screen.getByText('onboarding.skip'));
  expect(completeOnboarding).toHaveBeenCalled();
  await new Promise((resolve) => setImmediate(resolve));
  expect(router.replace).toHaveBeenCalledWith('/(tabs)/chat');
});
