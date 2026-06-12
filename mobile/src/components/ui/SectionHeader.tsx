import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type Props = {
  title: string;
  count?: number;
};

export function SectionHeader({ title, count }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {count !== undefined ? (
        <Text style={styles.count}>
          {count} {count === 1 ? 'reserva' : 'reservas'}
        </Text>
      ) : null}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.bg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      textTransform: 'capitalize',
    },
    count: {
      fontSize: 13,
      color: colors.textSoft,
    },
  });
}
