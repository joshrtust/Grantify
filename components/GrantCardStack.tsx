import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import SwipeableGrantCard, { Grant } from './SwipeableGrantCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const ROTATION_MULTIPLIER = 0.1;

interface GrantCardStackProps {
  grants: Grant[];
  onSwipeLeft?: (grant: Grant) => void;
  onSwipeRight?: (grant: Grant) => void;
}

export default function GrantCardStack({ grants, onSwipeLeft, onSwipeRight }: GrantCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [thirdIndex, setThirdIndex] = useState(2);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  // Shared values for swipe feedback overlays
  const leftOverlayOpacity = useSharedValue(0);
  const rightOverlayOpacity = useSharedValue(0);
  
  // Shared values for card stack animations
  const secondCardScale = useSharedValue(0.95);
  const secondCardOffsetY = useSharedValue(10);
  const secondCardOpacity = useSharedValue(0.7);
  const thirdCardScale = useSharedValue(0.9);
  const thirdCardOffsetY = useSharedValue(20);
  const thirdCardOpacity = useSharedValue(0.5);

  // Update shared values when currentIndex changes
  useEffect(() => {
    const hasNext = currentIndex < grants.length - 1;
    const hasThird = currentIndex < grants.length - 2;

    // Animate second card
    secondCardScale.value = withSpring(hasNext ? 0.95 : 1, { damping: 15, stiffness: 100 });
    secondCardOffsetY.value = withSpring(hasNext ? 10 : 0, { damping: 15, stiffness: 100 });
    secondCardOpacity.value = withTiming(hasNext ? 0.7 : 1, { duration: 200 });

    // Animate third card
    thirdCardScale.value = withSpring(hasThird ? 0.9 : 1, { damping: 15, stiffness: 100 });
    thirdCardOffsetY.value = withSpring(hasThird ? 20 : 0, { damping: 15, stiffness: 100 });
    thirdCardOpacity.value = withTiming(hasThird ? 0.5 : 1, { duration: 200 });
  }, [currentIndex, grants.length]);

  const removeCard = (direction: 'left' | 'right') => {
    const currentGrant = grants[currentIndex];
    if (direction === 'left' && onSwipeLeft) {
      onSwipeLeft(currentGrant);
    } else if (direction === 'right' && onSwipeRight) {
      onSwipeRight(currentGrant);
    }

    setCurrentIndex((prev) => prev + 1);
    setNextIndex((prev) => prev + 1);
    setThirdIndex((prev) => prev + 1);

    translateX.value = 0;
    translateY.value = 0;
    rotation.value = 0;
    opacity.value = 1;
    leftOverlayOpacity.value = 0;
    rightOverlayOpacity.value = 0;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-15, 0, 15]
      );
      
      // Update overlay opacity based on swipe direction and distance
      const threshold = 50;
      if (event.translationX < -threshold) {
        // Swiping left (discard)
        leftOverlayOpacity.value = interpolate(
          event.translationX,
          [-SCREEN_WIDTH, -threshold],
          [1, 0],
          'clamp'
        );
        rightOverlayOpacity.value = 0;
      } else if (event.translationX > threshold) {
        // Swiping right (accept)
        rightOverlayOpacity.value = interpolate(
          event.translationX,
          [threshold, SCREEN_WIDTH],
          [0, 1],
          'clamp'
        );
        leftOverlayOpacity.value = 0;
      } else {
        leftOverlayOpacity.value = 0;
        rightOverlayOpacity.value = 0;
      }
    })
    .onEnd((event) => {
      const shouldDismiss = Math.abs(event.translationX) > SWIPE_THRESHOLD;

      if (shouldDismiss) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        translateX.value = withSpring(
          direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
          { damping: 15, stiffness: 100 }
        );
        translateY.value = withSpring(event.translationY * 0.5);
        opacity.value = withTiming(0, { duration: 200 });
        rotation.value = withSpring(direction === 'right' ? 20 : -20);

        setTimeout(() => {
          runOnJS(removeCard)(direction);
        }, 300);
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 100 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        rotation.value = withSpring(0, { damping: 15, stiffness: 100 });
        leftOverlayOpacity.value = withTiming(0, { duration: 200 });
        rightOverlayOpacity.value = withTiming(0, { duration: 200 });
      }
    });

  const mainCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
      zIndex: 3,
    };
  });

  const leftOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: leftOverlayOpacity.value,
    };
  });

  const rightOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: rightOverlayOpacity.value,
    };
  });

  const secondCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: secondCardScale.value },
        { translateY: secondCardOffsetY.value },
      ],
      opacity: secondCardOpacity.value,
      zIndex: 2,
    };
  });

  const thirdCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: thirdCardScale.value },
        { translateY: thirdCardOffsetY.value },
      ],
      opacity: thirdCardOpacity.value,
      zIndex: 1,
    };
  });

  if (currentIndex >= grants.length) {
    return (
      <View className="flex-1 items-center justify-center">
        <View className="p-6 rounded-card bg-background-card">
          <Text className="text-text-primary text-lg text-center">
            No more grants available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      {/* Third card (behind) */}
      {thirdIndex < grants.length && (
        <SwipeableGrantCard
          grant={grants[thirdIndex]}
          animatedStyle={thirdCardStyle}
        />
      )}

      {/* Second card (middle) */}
      {nextIndex < grants.length && (
        <SwipeableGrantCard
          grant={grants[nextIndex]}
          animatedStyle={secondCardStyle}
        />
      )}

      {/* Main card (front) */}
      {currentIndex < grants.length && (
        <GestureDetector gesture={panGesture}>
          <SwipeableGrantCard
            grant={grants[currentIndex]}
            animatedStyle={mainCardStyle}
            leftOverlayStyle={leftOverlayStyle}
            rightOverlayStyle={rightOverlayStyle}
          />
        </GestureDetector>
      )}
    </View>
  );
}
