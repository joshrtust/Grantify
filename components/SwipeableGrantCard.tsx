import React from 'react';
import { ImageBackground, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

export interface Grant {
  id: string;
  university: string;
  question: string;
  priceRange: string;
  validUntil: string;
  backgroundImage?: string;
  url?: string;
}

interface SwipeableGrantCardProps {
  grant: Grant;
  animatedStyle?: ReturnType<typeof useAnimatedStyle>;
  leftOverlayStyle?: ReturnType<typeof useAnimatedStyle>;
  rightOverlayStyle?: ReturnType<typeof useAnimatedStyle>;
}

export default function SwipeableGrantCard({ grant, animatedStyle, leftOverlayStyle, rightOverlayStyle }: SwipeableGrantCardProps) {
  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: '88%',
          height: '65%',
          maxWidth: 380,
          maxHeight: 650,
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

      {/* Swipe Left Overlay (Discard - Red) */}
      {leftOverlayStyle && (
        <Animated.View
          style={[
            leftOverlayStyle,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 20,
            },
          ]}
        >
          <Text className="text-white text-4xl font-bold">✕</Text>
          <Text className="text-white text-xl font-semibold mt-2">DISCARD</Text>
        </Animated.View>
      )}

      {/* Swipe Right Overlay (Accept - Green) */}
      {rightOverlayStyle && (
        <Animated.View
          style={[
            rightOverlayStyle,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 20,
            },
          ]}
        >
          <Text className="text-white text-4xl font-bold">✓</Text>
          <Text className="text-white text-xl font-semibold mt-2">ACCEPT</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}
