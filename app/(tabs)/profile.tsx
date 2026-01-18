import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function Profile() {
  return (
    <SafeAreaView className="flex-1 bg-background-light items-center justify-center">
      <Text className="text-text-primary text-xl">Profile</Text>
      <Text className="text-text-secondary text-sm mt-2">Your profile settings</Text>
    </SafeAreaView>
  );
}
