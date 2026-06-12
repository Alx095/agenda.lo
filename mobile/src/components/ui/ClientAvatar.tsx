import { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { getInitials } from '../../utils/getInitials';

type Props = {
  name: string;
  size?: number;
  style?: ViewStyle;
};

export function ClientAvatar({ name, size = 40, style }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, size), [colors, size]);

  return (
    <View style={[styles.avatar, style]}>
      <Text style={styles.initials}>{getInitials(name) || '?'}</Text>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors'], size: number) {
  return StyleSheet.create({
    avatar: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initials: {
      fontSize: size * 0.36,
      fontWeight: '700',
      color: colors.primary,
    },
  });
}
