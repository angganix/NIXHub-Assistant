import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import ModelsScreen from '../../src/features/models/models-screen';
import { isOnboardingComplete } from '../../src/features/onboarding/onboarding-state';

export default function ModelsRoute() {
  const [complete, setComplete] = useState(null);
  useFocusEffect(useCallback(() => {
    let active = true;
    isOnboardingComplete().then((value) => { if (active) setComplete(value); });
    return () => { active = false; };
  }, []));
  if (complete === null) return null;
  if (!complete) return <ModelsScreen />;
  return <ModelsScreen />;
}
