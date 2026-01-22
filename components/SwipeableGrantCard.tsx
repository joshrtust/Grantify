import React from 'react';
import { ImageBackground, Text, View, ViewStyle, StyleSheet } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';

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
  animatedStyle?: AnimatedStyle<ViewStyle>;
  leftOverlayStyle?: AnimatedStyle<ViewStyle>;
  rightOverlayStyle?: AnimatedStyle<ViewStyle>;
}

export default function SwipeableGrantCard({ grant, animatedStyle, leftOverlayStyle, rightOverlayStyle }: SwipeableGrantCardProps) {
  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          width: '88%',
          height: '65%',
          maxWidth: 380,
          maxHeight: 650,
          borderRadius: 20,
          backgroundColor: '#1a1a1a',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          overflow: 'hidden',
        },
      ]}
    >
      {grant.backgroundImage && (
        <ImageBackground
          source={{ uri: grant.backgroundImage }}
          resizeMode="cover"
          style={styles.backgroundImage}
        />
      )}
      {!grant.backgroundImage && (
        <View style={styles.backgroundFallback} />
      )}
      <View style={styles.content}>
        <View>
          <Text style={styles.university}>
            {grant.university}
          </Text>
          <Text style={styles.question}>
            {grant.question}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.label}>Grant price:</Text>
          <Text style={styles.priceRange}>
            {grant.priceRange}
          </Text>
          <Text style={styles.validUntil}>
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
          <Text style={styles.overlayIcon}>✕</Text>
          <Text style={styles.overlayText}>DISCARD</Text>
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
          <Text style={styles.overlayIcon}>✓</Text>
          <Text style={styles.overlayText}>ACCEPT</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  backgroundFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366f1',
    opacity: 0.1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  university: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  question: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 24,
    lineHeight: 36,
  },
  footer: {
    marginTop: 'auto',
  },
  label: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  priceRange: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  validUntil: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  overlayIcon: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
});
