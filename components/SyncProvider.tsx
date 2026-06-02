'use client';

import { useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { useStore } from '@/store/useStore';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isHydrated = useStore((state) => state._hasHydrated);
  const isUpdatingFromRemote = useRef(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!user || !isHydrated) return;

    const docRef = doc(db, 'users', user.uid);

    // 1. Initial Load & Remote Listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        
        isUpdatingFromRemote.current = true;
        
        useStore.getState().replaceStoreData(remoteData);
        
        isInitialized.current = true;
        setTimeout(() => {
          isUpdatingFromRemote.current = false;
        }, 100);
      } else {
        // New user, push local data to create their document
        isInitialized.current = true;
        pushLocalToRemote();
      }
    });

    return () => unsubscribe();
  }, [user, isHydrated]);

  const pushLocalToRemote = () => {
    if (!user || !isHydrated) return;
    const docRef = doc(db, 'users', user.uid);
    const state = useStore.getState();
    
    // Strip functions before saving to Firestore
    const dataToSave: any = { ...state };
    Object.keys(dataToSave).forEach((key) => {
      if (typeof dataToSave[key] === 'function') {
        delete dataToSave[key];
      }
    });
    
    setDoc(docRef, dataToSave, { merge: true });
  };

  useEffect(() => {
    // 2. Local Changes Listener
    const unsub = useStore.subscribe(() => {
      if (!isUpdatingFromRemote.current && isInitialized.current && user) {
        pushLocalToRemote();
      }
    });
    return () => unsub();
  }, [user, isHydrated]);

  return <>{children}</>;
}
