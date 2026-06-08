import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { pingApi } from '../../api/http';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { ScreenPlaceholder } from '../../components/ScreenPlaceholder';
import { AuthStackParamList } from '../../types/navigation.types';
import { API_URL } from '../../utils/constants';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register, isSubmitting } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState('comprobando...');

  useEffect(() => {
    void pingApi().then((result) => {
      setApiStatus(result.ok ? `conectado (${result.detail})` : `falló (${result.detail})`);
    });
  }, []);

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);

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
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : 'No se pudo registrar el usuario',
      );
    }
  };

  return (
    <ScreenPlaceholder
      title="Register"
      subtitle="Crea tu cuenta para empezar."
    >
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
        />
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

        <Text style={styles.debug}>
          API: {API_URL}
          {'\n'}
          Estado: {apiStatus}
        </Text>

        {success ? <Text style={styles.success}>{success}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!success ? (
          <Pressable
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={() => void handleRegister()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Ir a iniciar sesión</Text>
          </Pressable>
        )}

        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Ya tengo cuenta</Text>
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
  success: {
    color: '#16A34A',
    fontSize: 14,
    marginBottom: 8,
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
  debug: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },
});
