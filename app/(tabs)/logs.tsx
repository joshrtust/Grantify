import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function Logs() {
  // Sample saved grants - replace with real data later
  const savedGrants = [
    {
      id: '1',
      university: 'University of Ottawa',
      question: 'Are you blind?',
      priceRange: '$40k - $60k',
      date: 'Saved 2 days ago',
    },
    {
      id: '2',
      university: 'McGill University',
      question: 'Are you pursuing research?',
      priceRange: '$50k - $70k',
      date: 'Saved 5 days ago',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Header */}
      <View className="bg-primary-purple pt-12 pb-6 px-6">
        <Text className="text-white text-3xl font-bold mb-2">Saved Grants</Text>
        <Text className="text-white/80 text-base">
          {savedGrants.length} grant{savedGrants.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {/* Content */}
      {savedGrants.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-primary-purple/10 w-24 h-24 rounded-full items-center justify-center mb-6">
            <IconSymbol name="doc.text.fill" size={48} color="#6366f1" />
          </View>
          <Text className="text-text-primary text-xl font-semibold mb-2 text-center">
            No saved grants yet
          </Text>
          <Text className="text-text-secondary text-base text-center">
            Swipe left on grants you're interested in to save them here for later
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            {savedGrants.map((grant) => (
              <TouchableOpacity
                key={grant.id}
                className="bg-background-card rounded-card p-6 mb-4 shadow-sm"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-text-secondary text-sm font-medium mb-1">
                      {grant.university}
                    </Text>
                    <Text className="text-text-primary text-xl font-bold mb-2">
                      {grant.question}
                    </Text>
                  </View>
                  <TouchableOpacity className="ml-4">
                    <IconSymbol name="ellipsis" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-text-secondary text-xs mb-1">Grant price:</Text>
                    <Text className="text-text-primary text-lg font-semibold">
                      {grant.priceRange}
                    </Text>
                  </View>
                  <Text className="text-text-secondary text-xs">{grant.date}</Text>
                </View>

                <View className="flex-row mt-4">
                  <TouchableOpacity className="bg-primary-purple rounded-button px-6 py-3 flex-1 mr-2">
                    <Text className="text-white text-center font-semibold">Apply Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-background-light rounded-button px-6 py-3">
                    <IconSymbol name="trash.fill" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
