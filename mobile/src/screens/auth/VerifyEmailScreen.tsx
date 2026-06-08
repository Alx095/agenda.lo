import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { AppScreen, AuthHeader } from '../../components/ui/AppScreen';
import { AuthStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../theme/ThemeContext';
import { extractVerificationToken } from '../../utils/extractVerificationToken';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export function VerifyEmailScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { verifyEmail, isSubmitting } = useAuth();
  const [tokenInput, setTokenInput] = useState(route.params?.token ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.token) {
      setTokenInput(route.params.token);
    }
  }, [route.params?.token]);

  const handleVerify = async () => {
    setError(null);

    const token = extractVerificationToken(tokenInput);

    if (!token) {
      setError('Pega el token o el enlace completo del correo');
      return;
    }

    try {
      await verifyEmail(token);
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : 'No se pudo verificar el correo',
      );
    }
  };

  return (
    <AppScreen
      hero={
        <AuthHeader
          title="Verificar correo"
          subtitle="Pega el enlace o token del mensaje que te enviamos."
        />
      }
      contentStyle={styles.form}
    >
      <View style={styles.form}>
        <AppInput
          label="Enlace o token"
          placeholder="https://.../auth/verify-email?token=..."
          value={tokenInput}
          onChangeText={setTokenInput}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          numberOfLines={4}
          style={styles.textArea}
          hint="Puedes copiar el enlace completo del correo o solo la parte del token."
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppButton
          label="Confirmar correo"
          onPress={() => void handleVerify()}
          loading={isSubmitting}
        />

        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Volver a iniciar sesión</Text>
        </Pressable>
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
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
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
  });
