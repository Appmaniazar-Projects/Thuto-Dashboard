import api from './api';

const getSchoolId = () => {
  const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    localStorage.getItem('schoolId') ||
    adminInfo.school?.id ||
    adminInfo.schoolId ||
    null
  );
};

const parentService = {

  getMyChildren: async (phoneNumber) => {
    try {
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;

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

      if (!encodedPhone) {
        throw new Error('Parent phone number is required to fetch children');
      }

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
            return { ...c, id, name, grade, class: className, school: schoolName };
          })
          .filter((c) => c?.id !== null && c?.id !== undefined);
      };

      const response = await api.get(`/parent/${encodedPhone}/children`);
      return normalizeChildren(response.data);
    } catch (error) {
      console.error('Failed to fetch children:', error);
      return [];
    }
  },

  getChildDetails: async (phoneNumber, childId) => {
    try {
      const response = await api.get(`/parent/${phoneNumber}/children/child/${childId}`);
      return response.data || {};
    } catch (error) {
      console.error(`Failed to fetch details for child ${childId}:`, error);
      throw new Error('Failed to load child details.');
    }
  },

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
        return { ...ev, startDate, endDate, date: startDate ?? ev.date };
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
          // fall through
        }
      }

      const url = childId
        ? `/parent/children/${childId}/events/upcoming`
        : '/parent/events/upcoming';
      const response = await api.get(url);
      return coerceEventsArray(response.data).map(normalizeEvent);
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      return [];
    }
  },

  getAnnouncements: async () => {
    try {
      const response = await api.get('/announcements');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      throw new Error('Failed to load announcements.');
    }
  },

  getFeeInfo: async (childId) => {
    try {
      const response = await api.get(`/parent/children/${childId}/fees`);
      return response.data || {};
    } catch (error) {
      console.error(`Failed to fetch fee info for child ${childId}:`, error);
      throw new Error('Failed to load fee information.');
    }
  },

  getChildAttendance: async (studentId, options = {}) => {
    try {
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
        ...(endDate ? { endDate } : {}),
      };

      const response = await api.get(`/parent/children/${studentId}/attendance`, {
        params: Object.keys(params).length > 0 ? params : undefined,
      });

      let data = response.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { data = []; }
      }

      const normalizeRecords = (records) =>
        (Array.isArray(records) ? records : [])
          .map((r) => {
            if (!r || typeof r !== 'object') return r;
            return {
              ...r,
              studentId: r.studentId ?? r.student?.id ?? studentId,
              date: r.date || r.attendanceDate,
              status: r.status || r.attendanceStatus,
              subject: r.subject || r.subjectName || 'N/A',
              teacherName: r.teacherName || r.teacher || 'N/A',
              remarks: r.remarks || r.comment || '',
            };
          })
          .filter(Boolean);

      if (Array.isArray(data)) return normalizeRecords(data);
      if (data && Array.isArray(data.details)) return normalizeRecords(data.details);
      if (data && Array.isArray(data.attendance)) return normalizeRecords(data.attendance);
      return [];
    } catch (error) {
      console.error(`Failed to fetch attendance for student ${studentId}:`, error);
      return [];
    }
  },

  getChildAcademicReports: async (phoneNumber, studentId) => {
    try {
      const response = await api.get(`/parent/${phoneNumber}/students/${studentId}/reports`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch academic reports for child ${studentId}:`, error);
      return [];
    }
  },

  // ── registerParent ─────────────────────────────────────────────
  // Backend: POST /api/admin/register-parent/parent
  // UserService.registerParent() reads getFirstName() for the name field,
  // so firstName and lastName must be sent as separate fields.
  registerParent: async (parentData) => {
    try {
      const response = await api.post('/admin/register-parent/parent', {
        firstName: parentData.firstName,
        lastName: parentData.lastName,
        email: parentData.email,
        phoneNumber: parentData.phoneNumber,
        role: 'PARENT',
        schoolId: parentData.schoolId,
        status: 'PENDING_APPROVAL',
        registrationDate: new Date().toISOString(),
        password: parentData.password,
      });
      return response.data;
    } catch (error) {
      console.error('Error registering parent:', error);
      throw error;
    }
  },

  // ── getPendingParents ──────────────────────────────────────────
  // Backend: GET /api/admin/users/role/parent?schoolId=X
  // schoolId is a required @RequestParam — throws 400 if missing.
  getPendingParents: async () => {
    const schoolId = getSchoolId();
    if (!schoolId) throw new Error('School ID is required to fetch parents');
    const response = await api.get('/admin/users/role/parent', { params: { schoolId } });
    return (response.data || []).filter((u) => u.status === 'pending_approval');
  },

  // ── getApprovedParents ─────────────────────────────────────────
  getApprovedParents: async () => {
    const schoolId = getSchoolId();
    if (!schoolId) throw new Error('School ID is required to fetch parents');
    const response = await api.get('/admin/users/role/parent', { params: { schoolId } });
    return (response.data || []).filter((u) =>
      u.status === 'approved' || (u.status === 'active' && u.role === 'parent')
    );
  },

  // ── getRejectedParents ─────────────────────────────────────────
  getRejectedParents: async (userId) => {
    const schoolId = getSchoolId();
    if (!schoolId) throw new Error('School ID is required to fetch parents');
    const response = await api.get(`/users/parent/reject-user/${userId}`, { params: { schoolId } });
    return (response.data || []).filter((u) => u.status === 'rejected');
  },

  // ── approveParent ──────────────────────────────────────────────
  // Backend: PUT /api/admin/users/approve-user/{userId}
  // Reads updatedBy from UserDTO, so pass it in the body.
  approveParent: async (userId) => {
    try {
      const schoolId = getSchoolId();
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await api.put(
        `/admin/users/approve-user/${userId}`,
        {
          approvedAt: new Date().toISOString(),
          updatedBy: storedUser?.email || '',
        },
        { params: schoolId ? { schoolId } : undefined }
      );
      return response.data;
    } catch (error) {
      console.error('Error approving parent:', error);
      throw error;
    }
  },

  // ── rejectParent ───────────────────────────────────────────────
  // Backend: PUT /api/admin/users/{userId}?schoolId=X
  rejectParent: async (userId, reason) => {
    try {
      const schoolId = getSchoolId();
      if (!schoolId) throw new Error('School ID is required');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await api.put(
        `/admin/users/${userId}`,
        {
          status: 'rejected',
          rejectionReason: reason,
          rejectedAt: new Date().toISOString(),
          updatedBy: storedUser?.email || '',
        },
        { params: { schoolId } }
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting parent:', error);
      throw error;
    }
  },

  // ── getPublicSchools ───────────────────────────────────────────
  getPublicSchools: async () => {
    try {
      const response = await api.get('/superadmins/admins/schools/allSchools');
      return response.data.map((school) => ({
        id: school.id,
        name: school.name,
        province: school.province,
        region: school.region,
        address: school.address,
      }));
    } catch (error) {
      console.error('Error fetching public schools:', error);
      throw error;
    }
  },
};

export default parentService;