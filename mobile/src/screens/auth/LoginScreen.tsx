import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { resendVerificationRequest } from '../../auth/auth.api';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { AppScreen, AuthHeader } from '../../components/ui/AppScreen';
import { AuthStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../theme/ThemeContext';
import { API_URL } from '../../utils/constants';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <AppScreen
      hero={
        <AuthHeader
          title="Inicia sesión"
          subtitle="Gestiona las citas de tu negocio."
        />
      }
      contentStyle={styles.form}
    >
      <View style={styles.form}>
        <AppInput
          label="Email"
          placeholder="tu@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <AppInput
          label="Contraseña"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {__DEV__ ? <Text style={styles.debug}>API: {API_URL}</Text> : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        {showResendVerification ? (
          <AppButton
            label="Reenviar correo de verificación"
            variant="secondary"
            onPress={() => void handleResendVerification()}
            loading={isResending}
          />
        ) : null}

        <AppButton
          label="Iniciar sesión"
          onPress={() => void handleLogin()}
          loading={isSubmitting}
        />

        <View style={styles.links}>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Crear cuenta</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('VerifyEmail')}>
            <Text style={styles.linkMuted}>Ya tengo el código de verificación</Text>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
  form: {
    paddingHorizontal: 28,
    gap: 16,
  },
  links: {
    gap: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  link: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  linkMuted: {
    color: colors.textMuted,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
  info: {
    color: colors.primary,
    fontSize: 14,
  },
  debug: {
    color: colors.textSoft,
    fontSize: 12,
  },
  });
