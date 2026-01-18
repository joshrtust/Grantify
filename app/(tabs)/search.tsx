import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const recentSearches = ['Research Grants', 'Student Funding', 'Engineering Scholarships'];
  const popularSearches = ['Graduate Studies', 'Undergraduate', 'PhD Programs', 'STEM Grants'];

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Header */}
      <View className="bg-primary-purple pt-12 pb-6 px-6">
        <Text className="text-white text-3xl font-bold mb-4">Search</Text>
        
        {/* Search Bar */}
        <View className="bg-white rounded-button flex-row items-center px-4 py-3 shadow-sm">
          <IconSymbol name="magnifyingglass" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-3 text-text-primary text-base"
            placeholder="Search grants, universities..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View className="mb-6">
              <Text className="text-text-primary text-lg font-semibold mb-3">Recent Searches</Text>
              <View className="flex-row flex-wrap">
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSearchQuery(search)}
                    className="bg-background-card rounded-full px-4 py-2 mr-2 mb-2"
                  >
                    <Text className="text-text-primary text-sm">{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Popular Searches */}
          <View>
            <Text className="text-text-primary text-lg font-semibold mb-3">Popular Searches</Text>
            <View className="flex-row flex-wrap">
              {popularSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSearchQuery(search)}
                  className="bg-primary-purple/10 rounded-full px-4 py-2 mr-2 mb-2"
                >
                  <Text className="text-primary-purple text-sm font-medium">{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Search Tips */}
          <View className="mt-8 bg-background-card rounded-card p-6">
            <View className="flex-row items-center mb-3">
              <IconSymbol name="lightbulb.fill" size={24} color="#6366f1" />
              <Text className="text-text-primary text-lg font-semibold ml-3">Search Tips</Text>
            </View>
            <Text className="text-text-secondary text-sm leading-5">
              • Try searching by university name{'\n'}
              • Use keywords like "research" or "scholarship"{'\n'}
              • Filter by price range or deadline{'\n'}
              • Save grants you're interested in
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
