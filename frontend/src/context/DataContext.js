const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [superAdminData, setSuperAdminData] = useState(null);

  const loadSuperAdminData = async (user) => {
    try {
      setLoading(true);
      setError(null);
      
      // Make sure we have the user's email
      if (!user?.email) {
        throw new Error('User email is required');
      }
  
      const response = await api.get('/superadmins/dashboard', {
        params: { 
          superAdminEmail: user.email 
        }
      });
  
      // The backend returns an array of schools
      const schools = Array.isArray(response.data) ? response.data : [];
      
      // Update the dashboard data with the schools
      setDashboardData(prev => ({
        ...prev,
        schools,
        totalSchools: schools.length
      }));
  
      return schools;
    } catch (error) {
      console.error('Error loading schools:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load schools';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all data when the provider mounts or user changes
  useEffect(() => {
    const loadData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      setLoading(true);
      setError(null);
      
      try {
        const isSuperAdmin = user?.role?.includes('SUPERADMIN');
        
        if (isSuperAdmin) {
          await loadSuperAdminData(user);
          return;
        }

        // For regular admins
        if (user.schoolId) {
          const response = await api.get('/admin/students', {
            params: { schoolId: user.schoolId }
          });
          setStudents(response.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ... rest of the component remains the same
  return (
    <DataContext.Provider
      value={{
        students,
        dashboardData,
        superAdminData, // Add this to the context
        genderData,
        totalEnrollment,
        loading,
        error,
        refreshData: loadData // Add refresh capability
      }}
    >
      {children}
    </DataContext.Provider>
  );
};