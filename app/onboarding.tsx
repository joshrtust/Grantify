import { auth, db } from '@/FirebaseConfig';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserData {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  city: string;
  school: string;
}

const QUESTIONS = [
  { key: 'firstName' as keyof UserData, question: "What's your first name?", placeholder: 'John', type: 'text' },
  { key: 'lastName' as keyof UserData, question: "What's your last name?", placeholder: 'Doe', type: 'text' },
  { key: 'age' as keyof UserData, question: 'How old are you?', placeholder: '21', type: 'numeric' },
  { key: 'gender' as keyof UserData, question: 'What is your gender?', placeholder: 'Male, Female, Other, Prefer not to say', type: 'text' },
  { key: 'city' as keyof UserData, question: 'Which city do you live in?', placeholder: 'Ottawa', type: 'text' },
  { key: 'school' as keyof UserData, question: 'What school do you attend?', placeholder: 'University Name', type: 'text' },
];

const Onboarding = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    city: '',
    school: '',
  });

  const currentQuestion = QUESTIONS[currentStep];
  const isLastQuestion = currentStep === QUESTIONS.length - 1;

  const handleInputChange = (value: string) => {
    setUserData(prev => ({
      ...prev,
      [currentQuestion.key]: value,
    }));
  };

  const validateCurrentInput = () => {
    const value = userData[currentQuestion.key].trim();
    
    if (!value) {
      Alert.alert('Required', 'Please enter a value to continue');
      return false;
    }

    if (currentQuestion.key === 'age') {
      const age = parseInt(value);
      if (isNaN(age) || age < 1 || age > 150) {
        Alert.alert('Invalid Age', 'Please enter a valid age');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentInput()) {
      return;
    }

    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Error', 'No user logged in');
        return;
      }

      // Save user data to Firestore with auto-generated ID
      const docRef = await addDoc(collection(db, 'users'), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        age: parseInt(userData.age),
        gender: userData.gender,
        city: userData.city,
        school: userData.school,
        email: user.email,
        createdAt: new Date().toLocaleDateString(),
      });

      console.log('Onboarding completed and data saved with ID:', docRef.id);
      
      // Navigate to home
      router.replace('/(tabs)/search' as any);
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    }
  };

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {QUESTIONS.length}
            </Text>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            
            <TextInput
              style={styles.input}
              value={userData[currentQuestion.key]}
              onChangeText={handleInputChange}
              placeholder={currentQuestion.placeholder}
              placeholderTextColor="#9ca3af"
              keyboardType={currentQuestion.type === 'numeric' ? 'numeric' : 'default'}
              autoCapitalize="words"
              autoFocus
              returnKeyType={isLastQuestion ? 'done' : 'next'}
              onSubmitEditing={handleNext}
            />
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handleBack}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.button, styles.nextButton, currentStep === 0 && styles.fullWidthButton]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? 'Complete' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Skip Option */}
          {!isLastQuestion && (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => setCurrentStep(prev => prev + 1)}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'right',
  },
  questionContainer: {
    marginBottom: 32,
  },
  questionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
    lineHeight: 36,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#ffffff',
    backgroundColor: '#374151',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  nextButton: {
    backgroundColor: '#6366f1',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  fullWidthButton: {
    flex: 1,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
});

export default Onboarding;
