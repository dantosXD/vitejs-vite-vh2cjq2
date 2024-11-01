import { create } from 'zustand';
import { databases, storage, COLLECTIONS, DATABASE_ID, BUCKETS } from '../appwrite';
import { ID, Query } from 'appwrite';
import { toast } from 'sonner';
import type { Catch } from '../types';

interface CatchState {
  catches: Catch[];
  isLoading: boolean;
  createCatch: (catchData: Omit<Catch, 'id'>, photos: File[]) => Promise<void>;
  updateCatch: (id: string, catchData: Partial<Catch>, newPhotos?: File[]) => Promise<void>;
  deleteCatch: (id: string) => Promise<void>;
  fetchCatches: () => Promise<void>;
  fetchUserCatches: (userId: string) => Promise<void>;
  fetchGroupCatches: (groupId: string) => Promise<void>;
}

export const useCatchStore = create<CatchState>((set, get) => ({
  catches: [],
  isLoading: false,

  createCatch: async (catchData, photos) => {
    try {
      set({ isLoading: true });

      // Upload photos first
      const photoIds = await Promise.all(
        photos.map(photo => storage.createFile(BUCKETS.CATCH_PHOTOS, ID.unique(), photo))
      );

      // Create catch document with photo references
      const catch_ = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CATCHES,
        ID.unique(),
        {
          ...catchData,
          photos: photoIds.map(photo => photo.$id),
          createdAt: new Date().toISOString(),
        }
      );

      set(state => ({
        catches: [catch_, ...state.catches],
      }));

      toast.success('Catch recorded successfully!');
    } catch (error: any) {
      toast.error('Failed to record catch: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCatch: async (id, catchData, newPhotos) => {
    try {
      set({ isLoading: true });

      let updatedPhotoIds = catchData.photos || [];

      // Upload new photos if provided
      if (newPhotos?.length) {
        const newPhotoIds = await Promise.all(
          newPhotos.map(photo => storage.createFile(BUCKETS.CATCH_PHOTOS, ID.unique(), photo))
        );
        updatedPhotoIds = [...updatedPhotoIds, ...newPhotoIds.map(photo => photo.$id)];
      }

      // Update catch document
      const updatedCatch = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CATCHES,
        id,
        {
          ...catchData,
          photos: updatedPhotoIds,
          updatedAt: new Date().toISOString(),
        }
      );

      set(state => ({
        catches: state.catches.map(c => c.id === id ? updatedCatch : c),
      }));

      toast.success('Catch updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update catch: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCatch: async (id) => {
    try {
      set({ isLoading: true });

      // Get catch to find associated photos
      const catch_ = get().catches.find(c => c.id === id);
      
      // Delete catch document
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.CATCHES, id);

      // Delete associated photos
      if (catch_?.photos) {
        await Promise.all(
          catch_.photos.map(photoId => 
            storage.deleteFile(BUCKETS.CATCH_PHOTOS, photoId)
          )
        );
      }

      set(state => ({
        catches: state.catches.filter(c => c.id !== id),
      }));

      toast.success('Catch deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete catch: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCatches: async () => {
    try {
      set({ isLoading: true });
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CATCHES,
        [
          Query.orderDesc('$createdAt'),
        ]
      );

      set({ catches: response.documents as Catch[] });
    } catch (error: any) {
      toast.error('Failed to fetch catches: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserCatches: async (userId) => {
    try {
      set({ isLoading: true });
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CATCHES,
        [
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
        ]
      );

      set({ catches: response.documents as Catch[] });
    } catch (error: any) {
      toast.error('Failed to fetch user catches: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGroupCatches: async (groupId) => {
    try {
      set({ isLoading: true });
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CATCHES,
        [
          Query.search('sharedWithGroups', groupId),
          Query.orderDesc('$createdAt'),
        ]
      );

      set({ catches: response.documents as Catch[] });
    } catch (error: any) {
      toast.error('Failed to fetch group catches: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));