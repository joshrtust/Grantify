import { auth, db } from '@/FirebaseConfig';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const SWIPE_THRESHOLD = 120;

interface Grant {
  id: string;
  name: string;
  Requirements: string[];
  Value: string;
  URL?: string;
}

export default function Search() {
  const { width, height } = useWindowDimensions();

  const CARD_WIDTH = width * 0.85;
  const CARD_HEIGHT = height * 0.65;

  const position = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);
  const [swipeColor, setSwipeColor] = useState<'none' | 'right' | 'left'>('none');
  const [grants, setGrants] = useState<Grant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  // Fetch grants from Firestore
  useEffect(() => {
    const fetchGrants = async () => {
      try {
        const grantsSnapshot = await getDocs(collection(db, 'grants'));
        const fetchedGrants: Grant[] = grantsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Grant data:', doc.id, data);
          const requirements = data.Requirements || data.requirements || [];
          return {
            id: doc.id,
            name: data.name || data.Name || 'Unknown Grant',
            Requirements: Array.isArray(requirements) ? requirements : [String(requirements)],
            Value: data.Value || data.value || 'N/A',
            URL: data.URL || data.url || '',
          };
        });
        console.log('Fetched grants:', fetchedGrants);
        setGrants(fetchedGrants);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching grants:', error);
        setLoading(false);
      }
    };

    fetchGrants();
  }, []);

  // Keyboard controls for web
  // left/right arrows to swipe, space/enter to flip
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        swipeOut('left');
      } else if (event.key === 'ArrowRight') {
        swipeOut('right');
      } else if (event.key === ' ' || event.key === 'Enter') {
        flipCard();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [flipped]);

  // Horizontal rotation during swipe
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  // Flip interpolation
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const swipeOut = (direction: 'left' | 'right') => {
    setSwipeColor(direction);

    Animated.timing(position, {
      toValue: { x: direction === 'right' ? width * 1.5 : -width * 1.5, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(async () => {
      // Save to applications collection if swiped right
      const currentUser = auth.currentUser; // Get fresh user state
      
      console.log('=== SWIPE DEBUG ===');
      console.log('Current user object:', currentUser);
      console.log('User UID:', currentUser?.uid);
      console.log('User email:', currentUser?.email);
      console.log('Auth state:', auth);
      
      if (direction === 'right' && currentUser && grants[currentIndex]) {
        try {
          console.log('Saving application for UserID:', currentUser.uid);
          console.log('Grant ID:', grants[currentIndex].id);
          
          // Check if application already exists
          const existingApplicationQuery = query(
            collection(db, 'applications'),
            where('UserID', '==', currentUser.uid),
            where('GrantID', '==', grants[currentIndex].id)
          );
          const existingApplications = await getDocs(existingApplicationQuery);

          if (existingApplications.empty) {
            // Only add if it doesn't exist
            await addDoc(collection(db, 'applications'), {
              UserID: currentUser.uid,
              GrantID: grants[currentIndex].id,
            });
            console.log('Grant saved to applications:', grants[currentIndex].name);
          } else {
            console.log('Grant already in applications:', grants[currentIndex].name);
          }
        } catch (error) {
          console.error('Error saving application:', error);
        }
      }

      // Move to next card
      position.setValue({ x: 0, y: 0 });
      setSwipeColor('none');
      setFlipped(false);
      flipAnim.setValue(0);
      setCurrentIndex(prev => prev + 1);
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      useNativeDriver: false,
    }).start(() => setSwipeColor('none'));
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });

        if (gesture.dx > 30) setSwipeColor('right');
        else if (gesture.dx < -30) setSwipeColor('left');
        else setSwipeColor('none');
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) swipeOut('right');
        else if (gesture.dx < -SWIPE_THRESHOLD) swipeOut('left');
        else resetPosition();
      },
    })
  ).current;

  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 180,
      duration: 400,
      useNativeDriver: false,
    }).start();
    setFlipped(!flipped);
  };

  const cardColor =
    swipeColor === 'right'
      ? '#1e3a2e' // subtle dark green
      : swipeColor === 'left'
      ? '#3a1e1e' // subtle dark red
      : '#1a1a1a'; // dark background

  const currentGrant = grants[currentIndex];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading grants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentGrant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.noMoreText}>🎉</Text>
          <Text style={styles.loadingText}>No more grants to review!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.animatedCard,
            {
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              transform: [
                { translateX: position.x },
                { rotate },
              ],
            },
          ]}
        >
          <Pressable onPress={flipCard} style={{ position: 'relative', outline: 'none' } as any}>
            {/* FRONT */}
            <Animated.View
              style={[
                styles.card,
                {
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  backgroundColor: cardColor,
                  transform: [{ rotateY: frontInterpolate }],
                },
              ]}
            >
              <Text style={styles.universityText}>{currentGrant.name}</Text>
              <Text style={styles.questionText}>
                {currentGrant.Requirements.length > 0 ? currentGrant.Requirements[0] : 'No requirements listed'}
              </Text>
              <View style={styles.bottomInfo}>
                <Text style={styles.valueText}>{currentGrant.Value}</Text>
              </View>
              <Text style={styles.tapHint}>Tap to flip</Text>
            </Animated.View>

            {/* BACK */}
            <Animated.View
              style={[
                styles.card,
                styles.backCard,
                {
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  transform: [{ rotateY: backInterpolate }],
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
              ]}
            >
              <Text style={styles.backTitle}>Grant Details</Text>
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Value:</Text>
                  <Text style={styles.detailValue}>{currentGrant.Value}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Organization:</Text>
                  <Text style={styles.detailValue}>{currentGrant.name}</Text>
                </View>
                {currentGrant.URL && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>URL:</Text>
                    <Text style={[styles.detailValue, styles.urlText]} numberOfLines={1}>
                      {currentGrant.URL}
                    </Text>
                  </View>
                )}
                <Text style={styles.requirementsTitle}>Requirements:</Text>
                <View style={styles.requirementsList}>
                  {currentGrant.Requirements.map((requirement, index) => (
                    <View key={index} style={styles.requirementItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.requirementsText}>{requirement}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* Swipe Indicators */}
        <View style={styles.indicatorsContainer}>
          <View style={[styles.indicator, styles.leftIndicator, swipeColor === 'left' && styles.activeLeft]}>
            <Text style={styles.indicatorText}>✗</Text>
          </View>
          <View style={[styles.indicator, styles.rightIndicator, swipeColor === 'right' && styles.activeRight]}>
            <Text style={styles.indicatorText}>✓</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#9ca3af',
    marginTop: 16,
  },
  noMoreText: {
    fontSize: 64,
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  animatedCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 24,
    backfaceVisibility: 'hidden',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
    userSelect: 'none',
  } as any,
  backCard: {
    backgroundColor: '#6366f1',
  },
  universityText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    userSelect: 'none',
    flexShrink: 0,
  } as any,
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 32,
    flex: 1,
    flexWrap: 'wrap',
    userSelect: 'none',
  } as any,
  bottomInfo: {
    marginTop: 20,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    textAlign: 'center',
    userSelect: 'none',
  } as any,
  deadlineText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    userSelect: 'none',
  } as any,
  tapHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
    userSelect: 'none',
  } as any,
  backTitle: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    userSelect: 'none',
  } as any,
  detailsContainer: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 16,
    color: '#e0e7ff',
    fontWeight: '500',
    userSelect: 'none',
  } as any,
  detailValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    userSelect: 'none',
    flex: 1,
    flexWrap: 'wrap',
    textAlign: 'right',
  } as any,
  urlText: {
    fontSize: 14,
    color: '#a5b4fc',
    fontStyle: 'italic',
  },
  requirementsTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    userSelect: 'none',
  } as any,
  requirementsList: {
    marginTop: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 18,
    color: '#e0e7ff',
    marginRight: 12,
    marginTop: 2,
    userSelect: 'none',
  } as any,
  requirementsText: {
    fontSize: 15,
    color: '#e0e7ff',
    lineHeight: 22,
    userSelect: 'none',
    flexWrap: 'wrap',
    flex: 1,
  } as any,
  indicatorsContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    pointerEvents: 'none',
  },
  indicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    opacity: 0.3,
  },
  leftIndicator: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  rightIndicator: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  activeLeft: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  activeRight: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  indicatorText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    userSelect: 'none',
  } as any,
});
