// Request interceptor - for future backend integration
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add schoolId as a query parameter to requests that need it
    // Exclude super admin and master endpoints since they operate above school level
    const schoolId = localStorage.getItem("schoolId");
    const isSuperAdminEndpoint = config.url?.includes('/superadmin') || config.url?.includes('/superadmins');
    const isMasterEndpoint = config.url?.includes('/master');
    
    if (schoolId && !isSuperAdminEndpoint && !isMasterEndpoint) {
      config.params = {
        ...config.params,
        schoolId: schoolId,
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
