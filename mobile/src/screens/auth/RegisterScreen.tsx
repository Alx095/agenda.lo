import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { pingApi } from '../../api/http';
import { useAuth } from '../../auth/AuthContext';
import { resendVerificationRequest } from '../../auth/auth.api';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { AppScreen, AuthHeader } from '../../components/ui/AppScreen';
import { AuthStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../theme/ThemeContext';
import { API_URL } from '../../utils/constants';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { register, isSubmitting } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [apiStatus, setApiStatus] = useState('comprobando...');

  useEffect(() => {
    void pingApi().then((result) => {
      setApiStatus(result.ok ? `conectado (${result.detail})` : `falló (${result.detail})`);
    });
  }, []);

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);
    setRegisteredEmail(null);
    setEmailSent(true);

    if (!name.trim() || !email.trim() || !password) {
      setError('Completa todos los campos obligatorios');
      return;
    }

    try {
      const response = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setSuccess(response.message);
      setRegisteredEmail(response.email);
      setEmailSent(response.emailSent !== false);
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : 'No se pudo registrar el usuario',
      );
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = registeredEmail ?? email.trim().toLowerCase();
    if (!targetEmail) {
      return;
    }

    setError(null);
    setIsResending(true);

    try {
      const response = await resendVerificationRequest(targetEmail);
      setSuccess(response.message);
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
          title="Crear cuenta"
          subtitle="Regístrate para empezar a agendar."
        />
      }
      contentStyle={styles.form}
    >
      <View style={styles.form}>
        {!success ? (
          <>
            <AppInput
              label="Nombre"
              placeholder="Tu nombre"
              value={name}
              onChangeText={setName}
            />
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
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {__DEV__ ? (
              <Text style={styles.debug}>
                API: {API_URL}
                {'\n'}
                Estado: {apiStatus}
              </Text>
            ) : null}
          </>
        ) : (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Revisa tu correo</Text>
            <Text style={styles.success}>{success}</Text>
          </View>
        )}

        {success && !emailSent ? (
          <Text style={styles.warning}>
            El servidor no pudo enviar el correo. Revisa spam o usa el botón de
            reenvío.
          </Text>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!success ? (
          <AppButton
            label="Registrarse"
            onPress={() => void handleRegister()}
            loading={isSubmitting}
          />
        ) : (
          <>
            {!emailSent ? (
              <AppButton
                label="Reenviar correo de verificación"
                onPress={() => void handleResendVerification()}
                loading={isResending}
              />
            ) : null}
            <AppButton
              label="Verificar con código"
              variant="secondary"
              onPress={() => navigation.navigate('VerifyEmail')}
            />
            <AppButton
              label="Ir a iniciar sesión"
              variant="ghost"
              onPress={() => navigation.navigate('Login')}
            />
          </>
        )}

        {!success ? (
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Ya tengo cuenta</Text>
          </Pressable>
        ) : null}
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
  successBox: {
    gap: 8,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  success: {
    color: colors.success,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  warning: {
    color: '#B45309',
    fontSize: 13,
    lineHeight: 20,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  debug: {
    color: colors.textSoft,
    fontSize: 12,
  },
  });
