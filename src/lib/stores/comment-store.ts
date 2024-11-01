import { create } from 'zustand';
import { databases, COLLECTIONS, DATABASE_ID } from '../appwrite';
import { ID, Query } from 'appwrite';
import { toast } from 'sonner';
import type { Comment } from '../types';

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  createComment: (catchId: string, content: string, userId: string) => Promise<void>;
  updateComment: (id: string, content: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  fetchComments: (catchId: string) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  isLoading: false,

  createComment: async (catchId, content, userId) => {
    try {
      set({ isLoading: true });

      const comment = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.COMMENTS,
        ID.unique(),
        {
          catchId,
          content,
          userId,
          createdAt: new Date().toISOString(),
        }
      );

      set(state => ({
        comments: [...state.comments, comment],
      }));

      toast.success('Comment added successfully!');
    } catch (error: any) {
      toast.error('Failed to add comment: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateComment: async (id, content) => {
    try {
      set({ isLoading: true });

      const updatedComment = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.COMMENTS,
        id,
        {
          content,
          updatedAt: new Date().toISOString(),
        }
      );

      set(state => ({
        comments: state.comments.map(c => c.id === id ? updatedComment : c),
      }));

      toast.success('Comment updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update comment: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteComment: async (id) => {
    try {
      set({ isLoading: true });

      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.COMMENTS, id);

      set(state => ({
        comments: state.comments.filter(c => c.id !== id),
      }));

      toast.success('Comment deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete comment: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchComments: async (catchId) => {
    try {
      set({ isLoading: true });
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.COMMENTS,
        [
          Query.equal('catchId', catchId),
          Query.orderDesc('$createdAt'),
        ]
      );

      set({ comments: response.documents as Comment[] });
    } catch (error: any) {
      toast.error('Failed to fetch comments: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));