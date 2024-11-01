import { create } from 'zustand';
import { databases, COLLECTIONS, DATABASE_ID } from '../appwrite';
import { ID, Query } from 'appwrite';
import { toast } from 'sonner';
import type { CalendarEvent } from '../types';

interface EventState {
  events: CalendarEvent[];
  isLoading: boolean;
  createEvent: (eventData: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchUserEvents: (userId: string) => Promise<void>;
  addParticipant: (eventId: string, userId: string) => Promise<void>;
  removeParticipant: (eventId: string, userId: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  isLoading: false,

  createEvent: async (eventData) => {
    try {
      set({ isLoading: true });

      const event = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.EVENTS,
        ID.unique(),
        {
          ...eventData,
          createdAt: new Date().toISOString(),
        }
      );

      set(state => ({
        events: [event, ...state.events],
      }));

      toast.success('Event created successfully!');
    } catch (error: any) {
      toast.error('Failed to create event: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      set({ isLoading: true });

      const updatedEvent = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.EVENTS,
        id,
        {
          ...eventData,
          updatedAt: new Date().toISOString(),
        }
      );

      set(state => ({
        events: state.events.map(e => e.id === id ? updatedEvent : e),
      }));

      toast.success('Event updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update event: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteEvent: async (id) => {
    try {
      set({ isLoading: true });

      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.EVENTS, id);

      set(state => ({
        events: state.events.filter(e => e.id !== id),
      }));

      toast.success('Event deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete event: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEvents: async () => {
    try {
      set({ isLoading: true });
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.EVENTS,
        [
          Query.orderDesc('date'),
        ]
      );

      set({ events: response.documents as CalendarEvent[] });
    } catch (error: any) {
      toast.error('Failed to fetch events: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserEvents: async (userId) => {
    try {
      set({ isLoading: true });
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.EVENTS,
        [
          Query.search('participants', userId),
          Query.orderDesc('date'),
        ]
      );

      set({ events: response.documents as CalendarEvent[] });
    } catch (error: any) {
      toast.error('Failed to fetch user events: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addParticipant: async (eventId, userId) => {
    try {
      set({ isLoading: true });

      const event = get().events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      const updatedEvent = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.EVENTS,
        eventId,
        {
          participants: [...event.participants.map(p => p.id), userId],
        }
      );

      set(state => ({
        events: state.events.map(e => e.id === eventId ? updatedEvent : e),
      }));

      toast.success('Participant added successfully!');
    } catch (error: any) {
      toast.error('Failed to add participant: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeParticipant: async (eventId, userId) => {
    try {
      set({ isLoading: true });

      const event = get().events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      const updatedEvent = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.EVENTS,
        eventId,
        {
          participants: event.participants.filter(p => p.id !== userId).map(p => p.id),
        }
      );

      set(state => ({
        events: state.events.map(e => e.id === eventId ? updatedEvent : e),
      }));

      toast.success('Participant removed successfully!');
    } catch (error: any) {
      toast.error('Failed to remove participant: ' + error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));