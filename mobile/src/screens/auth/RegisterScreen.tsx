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
  SegmentedButtons,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { clearError } from '../../store/slices/authSlice';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { error } = useSelector((state: any) => state.auth);

  // Use the new useAuth hook instead of the old Redux auth slice
  const { register, isRegisterLoading, error: registerError } = useAuth();

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error.message || 'Registration failed');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (registerError) {
      Alert.alert(
        'Registration Error',
        registerError.message || 'Registration failed',
      );
    }
  }, [registerError]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validation
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.passwordConfirm ||
      !formData.firstName ||
      !formData.lastName
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isValidEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.passwordConfirm,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        role: formData.role,
      };

      const result = await register(userData);
      console.log('Registration result:', JSON.stringify(result));
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.log('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = phone => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleBackToLogin = () => {
    navigation.goBack();
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
          {/* Header */}
          <View style={styles.header}>
            <Title style={styles.title}>Create Account</Title>
            <Paragraph style={styles.subtitle}>
              Join Sajilo Life for fast and reliable delivery services
            </Paragraph>
          </View>

          {/* Registration Form */}
          <Card style={styles.card}>
            <Card.Content>
              {/* Role Selection */}
              <SegmentedButtons
                value={formData.role}
                onValueChange={value => updateFormData('role', value)}
                buttons={[
                  { value: 'customer', label: 'Customer' },
                  { value: 'partner', label: 'Partner' },
                ]}
                style={styles.roleSelector}
              />

              {/* Personal Information */}
              <View style={styles.row}>
                <TextInput
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={value => updateFormData('firstName', value)}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  left={<TextInput.Icon icon="account" />}
                />
                <TextInput
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={value => updateFormData('lastName', value)}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
              </View>

              <TextInput
                label="Username"
                value={formData.username}
                onChangeText={value => updateFormData('username', value)}
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                left={<TextInput.Icon icon="account-circle" />}
              />

              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={value => updateFormData('email', value)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Phone (Optional)"
                value={formData.phone}
                onChangeText={value => updateFormData('phone', value)}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
              />

              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={value => updateFormData('password', value)}
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

              <TextInput
                label="Confirm Password"
                value={formData.passwordConfirm}
                onChangeText={value => updateFormData('passwordConfirm', value)}
                mode="outlined"
                secureTextEntry={!showPasswordConfirm}
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showPasswordConfirm ? 'eye-off' : 'eye'}
                    onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  />
                }
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={isLoading || isRegisterLoading}
                disabled={isLoading || isRegisterLoading}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
              >
                {isLoading || isRegisterLoading
                  ? 'Creating Account...'
                  : 'Create Account'}
              </Button>

              <Button
                mode="text"
                onPress={handleBackToLogin}
                style={styles.backButton}
              >
                Already have an account? Sign In
              </Button>
            </Card.Content>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
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
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
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
  roleSelector: {
    marginBottom: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  halfInput: {
    flex: 0.48,
  },
  registerButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    marginBottom: theme.spacing.md,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
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

export default RegisterScreen;
