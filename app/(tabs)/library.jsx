import { useLocale } from '../../src/core/i18n/locale-context';
import { ComingSoon } from '../../src/components/ui/coming-soon';

export default function LibraryScreen() {
  const { t } = useLocale();
  return <ComingSoon title={t('tabs.library')} />;
}
