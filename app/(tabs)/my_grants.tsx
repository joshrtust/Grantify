import { Grant } from '@/components/SwipeableGrantCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth, db } from '@/FirebaseConfig';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MyGrants() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserGrants = async () => {
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

        // Step 2: Get all GrantIDs from the applications
        const grantIds = applicationsSnapshot.docs.map(doc => doc.data().GrantID).filter(id => id);

        console.log('Grant IDs to fetch:', grantIds);

        // Step 3: Fetch each grant from the grants collection
        const fetchedGrants: Grant[] = [];
        for (const grantId of grantIds) {
          const grantDocRef = doc(db, 'grants', grantId);
          const grantDoc = await getDoc(grantDocRef);
          
          if (grantDoc.exists()) {
            const grantData = grantDoc.data();
            console.log('Grant found:', grantDoc.id, grantData);
            fetchedGrants.push({
              id: grantDoc.id,
              university: grantData.name || 'Unknown Grant',
              question: grantData.Requirements || 'No requirements listed',
              priceRange: grantData.Value || 'N/A',
              validUntil: 'N/A', // Not in your DB structure
            });
          } else {
            console.log('Grant not found:', grantId);
          }
        }

        console.log('Total grants fetched:', fetchedGrants.length);
        setGrants(fetchedGrants);
      } catch (error) {
        console.error('Error fetching user grants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGrants();
  }, [user]);

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
          <Text style={styles.emptyText}>Start swiping to save grants you're interested in!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
              
              <View style={styles.infoRow}>
                <IconSymbol name="checkmark.circle.fill" size={18} color="#6366f1" />
                <Text style={styles.infoLabel}>Requirement:</Text>
                <Text style={styles.infoValue}>{grant.question}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <IconSymbol name="calendar" size={18} color="#6366f1" />
                <Text style={styles.infoLabel}>Deadline:</Text>
                <Text style={styles.infoValue}>{grant.validUntil}</Text>
              </View>
              
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>View Details</Text>
                <IconSymbol name="chevron.right" size={16} color="#ffffff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  applyButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
