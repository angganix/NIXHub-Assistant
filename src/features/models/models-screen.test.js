import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ModelsScreen from './models-screen';
import { providerAccountService, listProviderAccounts } from '../../core/providers/runtime';

jest.mock('lucide-react-native', () => ({ Check: 'Check', Plus: 'Plus', Trash2: 'Trash2', Wifi: 'Wifi' }));
jest.mock('../../components/ui/screen', () => ({ Screen: ({ children }) => children }));
jest.mock('../../core/i18n/locale-context', () => ({ useLocale: () => ({ t: (key) => key }) }));
jest.mock('../../core/providers/runtime', () => ({
  listProviderAccounts: jest.fn().mockResolvedValue([]),
  providerAccountService: { saveProvider: jest.fn().mockResolvedValue({ id: 'p' }), fetchModels: jest.fn().mockResolvedValue({ models: [], manualModelIdAllowed: true }), setModels: jest.fn(), testConnection: jest.fn(), deleteProvider: jest.fn() },
}));

test('provider form saves endpoint and clears API key when editor closes', async () => {
  const screen = render(<ModelsScreen />);
  fireEvent.press(screen.getByLabelText('models.add'));
  fireEvent.changeText(screen.getByLabelText('models.name'), 'My API');
  fireEvent.changeText(screen.getByLabelText('models.apiKey'), 'super-secret');
  fireEvent.press(screen.getByText('models.save'));
  await waitFor(() => expect(providerAccountService.saveProvider).toHaveBeenCalledWith(expect.objectContaining({ label: 'My API', apiKey: 'super-secret', format: 'openai' })));
  await waitFor(() => expect(screen.queryByLabelText('models.apiKey')).toBeNull());
  expect(listProviderAccounts).toHaveBeenCalled();
});

test('manual model is added and fetch-cache refresh populates provider registry', async () => {
  const account = { id: 'p', label: 'API', baseUrl: 'https://api.example.test', format: 'openai', models: [] };
  listProviderAccounts.mockResolvedValue([account]);
  const screen = render(<ModelsScreen />);
  fireEvent.changeText(await screen.findByLabelText('models.manualModel'), 'manual-1');
  fireEvent.press(screen.getByLabelText('models.addManual'));
  await waitFor(() => expect(providerAccountService.setModels).toHaveBeenCalledWith('p', ['manual-1']));
  await waitFor(() => expect(listProviderAccounts.mock.calls.length).toBeGreaterThanOrEqual(3));
});

test('delete confirmation calls account deletion and refreshes provider list', async () => {
  const account = { id: 'p', label: 'API', baseUrl: 'https://api.example.test', format: 'openai', models: [] };
  listProviderAccounts.mockResolvedValue([account]);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => buttons[1].onPress());
  const screen = render(<ModelsScreen />);
  fireEvent.press(await screen.findByLabelText('models.delete'));
  await waitFor(() => expect(providerAccountService.deleteProvider).toHaveBeenCalledWith('p'));
  expect(alert).toHaveBeenCalled();
  alert.mockRestore();
});
