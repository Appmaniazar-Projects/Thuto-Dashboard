import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import parentService from '../services/parentService';

const ParentContext = createContext();

// Hoisted so both the initial load effect and refresh() can use it
const normalizeChildren = (items) => {
  const list = Array.isArray(items) ? items : [];
  return list
    .map((c) => {
      const id = c?.id ?? c?.studentId ?? c?.childId ?? c?.student?.id ?? null;
      const name =
        c?.name ||
        [c?.firstName, c?.lastName].filter(Boolean).join(' ') ||
        [c?.student?.firstName, c?.student?.lastName].filter(Boolean).join(' ') ||
        '';
      // Prioritize the actual grade name over raw grade/gradeId values,
      // which may just be numeric IDs (e.g. 13) rather than "Grade 7"
      const grade =
        c?.gradeName ??
        c?.grade?.name ??
        c?.student?.gradeName ??
        c?.student?.grade?.name ??
        '';
      const gradeId =
        c?.gradeId ??
        c?.grade?.id ??
        (typeof c?.grade === 'number' ? c.grade : null) ??
        c?.student?.gradeId ??
        c?.student?.grade?.id ??
        null;
      const className = c?.class ?? c?.className ?? c?.student?.class ?? c?.student?.className ?? '';
      const school = c?.school ?? c?.schoolName ?? c?.student?.school ?? c?.student?.schoolName ?? '';
      return {
        ...c,
        id,
        name,
        grade,
        gradeId,
        class: className,
        school,
      };
    })
    .filter((c) => c?.id !== null && c?.id !== undefined);
};

export const ParentProvider = ({ children }) => {
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);

  const loadChildren = useCallback(async () => {
    const storedUser = localStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : null;

    const userRole = (userData?.role || '').toString().toUpperCase();
    if (!userData || !userRole.includes('PARENT')) {
      console.warn('ParentContext - Role check failed. userData.role was:', userData?.role);
      setError(!userData ? 'Not logged in.' : null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const phoneNumber = userData?.phoneNumber;

      console.log('ParentContext - User data:', userData);
      console.log('ParentContext - Phone number:', phoneNumber);

      if (!phoneNumber) {
        setError('Phone number not found. Please log in again.');
        return;
      }

      console.log('ParentContext - About to call getMyChildren with phone:', phoneNumber);
      const data = await parentService.getMyChildren(phoneNumber);
      console.log('ParentContext - Received children data:', data);
      const normalized = normalizeChildren(data);
      setChildrenData(normalized);

      if (normalized.length > 0) {
        setSelectedChildId((prev) => {
          if (prev) return prev;
          return normalized[0].id;
        });
      }
    } catch (err) {
      setError('Failed to load children data');
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  const selectedChild = childrenData.find(child => child.id === selectedChildId) || null;

  return (
    <ParentContext.Provider
      value={{
        children: childrenData,
        selectedChild,
        selectedChildId,
        setSelectedChildId,
        loading,
        error,
        refresh: async () => {
          setLoading(true);
          const stored = localStorage.getItem('user');
          const currentUser = stored ? JSON.parse(stored) : null;
          const phoneNumber = currentUser?.phoneNumber;
          try {
            const data = await parentService.getMyChildren(phoneNumber);
            setChildrenData(normalizeChildren(data));
          } catch (err) {
            console.error('Error refreshing children:', err);
            setError('Failed to refresh children data');
          } finally {
            setLoading(false);
          }
        }
      }}
    >
      {children}
    </ParentContext.Provider>
  );
};

export const useParent = () => {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
};