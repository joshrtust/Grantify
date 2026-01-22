/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = theme === 'light' ? props.light : props.dark;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    return Colors[safeTheme][colorName];
  }
}
