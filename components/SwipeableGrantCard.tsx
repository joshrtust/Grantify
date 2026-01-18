import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

export interface Grant {
  id: string;
  university: string;
  question: string;
  priceRange: string;
  validUntil: string;
  backgroundImage?: string;
}

interface SwipeableGrantCardProps {
  grant: Grant;
  animatedStyle?: ReturnType<typeof useAnimatedStyle>;
}

export default function SwipeableGrantCard({ grant, animatedStyle }: SwipeableGrantCardProps) {
  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: '90%',
          height: '70%',
          maxWidth: 400,
          maxHeight: 600,
        },
      ]}
      className="absolute rounded-card bg-background-card shadow-lg overflow-hidden"
    >
      {grant.backgroundImage && (
        <ImageBackground
          source={{ uri: grant.backgroundImage }}
          resizeMode="cover"
          style={{
            width: '100%',
            height: '100%',
            opacity: 0.3,
          }}
          className="absolute inset-0"
        />
      )}
      {!grant.backgroundImage && (
        <View
          className="absolute inset-0 bg-primary-purple"
          style={{ opacity: 0.1 }}
        />
      )}
      <View className="flex-1 p-6 justify-between">
        <View>
          <Text className="text-text-secondary text-base font-medium mb-4">
            {grant.university}
          </Text>
          <Text className="text-text-primary text-3xl font-bold mb-6 leading-tight">
            {grant.question}
          </Text>
        </View>
        <View className="mt-auto">
          <Text className="text-text-secondary text-sm mb-1">Grant price:</Text>
          <Text className="text-text-primary text-xl font-semibold mb-4">
            {grant.priceRange}
          </Text>
          <Text className="text-text-secondary text-xs text-center">
            valid until {grant.validUntil}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
