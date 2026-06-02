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
      
      console.log('parentService.getMyChildren - Input phone:', phoneNumber);
      console.log('parentService.getMyChildren - User phone:', userData?.phoneNumber);
      console.log('parentService.getMyChildren - Normalized phone:', normalizedPhone);
      console.log('parentService.getMyChildren - Encoded phone:', encodedPhone);

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

      // Use phone-based endpoint (only one that exists in backend)
      if (!encodedPhone) {
        throw new Error('Parent phone number is required to fetch children');
      }
      
      console.log('parentService.getMyChildren - Making API call to:', `/parent/${encodedPhone}/children`);
      console.log('parentService.getMyChildren - User data:', userData);
      console.log('parentService.getMyChildren - User role:', userData?.role);
      console.log('parentService.getMyChildren - User ID:', userData?.id);
      
      try {
        const response = await api.get(`/parent/${encodedPhone}/children`);
        console.log('parentService.getMyChildren - Raw API response:', response);
        console.log('parentService.getMyChildren - Response status:', response.status);
        console.log('parentService.getMyChildren - Response data type:', typeof response.data);
        console.log('parentService.getMyChildren - Response data:', response.data);
        
        const normalized = normalizeChildren(response.data);
        console.log('parentService.getMyChildren - Normalized children:', normalized);
        
        return normalized;
      } catch (error) {
        console.error('Failed to fetch children:', error);
        console.error('Error response:', error.response?.data);
        // Return empty array instead of throwing to prevent UI breakage
        return [];
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
   * @param {string} studentId - The ID of the student/child
   * @param {Object} [options] - Optional query options
   * @param {Date|string} [options.startDate] - Start date (YYYY-MM-DD or Date)
   * @param {Date|string} [options.endDate] - End date (YYYY-MM-DD or Date)
   * @returns {Promise<Array>} Attendance data
   */
  getChildAttendance: async (studentId, options = {}) => {
    try {
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      
      // Get parent's phone number for parent-specific endpoint
      const parentPhoneNumber = userData?.phoneNumber;
      
      if (!parentPhoneNumber) {
        console.error('Parent phone number not found for attendance fetch');
        return [];
      }

      const formatDateParam = (value) => {
        if (!value) return null;
        if (value instanceof Date) return value.toISOString().split('T')[0];
        const trimmed = value.toString().trim();
        return trimmed ? trimmed : null;
      };

      const startDate = formatDateParam(options?.startDate);
      const endDate = formatDateParam(options?.endDate);

      const params = {
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {})
      };

      console.log(`parentService.getChildAttendance - Fetching attendance for child ${studentId} with parent ${parentPhoneNumber}`);

      // Use parent-specific endpoint
      const response = await api.get(`/parent/children/${studentId}/attendance`, {
        params: Object.keys(params).length > 0 ? params : undefined
      });
      
      console.log('parentService.getChildAttendance - Response:', response.data);
      
      // Handle string response from backend
      let data = response.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
          console.log('Parsed string response in parent service');
        } catch (e) {
          console.error('Failed to parse string response:', e);
          data = [];
        }
      }

      const normalizeRecords = (records) => {
        const list = Array.isArray(records) ? records : [];
        return list
          .map((r) => {
            if (!r || typeof r !== 'object') return r;
            const sid = r.studentId ?? r.student?.id ?? studentId;
            return {
              ...r,
              studentId: sid,
              // Ensure we have the required fields for display
              date: r.date || r.attendanceDate,
              status: r.status || r.attendanceStatus,
              subject: r.subject || r.subjectName || 'N/A',
              teacherName: r.teacherName || r.teacher || 'N/A',
              remarks: r.remarks || r.comment || ''
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

      if (data && Array.isArray(data.attendance)) {
        return normalizeRecords(data.attendance);
      }

      return [];
    } catch (error) {
      console.error(`Failed to fetch attendance for student ${studentId}:`, error);
      console.error('Error response:', error.response?.data);
      
      // Treat "no records" as empty rather than a hard error
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log('No attendance records found or access denied');
        return [];
      }
      
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
      console.log('parentService.getChildAcademicReports - Fetching reports for:', { phoneNumber, studentId });
      const response = await api.get(`/parent/${phoneNumber}/students/${studentId}/reports`);
      console.log('parentService.getChildAcademicReports - Response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch academic reports for child ${studentId}:`, error);
      console.error('Error response:', error.response?.data);

      // Treat "no reports" and "not allowed" as empty rather than a hard error
      // so the UI can show the default empty state.
      if (error.response?.status === 404 || error.response?.status === 403) {
        return [];
      }

      return [];
    }
  },

  // Parent Registration API calls
  registerParent: async (parentData) => {
    try {
      // Use existing createUser endpoint with parent-specific data
      const userData = {
        ...parentData,
        // Map parent registration fields to user creation fields
        name: `${parentData.firstName} ${parentData.lastName}`,
        firstName: parentData.firstName,
        lastName: parentData.lastName,
        email: parentData.email,
        phoneNumber: parentData.phoneNumber,
        role: parentData.role || 'parent',
        schoolId: parentData.schoolId,
        // Additional parent-specific fields
        address: parentData.address,
        city: parentData.city,
        province: parentData.province,
        postalCode: parentData.postalCode,
        relationshipToStudent: parentData.relationshipToStudent,
        studentNames: parentData.studentNames,
        studentGrade: parentData.studentGrade,
        helperExpiryDate: parentData.helperExpiryDate,
        // Set status to pending approval
        status: 'pending_approval',
        password: parentData.password
      };
      
      const response = await api.post('/admin/createUser', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering parent:', error);
      throw error;
    }
  },

  // Get pending parent registrations (admin only)
  getPendingParents: async () => {
    try {
      // Use existing getUsersByRole endpoint and filter by status
      const response = await api.get('/admin/users/role/parent');
      // Filter for pending approval status
      const pendingParents = response.data.filter(user => 
        user.status === 'pending_approval' || 
        (!user.status && user.role === 'parent')
      );
      return pendingParents;
    } catch (error) {
      console.error('Error fetching pending parents:', error);
      throw error;
    }
  },

  getApprovedParents: async () => {
    try {
      // Use existing getUsersByRole endpoint and filter by status
      const response = await api.get('/admin/users/role/parent');
      // Filter for approved status
      const approvedParents = response.data.filter(user => 
        user.status === 'approved' || 
        (user.status === 'active' && user.role === 'parent')
      );
      return approvedParents;
    } catch (error) {
      console.error('Error fetching approved parents:', error);
      throw error;
    }
  },

  getRejectedParents: async () => {
    try {
      // Use existing getUsersByRole endpoint and filter by status
      const response = await api.get('/admin/users/role/parent');
      // Filter for rejected status
      const rejectedParents = response.data.filter(user => 
        user.status === 'rejected' && user.role === 'parent'
      );
      return rejectedParents;
    } catch (error) {
      console.error('Error fetching rejected parents:', error);
      throw error;
    }
  },

  // Approve parent registration (admin only)
  approveParent: async (parentId) => {
    try {
      // Use existing user update endpoint to change status
      const response = await api.patch(`/admin/users/${parentId}`, {
        status: 'approved',
        approvedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error approving parent:', error);
      throw error;
    }
  },

  // Reject parent registration (admin only)
  rejectParent: async (parentId, reason) => {
    try {
      // Use existing user update endpoint to change status
      const response = await api.patch(`/admin/users/${parentId}`, {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting parent:', error);
      throw error;
    }
  },

  // Resend approval email (admin only)
  resendApprovalEmail: async (parentId) => {
    try {
      // This would need to be implemented as a backend endpoint
      // For now, we'll use a generic notification endpoint
      const response = await api.post(`/admin/users/${parentId}/notify`, {
        type: 'approval_reminder',
        message: 'Your registration is still pending approval'
      });
      return response.data;
    } catch (error) {
      console.error('Error resending approval email:', error);
      throw error;
    }
  },

  // Get public schools list (for registration form)
  getPublicSchools: async () => {
    try {
      // Use existing getAllSchools endpoint without authentication requirements
      const response = await api.get('/superadmins/admins/schools/allSchools');
      // Return basic school info needed for registration
      return response.data.map(school => ({
        id: school.id,
        name: school.name,
        province: school.province,
        region: school.region,
        address: school.address
      }));
    } catch (error) {
      console.error('Error fetching public schools:', error);
      throw error;
    }
  }
};

export default parentService;
