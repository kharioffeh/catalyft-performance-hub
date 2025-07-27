import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { datastoreService, PendingSet } from '@/services/datastoreService';

export const useSyncPendingSets = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Median Datastore
    initializeDatastore();

    // Monitor network status
    const setupNetworkListener = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);

      Network.addListener('networkStatusChange', (status) => {
        const wasOffline = !isOnline;
        setIsOnline(status.connected);

        // Trigger sync when coming back online
        if (wasOffline && status.connected) {
          syncPendingSets();
        }
      });
    };

    setupNetworkListener();

    return () => {
      Network.removeAllListeners();
    };
  }, []);

  const initializeDatastore = async () => {
    try {
      await datastoreService.initializeDB();
      await updatePendingCount();
    } catch (error) {
      console.error('Failed to initialize Median Datastore:', error);
    }
  };

  const updatePendingCount = async () => {
    try {
      const pendingSets = await datastoreService.getPendingSets();
      setPendingCount(pendingSets.length);
    } catch (error) {
      console.error('Failed to get pending count:', error);
    }
  };

  const addPendingSet = async (set: Omit<PendingSet, 'id' | 'created_at'>) => {
    const pendingSet: PendingSet = {
      ...set,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };

    try {
      await datastoreService.addPendingSet(pendingSet);
      await updatePendingCount();
      
      if (isOnline) {
        // Try to sync immediately if online
        await syncPendingSets();
      }
    } catch (error) {
      console.error('Failed to add pending set:', error);
      throw error;
    }
  };

  const syncPendingSets = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const pendingSets = await datastoreService.getPendingSets();
      
      if (pendingSets.length === 0) {
        setIsSyncing(false);
        return;
      }

      let successCount = 0;
      let failedCount = 0;

      for (const set of pendingSets) {
        try {
          const { error } = await supabase.functions.invoke('logSet', {
            body: {
              session_id: set.session_id,
              exercise: set.exercise,
              weight: set.weight,
              reps: set.reps,
              rpe: set.rpe,
              tempo: set.tempo,
              velocity: set.velocity
            }
          });

          if (error) throw error;

          // Remove from local storage on successful sync
          await datastoreService.removePendingSet(set.id);
          successCount++;
        } catch (error) {
          console.error('Failed to sync set:', set.id, error);
          failedCount++;
        }
      }

      await updatePendingCount();

      if (successCount > 0) {
        toast({
          title: "Sync Complete",
          description: `${successCount} set(s) synced successfully`,
        });
      }

      if (failedCount > 0) {
        toast({
          title: "Sync Issues",
          description: `${failedCount} set(s) failed to sync`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync pending sets",
        variant: "destructive"
      });
    }
    setIsSyncing(false);
  };

  return {
    isOnline,
    isSyncing,
    pendingCount,
    addPendingSet,
    syncPendingSets,
    updatePendingCount
  };
};