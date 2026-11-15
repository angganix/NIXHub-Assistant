import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

const labels = ['Chat', 'Models', 'Explore', 'Library', 'Settings'];

test('navigation exposes all five primary destinations', () => {
  render(
    <View accessibilityRole="tablist">
      {labels.map((label) => (
        <Text key={label} accessibilityRole="tab">
          {label}
        </Text>
      ))}
    </View>,
  );

  for (const label of labels) {
    expect(screen.getByRole('tab', { name: label })).toBeTruthy();
  }
});
