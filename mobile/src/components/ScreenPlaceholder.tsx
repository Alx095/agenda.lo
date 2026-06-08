import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ScreenPlaceholderProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function ScreenPlaceholder({
  title,
  subtitle,
  children,
}: ScreenPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
});
