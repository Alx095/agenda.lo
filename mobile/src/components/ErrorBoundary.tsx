import { Component, ErrorInfo, PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<
  PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Algo salió mal</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FEF2F2',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#7F1D1D',
    textAlign: 'center',
  },
});
