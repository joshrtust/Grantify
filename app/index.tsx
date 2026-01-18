import { auth } from '@/FirebaseConfig';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Index = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateInputs = () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email');
      return false;
    }
    if (!password) {
      Alert.alert('Validation Error', 'Please enter your password');
      return false;
    }
    if (isSignUpMode && password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setErrorMessage('');
    
    // password validation, firebase auth requires 6+ digits
    if (isSignUpMode) {
      if (text.length > 0 && text.length < 6) {
        setPasswordError('Password must be at least 6 characters');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleAuth = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    setErrorMessage('');
    try {
      if (isSignUpMode) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        router.replace('/onboarding' as any);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        router.replace('/(tabs)/search' as any);
      }
    } catch (error: any) {
      const errorCode = error?.code || '';
      let displayMessage = '';
      
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
        displayMessage = 'Invalid email or password';
      } else if (errorCode === 'auth/email-already-in-use') {
        displayMessage = 'Email already in use';
      } else if (errorCode === 'auth/weak-password') {
        displayMessage = 'Password is too weak';
      } else if (errorCode === 'auth/invalid-email') {
        displayMessage = 'Invalid email address';
      } else {
        displayMessage = error?.message?.replace('Firebase: ', '') || 'An error occurred';
      }
      
      setErrorMessage(displayMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setPasswordError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Grantify</Text>
          <Text style={styles.subtitle}>
            {isSignUpMode ? 'Create your account' : 'Welcome back'}
          </Text>

          <View style={styles.formContainer}>
            <TextInput 
              style={styles.textInput} 
              placeholder="Email" 
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading}
            />
            <TextInput 
              style={[styles.textInput, passwordError && styles.textInputError]} 
              placeholder="Password" 
              placeholderTextColor="#9ca3af"
              value={password} 
              onChangeText={handlePasswordChange}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            {passwordError ? (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>{passwordError}</Text>
              </View>
            ) : null}

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUpMode ? 'Sign Up' : 'Login'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={toggleMode} disabled={loading}>
              <Text style={[styles.toggleLink, loading && styles.toggleLinkDisabled]}>
                {isSignUpMode ? 'Login' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#374151',
    color: '#ffffff',
  },
  textInputError: {
    borderColor: '#f97316',
    borderWidth: 2,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  toggleText: {
    fontSize: 15,
    color: '#9ca3af',
    marginRight: 6,
  },
  toggleLink: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  toggleLinkDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '500',
  },
  warningContainer: {
    backgroundColor: '#ffedd5',
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    color: '#9a3412',
    fontSize: 14,
    fontWeight: '500',
  },
});
