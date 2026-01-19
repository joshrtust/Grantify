import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function Explore() {
  const categories = [
    { icon: 'book.fill', title: 'Research Grants', count: '24 available' },
    { icon: 'graduationcap.fill', title: 'Student Grants', count: '18 available' },
    { icon: 'building.2.fill', title: 'University Grants', count: '32 available' },
    { icon: 'person.2.fill', title: 'Community Grants', count: '15 available' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Header */}
      <View className="bg-primary-purple pt-12 pb-6 px-6">
        <Text className="text-white text-3xl font-bold mb-2">Explore</Text>
        <Text className="text-white/80 text-base">Discover grants that match your interests</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Categories Grid */}
          <Text className="text-text-primary text-xl font-bold mb-4">Categories</Text>
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category, index) => (
              <View
                key={index}
                className="w-[48%] bg-background-card rounded-card p-6 mb-4 shadow-sm"
              >
                <View className="bg-primary-purple/10 w-16 h-16 rounded-full items-center justify-center mb-4">
                  <IconSymbol name={category.icon as 'book.fill' | 'graduationcap.fill' | 'building.2.fill' | 'person.2.fill'} size={32} color="#6366f1" />
                </View>
                <Text className="text-text-primary text-lg font-semibold mb-1">
                  {category.title}
                </Text>
                <Text className="text-text-secondary text-sm">{category.count}</Text>
              </View>
            ))}
          </View>

          {/* Featured Section */}
          <View className="mt-6">
            <Text className="text-text-primary text-xl font-bold mb-4">Featured Grants</Text>
            <View className="bg-background-card rounded-card p-6 shadow-sm">
              <View className="flex-row items-center mb-4">
                <View className="bg-primary-purple/10 w-12 h-12 rounded-full items-center justify-center mr-4">
                  <IconSymbol name="star.fill" size={24} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary text-lg font-semibold">
                    Top Picks for You
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    Grants tailored to your profile
                  </Text>
                </View>
              </View>
              <View className="bg-primary-purple/5 rounded-button p-4">
                <Text className="text-text-primary text-base text-center">
                  Swipe through grants on the Home tab to discover matches
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
