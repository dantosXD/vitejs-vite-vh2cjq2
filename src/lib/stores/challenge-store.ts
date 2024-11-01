import { create } from 'zustand';
import { databases, COLLECTIONS, DATABASE_ID } from '../appwrite';
import { ID, Query } from 'appwrite';
import { toast } from 'sonner';
import type { Challenge } from '../types';

interface ChallengeState {
  challenges: Challenge[];
  isLoading: boolean;
  createChallenge: (challengeData: Omit<Challenge, 'id'>) => Promise<void>;
  updateChallenge: (id: string, challengeData: Partial<Challenge>) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;
  fetchChallenges: () => Promise<void>;
  fetchGroupChallenges: (groupId: string) => Promise<void>;
  joinChallenge: (challengeId: string, userId: string) => Promise<void>;
  leaveChallenge: (challengeId: string, userId: string) => Promise<void>;
  updateProgress: (challengeId: string, userId: string, progress: number) => Promise<void>;
  completeChallenge: (challengeId: string, winnerId: string) => Promise<void>;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  isLoading: false,

  createChallenge: async (challengeData) => {
    try {
      set({ isLoading: true });

      const challenge = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CHALLENGES,
        ID.unique(),
        {
          ...challengeData,
          completed: false,
          createdAt: new Date().toISOString(),
        }
      );

      set(state => ({
        challenges: [challenge, ...state.challenges],
      }));

      toast.success('Challenge created successfully!');
    } catch (error: any) {
      toast.error('Failed to create challenge: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateChallenge: async (id, challengeData) => {
    try {
      set({ isLoading: true });

      const updatedChallenge = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CHALLENGES,
        id,
        {
          ...challengeData,
          updatedAt: new Date().toISOString(),
        }
      );

      set(state => ({
        challenges: state.challenges.map(c => c.id === id ? updatedChallenge : c),
      }));

      toast.success('Challenge updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update challenge: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteChallenge: async (id) => {
    try {
      set({ isLoading: true });

      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.CHALLENGES, id);

      set(state => ({
        challenges: state.challenges.filter(c => c.id !== id),
      }));

      toast.success('Challenge deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete challenge: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchChallenges: async () => {
    try {
      set({ isLoading: true });
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHALLENGES,
        [
          Query.orderDesc('$createdAt'),
        ]
      );

      set({ challenges: response.documents as Challenge[] });
    } catch (error: any) {
      toast.error('Failed to fetch challenges: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGroupChallenges: async (groupId) => {
    try {
      set({ isLoading: true });
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHALLENGES,
        [
          Query.equal('groupId', groupId),
          Query.orderDesc('$createdAt'),
        ]
      );

      set({ challenges: response.documents as Challenge[] });
    } catch (error: any) {
      toast.error('Failed to fetch group challenges: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  joinChallenge: async (challengeId, userId) => {
    try {
      set({ isLoading: true });

      const challenge = get().challenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');

      const updatedChallenge = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CHALLENGES,
        challengeId,
        {
          participants: [
            ...challenge.participants,
            { userId, progress: 0 }
          ],
        }
      );

      set(state => ({
        challenges: state.challenges.map(c => c.id === challengeId ? updatedChallenge : c),
      }));

      toast.success('Joined challenge successfully!');
    } catch (error: any) {
      toast.error('Failed to join challenge: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  leaveChallenge: async (challengeId, userId) => {
    try {
      set({ isLoading: true });

      const challenge = get().challenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');

      const updatedChallenge = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CHALLENGES,
        challengeId,
        {
          participants: challenge.participants.filter(p => p.userId !== userId),
        }
      );

      set(state => ({
        challenges: state.challenges.map(c => c.id === challengeId ? updatedChallenge : c),
      }));

      toast.success('Left challenge successfully!');
    } catch (error: any) {
      toast.error('Failed to leave challenge: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProgress: async (challengeId, userId, progress) => {
    try {
      set({ isLoading: true });

      const challenge = get().challenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');

      const updatedParticipants = challenge.participants.map(p =>
        p.userId === userId ? { ...p, progress } : p
      );

      const updatedChallenge = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CHALLENGES,
        challengeId,
        {
          participants: updatedParticipants,
        }
      );

      set(state => ({
        challenges: state.challenges.map(c => c.id === challengeId ? updatedChallenge : c),
      }));

      toast.success('Progress updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update progress: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  completeChallenge: async (challengeId, winnerId) => {
    try {
      set({ isLoading: true });

      const updatedChallenge = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CHALLENGES,
        challengeId,
        {
          completed: true,
          winner: winnerId,
          completedAt: new Date().toISOString(),
        }
      );

      set(state => ({
        challenges: state.challenges.map(c => c.id === challengeId ? updatedChallenge : c),
      }));

      toast.success('Challenge completed successfully!');
    } catch (error: any) {
      toast.error('Failed to complete challenge: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));