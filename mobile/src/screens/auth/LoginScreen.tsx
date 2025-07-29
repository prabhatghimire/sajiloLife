import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { theme } from '../../theme';
import { useLoginMutation } from '../../services/apiSlice';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpass123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { error, isLoading: authLoading } = useSelector(state => state.auth);
  const appTheme = useTheme();

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error.message || 'Login failed');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Use the new useAuth hook instead of the old Redux auth slice
  const { login, isLoginLoading, error: loginError } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email, password });
      console.log('Login result:', JSON.stringify(result));
      // await dispatch(login({ email, password })).unwrap();
    } catch (error) {
      console.log('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo and Title */}
          <View style={styles.header}>
            <Text style={[styles.logo, { color: appTheme.colors.primary }]}>
              🚚
            </Text>
            <Title style={styles.title}>Sajilo Life</Title>
            <Paragraph style={styles.subtitle}>
              Fast and reliable delivery services
            </Paragraph>
          </View>

          {/* Login Form */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Welcome Back</Title>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading || authLoading}
                disabled={isLoading || authLoading}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
              >
                {isLoading || authLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                mode="outlined"
                onPress={handleRegister}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
              >
                Create New Account
              </Button>
            </Card.Content>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  card: {
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  loginButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  registerButton: {
    marginBottom: theme.spacing.md,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default LoginScreen;
