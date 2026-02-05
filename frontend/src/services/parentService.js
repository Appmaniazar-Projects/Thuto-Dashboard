import api from './api';

const parentService = {
  /**
   * Fetches the parent's children
   * @param {string} phoneNumber - The parent's phone number
   * @returns {Promise<Array>} List of children
   */
  getMyChildren: async (phoneNumber) => {
    try {
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const schoolId =
        localStorage.getItem('schoolId') ||
        userData?.school?.id ||
        userData?.schoolId ||
        null;

      const normalizePhone = (value) => {
        const raw = (value ?? '').toString().trim();
        if (!raw) return '';
        const digits = raw.replace(/\D/g, '');
        if (digits.startsWith('27') && digits.length === 11) {
          return `0${digits.slice(2)}`;
        }
        return digits || raw;
      };

      const normalizedPhone = normalizePhone(phoneNumber || userData?.phoneNumber);
      const encodedPhone = encodeURIComponent(normalizedPhone);
      const params = {
        ...(schoolId ? { schoolId } : {})
      };

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
            const grade = c?.grade ?? c?.gradeName ?? c?.student?.grade ?? c?.student?.gradeName ?? c?.student?.gradeId ?? '';
            const className = c?.class ?? c?.className ?? c?.student?.class ?? c?.student?.className ?? '';
            const schoolName = c?.school ?? c?.schoolName ?? c?.student?.school ?? c?.student?.schoolName ?? '';
            return {
              ...c,
              id,
              name,
              grade,
              class: className,
              school: schoolName,
            };
          })
          .filter((c) => c?.id !== null && c?.id !== undefined);
      };

      // Prefer token-based endpoint (most common + avoids role/phone mismatch issues)
      try {
        const response = await api.get('/parent/children', {
          params: Object.keys(params).length > 0 ? params : undefined
        });
        return normalizeChildren(response.data);
      } catch (primaryError) {
        // Fallback to legacy phone-in-path endpoint if backend requires it.
        if (!encodedPhone) throw primaryError;
        const response = await api.get(`/parent/${encodedPhone}/children`, {
          params: Object.keys(params).length > 0 ? params : undefined
        });
        return normalizeChildren(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch children:', error);
      throw new Error('Failed to load children. Please try again.');
    }
  },

  /**
   * Fetches details for a specific child
   * @param {string} phoneNumber - The parent's phone number
   * @param {string} childId - The ID of the child
   * @returns {Promise<Object>} Child details
   */
  getChildDetails: async (phoneNumber, childId) => {
    try {
      const response = await api.get(`/parent/${phoneNumber}/children/child/${childId}`);
      return response.data || {};
    } catch (error) {
      console.error(`Failed to fetch details for child ${childId}:`, error);
      throw new Error('Failed to load child details.');
    }
  },

  /**
   * Fetches upcoming events for the parent's children
   * @param {string} [childId] - Optional child ID to filter events
   * @returns {Promise<Array>} List of upcoming events
   */
  getUpcomingEvents: async (childId) => {
    try {
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const schoolId =
        localStorage.getItem('schoolId') ||
        userData?.school?.id ||
        userData?.schoolId ||
        null;

      const coerceEventsArray = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.events)) return data.events;
        return [];
      };

      const normalizeEvent = (ev) => {
        if (!ev || typeof ev !== 'object') return ev;
        const startDate = ev.startDate ?? ev.date ?? ev.start ?? null;
        const endDate = ev.endDate ?? ev.end ?? null;
        return {
          ...ev,
          startDate,
          endDate,
          date: startDate ?? ev.date,
        };
      };

      const isUpcoming = (ev) => {
        const start = new Date(ev?.startDate ?? ev?.date);
        const end = new Date(ev?.endDate ?? ev?.startDate ?? ev?.date);
        const now = new Date();
        if (!Number.isNaN(end.getTime()) && end.getTime() >= now.getTime()) return true;
        if (!Number.isNaN(start.getTime()) && start.getTime() >= now.getTime()) return true;
        return false;
      };

      if (schoolId) {
        try {
          const response = await api.get(`/events/${schoolId}`);
          return coerceEventsArray(response.data).map(normalizeEvent).filter(isUpcoming);
        } catch (e) {
          // fall through to parent endpoints
        }
      }

      const url = childId
        ? `/parent/children/${childId}/events/upcoming`
        : '/parent/events/upcoming';

      const response = await api.get(url);
      return coerceEventsArray(response.data).map(normalizeEvent);
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      return []; // Return empty array instead of throwing to prevent UI breakage
    }
  },

  /**
   * Fetches announcements for parents
   * @returns {Promise<Array>} List of announcements
   */
  getAnnouncements: async () => {
    try {
      const response = await api.get('/announcements');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      throw new Error('Failed to load announcements.');
    }
  },

  /**
   * Fetches fee information for a specific child
   * @param {string} childId - The ID of the child
   * @returns {Promise<Object>} Fee information
   */
  getFeeInfo: async (childId) => {
    try {
      const response = await api.get(`/parent/children/${childId}/fees`);
      return response.data || {};
    } catch (error) {
      console.error(`Failed to fetch fee info for child ${childId}:`, error);
      throw new Error('Failed to load fee information.');
    }
  },

  /**
   * Fetches attendance records for a specific child
   * @param {string} studentId - The ID of the student
   * @param {Object} [options] - Optional query options
   * @param {Date|string} [options.startDate] - Start date (YYYY-MM-DD or Date)
   * @param {Date|string} [options.endDate] - End date (YYYY-MM-DD or Date)
   * @returns {Promise<Array>} Attendance data
   */
  getChildAttendance: async (studentId, options = {}) => {
    try {
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const schoolId =
        localStorage.getItem('schoolId') ||
        userData?.school?.id ||
        userData?.schoolId ||
        null;

      const formatDateParam = (value) => {
        if (!value) return null;
        if (value instanceof Date) return value.toISOString().split('T')[0];
        const trimmed = value.toString().trim();
        return trimmed ? trimmed : null;
      };

      const startDate = formatDateParam(options?.startDate);
      const endDate = formatDateParam(options?.endDate);

      const params = {
        ...(schoolId ? { schoolId } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {})
      };

      const response = await api.get(`/attendance/student/${studentId}`, {
        params: Object.keys(params).length > 0 ? params : undefined
      });
      const data = response.data;

      const normalizeRecords = (records) => {
        const list = Array.isArray(records) ? records : [];
        return list
          .map((r) => {
            if (!r || typeof r !== 'object') return r;
            const sid = r.studentId ?? r.student?.id ?? studentId;
            return {
              ...r,
              studentId: sid,
            };
          })
          .filter(Boolean);
      };

      if (Array.isArray(data)) {
        return normalizeRecords(data);
      }

      if (data && Array.isArray(data.details)) {
        return normalizeRecords(data.details);
      }

      return [];
    } catch (error) {
      console.error(`Failed to fetch attendance for student ${studentId}:`, error);
      return []; // Return empty array instead of throwing to prevent UI breakage
    }
  },

  /**
   * Fetches academic reports for a specific child
   * @param {string} phoneNumber - The parent's phone number
   * @param {string} studentId - The ID of the student
   * @returns {Promise<Array>} List of academic reports
   */
  getChildAcademicReports: async (phoneNumber, studentId) => {
    try {
      const response = await api.get(`/parent/${phoneNumber}/students/${studentId}/reports`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch academic reports for child ${studentId}:`, error);

      // Treat "no reports" and "not allowed" as empty rather than a hard error
      // so the UI can show the default empty state.
      if (error.response?.status === 404 || error.response?.status === 403) {
        return [];
      }

      return [];
    }
  }
};

export default parentService;
