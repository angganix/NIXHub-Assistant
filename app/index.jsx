import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { isOnboardingComplete } from '../src/features/onboarding/onboarding-state';

export default function IndexRoute() {
  const [complete, setComplete] = useState(null);
  useEffect(() => { isOnboardingComplete().then(setComplete); }, []);
  if (complete === null) return null;
  return <Redirect href={complete ? '/(tabs)/chat' : '/onboarding'} />;
}
