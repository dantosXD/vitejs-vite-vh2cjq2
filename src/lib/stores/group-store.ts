import { create } from 'zustand';
import { databases, storage, COLLECTIONS, DATABASE_ID, BUCKETS } from '../appwrite';
import { ID, Query } from 'appwrite';
import { toast } from 'sonner';
import type { Group } from '../types';

interface GroupState {
  groups: Group[];
  isLoading: boolean;
  createGroup: (groupData: Omit<Group, 'id' | 'createdAt'>, avatar?: File) => Promise<void>;
  updateGroup: (id: string, groupData: Partial<Group>, newAvatar?: File) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchUserGroups: (userId: string) => Promise<void>;
  addMember: (groupId: string, userId: string) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  isLoading: false,

  createGroup: async (groupData, avatar) => {
    try {
      set({ isLoading: true });

      let avatarId = null;
      if (avatar) {
        const uploadedAvatar = await storage.createFile(
          BUCKETS.GROUP_AVATARS,
          ID.unique(),
          avatar
        );
        avatarId = uploadedAvatar.$id;
      }

      const group = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        ID.unique(),
        {
          ...groupData,
          avatar: avatarId,
          createdAt: new Date().toISOString(),
        }
      );

      set(state => ({
        groups: [group, ...state.groups],
      }));

      toast.success('Group created successfully!');
    } catch (error: any) {
      toast.error('Failed to create group: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateGroup: async (id, groupData, newAvatar) => {
    try {
      set({ isLoading: true });

      let avatarId = groupData.avatar;
      if (newAvatar) {
        // Delete old avatar if exists
        if (avatarId) {
          await storage.deleteFile(BUCKETS.GROUP_AVATARS, avatarId);
        }
        // Upload new avatar
        const uploadedAvatar = await storage.createFile(
          BUCKETS.GROUP_AVATARS,
          ID.unique(),
          newAvatar
        );
        avatarId = uploadedAvatar.$id;
      }

      const updatedGroup = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        id,
        {
          ...groupData,
          avatar: avatarId,
          updatedAt: new Date().toISOString(),
        }
      );

      set(state => ({
        groups: state.groups.map(g => g.id === id ? updatedGroup : g),
      }));

      toast.success('Group updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update group: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteGroup: async (id) => {
    try {
      set({ isLoading: true });

      const group = get().groups.find(g => g.id === id);
      
      // Delete group document
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.GROUPS, id);

      // Delete group avatar if exists
      if (group?.avatar) {
        await storage.deleteFile(BUCKETS.GROUP_AVATARS, group.avatar);
      }

      set(state => ({
        groups: state.groups.filter(g => g.id !== id),
      }));

      toast.success('Group deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete group: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGroups: async () => {
    try {
      set({ isLoading: true });
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        [
          Query.orderDesc('$createdAt'),
        ]
      );

      set({ groups: response.documents as Group[] });
    } catch (error: any) {
      toast.error('Failed to fetch groups: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserGroups: async (userId) => {
    try {
      set({ isLoading: true });
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        [
          Query.search('members', userId),
          Query.orderDesc('$createdAt'),
        ]
      );

      set({ groups: response.documents as Group[] });
    } catch (error: any) {
      toast.error('Failed to fetch user groups: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addMember: async (groupId, userId) => {
    try {
      set({ isLoading: true });

      const group = get().groups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');

      const updatedGroup = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        groupId,
        {
          members: [...group.members.map(m => m.id), userId],
        }
      );

      set(state => ({
        groups: state.groups.map(g => g.id === groupId ? updatedGroup : g),
      }));

      toast.success('Member added successfully!');
    } catch (error: any) {
      toast.error('Failed to add member: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeMember: async (groupId, userId) => {
    try {
      set({ isLoading: true });

      const group = get().groups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');

      const updatedGroup = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        groupId,
        {
          members: group.members.filter(m => m.id !== userId).map(m => m.id),
          admins: group.admins.filter(id => id !== userId),
        }
      );

      set(state => ({
        groups: state.groups.map(g => g.id === groupId ? updatedGroup : g),
      }));

      toast.success('Member removed successfully!');
    } catch (error: any) {
      toast.error('Failed to remove member: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));