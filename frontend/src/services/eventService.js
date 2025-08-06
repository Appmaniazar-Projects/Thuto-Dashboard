import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  getDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

const EVENTS_COLLECTION = 'events';

/**
 * Create a new event
 * @param {Object} eventData - Event data to be saved
 * @param {string} userId - ID of the user creating the event
 * @returns {Promise<Object>} - The created event with ID
 */
export const createEvent = async (eventData, userId) => {
  try {
    const eventRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...eventData,
      createdBy: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return { id: eventRef.id, ...eventData };
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('Failed to create event');
  }
};

/**
 * Update an existing event
 * @param {string} eventId - ID of the event to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateEvent = async (eventId, updates) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event');
  }
};

/**
 * Delete an event
 * @param {string} eventId - ID of the event to delete
 * @returns {Promise<void>}
 */
export const deleteEvent = async (eventId) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event');
  }
};

/**
 * Get a single event by ID
 * @param {string} eventId - ID of the event to fetch
 * @returns {Promise<Object|null>} - The event data or null if not found
 */
export const getEventById = async (eventId) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (eventSnap.exists()) {
      return { id: eventSnap.id, ...eventSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting event:', error);
    throw new Error('Failed to get event');
  }
};

/**
 * Get events for a specific user
 * @param {string} userId - ID of the user
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date for filtering events
 * @param {Date} options.endDate - End date for filtering events
 * @returns {Promise<Array>} - Array of events
 */
export const getUserEvents = async (userId, { startDate, endDate } = {}) => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    let q = query(
      eventsRef,
      where('attendees', 'array-contains', userId),
      orderBy('startDate')
    );

    // Add date range filter if provided
    if (startDate && endDate) {
      q = query(
        q,
        where('startDate', '>=', Timestamp.fromDate(new Date(startDate))),
        where('startDate', '<=', Timestamp.fromDate(new Date(endDate)))
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user events:', error);
    throw new Error('Failed to fetch events');
  }
};

/**
 * Get all events (admin only)
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date for filtering events
 * @param {Date} options.endDate - End date for filtering events
 * @returns {Promise<Array>} - Array of all events
 */
export const getAllEvents = async ({ startDate, endDate } = {}) => {
  try {
    const eventsRef = collection(db, EVENTS_COLLECTION);
    let q = query(eventsRef, orderBy('startDate'));

    // Add date range filter if provided
    if (startDate && endDate) {
      q = query(
        q,
        where('startDate', '>=', Timestamp.fromDate(new Date(startDate))),
        where('startDate', '<=', Timestamp.fromDate(new Date(endDate)))
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all events:', error);
    throw new Error('Failed to fetch events');
  }
};

/**
 * Add attendees to an event
 * @param {string} eventId - ID of the event
 * @param {Array<string>} userIds - Array of user IDs to add
 * @returns {Promise<void>}
 */
export const addEventAttendees = async (eventId, userIds) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      attendees: arrayUnion(...userIds),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding attendees:', error);
    throw new Error('Failed to add attendees');
  }
};

/**
 * Remove attendees from an event
 * @param {string} eventId - ID of the event
 * @param {Array<string>} userIds - Array of user IDs to remove
 * @returns {Promise<void>}
 */
export const removeEventAttendees = async (eventId, userIds) => {
  try {
    const eventRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(eventRef, {
      attendees: arrayRemove(...userIds),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error removing attendees:', error);
    throw new Error('Failed to remove attendees');
  }
};
