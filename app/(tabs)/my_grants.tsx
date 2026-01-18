import GrantCardStack from '@/components/GrantCardStack';
import { Grant } from '@/components/SwipeableGrantCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { SafeAreaView, View } from 'react-native';

// Sample grant data - replace with real data later
const sampleGrants: Grant[] = [
  {
    id: '1',
    university: 'University of Ottawa',
    question: 'Are you blind?',
    priceRange: '$40k - $60k',
    validUntil: '25-15',
  },
  {
    id: '2',
    university: 'McGill University',
    question: 'Are you pursuing research?',
    priceRange: '$50k - $70k',
    validUntil: '30-12',
  },
  {
    id: '3',
    university: 'University of Toronto',
    question: 'Are you a graduate student?',
    priceRange: '$30k - $50k',
    validUntil: '20-01',
  },
  {
    id: '4',
    university: 'University of British Columbia',
    question: 'Are you studying engineering?',
    priceRange: '$45k - $65k',
    validUntil: '15-02',
  },
];

export default function MyGrants() {
  const handleSwipeLeft = (grant: Grant) => {
    // Store to logs - will be implemented later
    console.log('Swiped left (saved to logs):', grant);
  };

  const handleSwipeRight = (grant: Grant) => {
    // Save action - will be implemented later
    console.log('Swiped right (saved):', grant);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Purple Header */}
      <View className="bg-primary-purple pt-12 pb-4 items-center justify-center">
        <IconSymbol name="book.fill" size={32} color="#ffffff" />
      </View>

      {/* Main Content Area with Card Stack */}
      <View className="flex-1">
        <GrantCardStack
          grants={sampleGrants}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </View>
    </SafeAreaView>
  );
}
