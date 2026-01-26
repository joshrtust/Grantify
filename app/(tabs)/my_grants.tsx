import { Grant } from '@/components/SwipeableGrantCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth, db } from '@/FirebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyGrants() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const fetchUserGrants = useCallback(async () => {
    if (!user) {
      console.log('No user logged in');
      setLoading(false);
      return;
    }

    try {
      console.log('Current user UID:', user.uid);
      
      // Step 1: Query applications collection for this user
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('UserID', '==', user.uid)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      
      console.log('Applications found:', applicationsSnapshot.docs.length);

      // Step 2: Create a map of GrantID to AppliedAt timestamp
      const grantIdToTimestamp = new Map<string, string>();
      applicationsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.GrantID) {
          grantIdToTimestamp.set(data.GrantID, data.AppliedAt || '');
        }
      });

      const grantIds = Array.from(grantIdToTimestamp.keys());
      console.log('Grant IDs to fetch:', grantIds);

      // Step 3: Fetch each grant from the grants collection
      const fetchedGrants: Array<Grant & { appliedAt: string }> = [];
      for (const grantId of grantIds) {
        const grantDocRef = doc(db, 'grants', grantId);
        const grantDoc = await getDoc(grantDocRef);
        
        if (grantDoc.exists()) {
          const grantData = grantDoc.data();
          console.log('Grant found:', grantDoc.id, grantData);
          
          // Handle both capitalized and lowercase field names
          const grantName = grantData.name || grantData.Name || 'Unknown Grant';
          const requirements = grantData.Requirements || grantData.requirements;
          const value = grantData.Value || grantData.value || 'N/A';
          const grantUrl = grantData.URL || grantData.url || '';
          
          fetchedGrants.push({
            id: grantDoc.id,
            university: grantName,
            question: Array.isArray(requirements) ? requirements.join(', ') : (requirements || 'No requirements listed'),
            priceRange: value,
            validUntil: 'N/A', // Not in your DB structure
            url: grantUrl,
            appliedAt: grantIdToTimestamp.get(grantId) || '',
          });
        } else {
          console.log('Grant not found:', grantId);
        }
      }

      // Sort by AppliedAt timestamp in descending order (most recent first)
      fetchedGrants.sort((a, b) => {
        return b.appliedAt.localeCompare(a.appliedAt);
      });

      console.log('Total grants fetched:', fetchedGrants.length);
      setGrants(fetchedGrants);
    } catch (error) {
      console.error('Error fetching user grants:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserGrants();
  }, [fetchUserGrants]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUserGrants();
    }, [fetchUserGrants])
  );

  const handleViewDetails = async (url: string | undefined) => {
    if (!url) {
      Alert.alert('No URL', 'This grant does not have a URL available.');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Invalid URL', 'Unable to open this URL.');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open the URL.');
    }
  };

  const handleMarkAsDone = async (grantId: string) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    try {
      // Find the application document for this user and grant
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('UserID', '==', user.uid),
        where('GrantID', '==', grantId)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);

      if (!applicationsSnapshot.empty) {
        // Delete the first matching document
        const docToDelete = applicationsSnapshot.docs[0];
        await deleteDoc(doc(db, 'applications', docToDelete.id));
        
        // Remove from local state
        setGrants(prevGrants => prevGrants.filter(grant => grant.id !== grantId));
        
        Alert.alert('Success', 'Grant marked as done and removed from your list!');
      }
    } catch (error) {
      console.error('Error removing grant:', error);
      Alert.alert('Error', 'Failed to remove grant. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading your grants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (grants.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <IconSymbol name="doc.text" size={64} color="#6366f1" />
          <Text style={styles.emptyTitle}>No Grants Yet</Text>
          <Text style={styles.emptyText}>Start swiping to save grants you&apos;re interested in!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Grants List */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
          {grants.map((grant) => (
            <TouchableOpacity key={grant.id} style={styles.grantCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.universityName}>{grant.university}</Text>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{grant.priceRange}</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.requirementsSection}>
                <View style={styles.requirementsTitleRow}>
                  <IconSymbol name="checkmark.circle.fill" size={18} color="#6366f1" />
                  <Text style={styles.requirementsTitle}>Requirements:</Text>
                </View>
                <View style={styles.requirementsList}>
                  {grant.question.split(',').map((req: string, index: number) => (
                    <View key={index} style={styles.requirementItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.requirementText}>{req.trim()}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <IconSymbol name="calendar" size={18} color="#6366f1" />
                <Text style={styles.infoLabel}>Deadline:</Text>
                <Text style={styles.infoValue}>{grant.validUntil}</Text>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.checkButton}
                  onPress={() => {}}
                >
                  <IconSymbol name="checkmark.circle.fill" size={18} color="#ffffff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => handleViewDetails(grant.url)}
                >
                  <Text style={styles.applyButtonText}>View Details</Text>
                  <IconSymbol name="chevron.right" size={16} color="#ffffff" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.appliedButton}
                  onPress={() => handleMarkAsDone(grant.id)}
                >
                  <IconSymbol name="trash" size={18} color="#e5e7eb" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  grantCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  universityName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 12,
  },
  priceTag: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 12,
  },
  requirementsSection: {
    marginBottom: 12,
  },
  requirementsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
    fontWeight: '500',
  },
  requirementsList: {
    marginLeft: 26,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bulletPoint: {
    color: '#6366f1',
    fontSize: 14,
    marginRight: 8,
    fontWeight: 'bold',
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
    marginRight: 6,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  checkButton: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  appliedButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  appliedButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
