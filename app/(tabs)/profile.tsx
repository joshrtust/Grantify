import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function Profile() {
  const menuItems = [
    { icon: 'person.fill', title: 'Personal Information', subtitle: 'Update your profile' },
    { icon: 'bell.fill', title: 'Notifications', subtitle: 'Manage alerts' },
    { icon: 'lock.fill', title: 'Privacy & Security', subtitle: 'Account settings' },
    { icon: 'questionmark.circle.fill', title: 'Help & Support', subtitle: 'Get assistance' },
    { icon: 'info.circle.fill', title: 'About', subtitle: 'App version 1.0.0' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Header */}
      <View className="bg-primary-purple pt-12 pb-8 px-6">
        <Text className="text-white text-3xl font-bold mb-6">Profile</Text>
        
        {/* Profile Card */}
        <View className="bg-background-card rounded-card p-6 shadow-lg">
          <View className="flex-row items-center">
            <View className="bg-primary-purple w-20 h-20 rounded-full items-center justify-center mr-4">
              <IconSymbol name="person.fill" size={40} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-2xl font-bold mb-1">User Name</Text>
              <Text className="text-text-secondary text-sm mb-2">user@example.com</Text>
              <TouchableOpacity className="bg-primary-purple/10 rounded-button px-4 py-2 self-start">
                <Text className="text-primary-purple text-sm font-semibold">Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="px-6 py-4 bg-background-card mx-6 -mt-4 rounded-card shadow-sm">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-text-primary text-2xl font-bold">12</Text>
            <Text className="text-text-secondary text-xs mt-1">Saved Grants</Text>
          </View>
          <View className="w-px bg-background-light" />
          <View className="items-center">
            <Text className="text-text-primary text-2xl font-bold">5</Text>
            <Text className="text-text-secondary text-xs mt-1">Applied</Text>
          </View>
          <View className="w-px bg-background-light" />
          <View className="items-center">
            <Text className="text-text-primary text-2xl font-bold">3</Text>
            <Text className="text-text-secondary text-xs mt-1">Accepted</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
        <View className="px-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="bg-background-card rounded-card p-5 mb-3 flex-row items-center shadow-sm"
            >
              <View className="bg-primary-purple/10 w-12 h-12 rounded-full items-center justify-center mr-4">
                <IconSymbol name={item.icon as 'person.fill' | 'bell.fill' | 'lock.fill' | 'questionmark.circle.fill' | 'info.circle.fill'} size={24} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-base font-semibold mb-1">
                  {item.title}
                </Text>
                <Text className="text-text-secondary text-sm">{item.subtitle}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
