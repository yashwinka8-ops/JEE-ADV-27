'use client';

import { useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStore } from '@/store/useStore';

// Keys of the Zustand store that we want to sync to Firebase
const SYNC_KEYS = [
  'chapters',
  'sessions',
  'weeklyGoals',
  'mockTests',
  'mockTargets',
  'mistakes',
  'doubts',
  'notes',
  'pyqProgress',
  'revisions',
  'tasks',
  'dailyGoalMinutes',
  'chatThreads',
  'lifeHabits',
  'journalEntries',
  'healthLogs',
  'lifeGoals',
  'rpgLevel',
  'rpgXp',
  'rpgAchievements',
  'rpgQuests',
  'brainNotes',
  'relationships',
  'moneyEntries',
  'savingsGoals',
  'wishlistItems',
  'dreamCards',
  'futureLetters',
  'lifeAnalytics',
  'selfAnalysis',
  'customMemories'
];

export default function FirebaseSync() {
  const { firebaseUser, replaceStoreData, _hasHydrated, setHasHydrated } = useStore();
  const lastUpdateRef = useRef<number>(0);
  const isHydratingRef = useRef<boolean>(false);

  // 1. Listen for remote changes from Firebase
  useEffect(() => {
    if (!firebaseUser?.uid) {
      setHasHydrated(false);
      return;
    }

    const uid = firebaseUser.uid;
    const userDocRef = doc(db, 'users', uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Prevent echo: if we just uploaded data, ignore the resulting snapshot
        if (Date.now() - lastUpdateRef.current < 2000) {
          return;
        }

        // Hydrate local store with remote data
        isHydratingRef.current = true;
        replaceStoreData(data);
        
        // Allow local changes to sync again after hydration is complete
        setTimeout(() => {
          isHydratingRef.current = false;
        }, 500);
      }
      if (!_hasHydrated) {
        setHasHydrated(true);
      }
    });

    return () => unsubscribe();
  }, [firebaseUser?.uid, replaceStoreData, setHasHydrated, _hasHydrated]);

  // 2. Subscribe to local store changes and upload to Firebase
  useEffect(() => {
    if (!firebaseUser?.uid || !_hasHydrated) return;

    // We use a timeout to debounce rapid state changes (e.g. typing)
    let syncTimeout: NodeJS.Timeout;

    const unsubscribe = useStore.subscribe((state, prevState) => {
      // Don't upload if the change came from Firebase itself
      if (isHydratingRef.current) return;

      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(async () => {
        try {
          const uid = firebaseUser.uid;
          const dataToSync: Record<string, any> = {};
          
          for (const key of SYNC_KEYS) {
            dataToSync[key] = (state as any)[key];
          }

          lastUpdateRef.current = Date.now();
          await setDoc(doc(db, 'users', uid), dataToSync, { merge: true });
          console.log('Synced state to Firebase');
        } catch (e) {
          console.error('Error syncing to Firebase', e);
        }
      }, 3000); // Debounce for 3 seconds
    });

    return () => {
      unsubscribe();
      clearTimeout(syncTimeout);
    };
  }, [firebaseUser?.uid, _hasHydrated]);

  return null; // This is a silent logic component
}
