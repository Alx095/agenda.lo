import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { resendVerificationRequest } from '../../auth/auth.api';
import { ScreenPlaceholder } from '../../components/ScreenPlaceholder';
import { AuthStackParamList } from '../../types/navigation.types';
import { API_URL } from '../../utils/constants';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, isSubmitting } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const showResendVerification =
    Boolean(error?.toLowerCase().includes('confirmar')) && Boolean(email.trim());

  const handleLogin = async () => {
    setError(null);
    setInfo(null);

    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'No se pudo iniciar sesión',
      );
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setInfo(null);
    setIsResending(true);

    try {
      const response = await resendVerificationRequest(email.trim().toLowerCase());
      setInfo(response.message);
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : 'No se pudo reenviar el correo de verificación',
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ScreenPlaceholder
      title="Login"
      subtitle="Inicia sesión para gestionar tus citas."
    >
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {__DEV__ ? <Text style={styles.debug}>API: {API_URL}</Text> : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        {showResendVerification ? (
          <Pressable
            style={[styles.secondaryButton, isResending && styles.buttonDisabled]}
            onPress={() => void handleResendVerification()}
            disabled={isResending}
          >
            {isResending ? (
              <ActivityIndicator color="#2563EB" />
            ) : (
              <Text style={styles.secondaryButtonText}>Reenviar correo de verificación</Text>
            )}
          </Pressable>
        ) : null}

        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={() => void handleLogin()}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Crear cuenta</Text>
        </Pressable>
      </View>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#2563EB',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
  info: {
    color: '#2563EB',
    fontSize: 14,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
  debug: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },
});
