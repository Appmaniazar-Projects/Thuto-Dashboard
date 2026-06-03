import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import PageTitle from '../../components/common/PageTitle';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import superadminService from '../../services/superAdminService';

// SA province list used to normalise API data
const SA_PROVINCES = [
  'Gauteng',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Limpopo',
  'Western Cape',
  'Mpumalanga',
  'North West',
  'Free State',
  'Northern Cape',
];

// No-fee quintiles in SA are Q1–Q3; Q4 is semi-fee; Q5 is fee-paying
const QUINTILE_LABELS = {
  1: 'Q1 — No-fee',
  2: 'Q2 — No-fee',
  3: 'Q3 — No-fee',
  4: 'Q4 — Semi-fee',
  5: 'Q5 — Fee-paying',
};

const COLORS = {
  noFee: '#0F6E56',
  semiFee: '#378ADD',
  feePaying: '#185FA5',
  public: '#185FA5',
  independent: '#EF9F27',
  urban: '#185FA5',
  township: '#378ADD',
  semiRural: '#BA7517',
  rural: '#639922',
};

const PIE_COLORS = [COLORS.noFee, COLORS.semiFee, COLORS.feePaying];

const formatPercent = (value) => `${value}%`;

// ------------------------------------------------------------------
// Helper to bucket quintile into fee category
// ------------------------------------------------------------------
const getFeeCategory = (quintile) => {
  if (quintile <= 3) return 'noFee';
  if (quintile === 4) return 'semiFee';
  return 'feePaying';
};

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
const SuperAdminAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
   const superAdminRoles = ['superadmin', 'superadmin_national', 'superadmin_provincial', 'superadmin_regional', 'master'];
    if (!superAdminRoles.includes(user?.role)) {
      navigate('/dashboard');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const schools = await superadminService.getAllSchools();

        // ---- Province stats ----------------------------------------
        const byProvince = {};
        SA_PROVINCES.forEach((p) => {
          byProvince[p] = { name: p, schools: 0, learners: 0, noFee: 0, semiFee: 0, feePaying: 0, public: 0, independent: 0 };
        });

        // ---- Quintile counts ----------------------------------------
        const quintileCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        // ---- Region stats ------------------------------------------
        const byRegion = {};

        // ---- Totals ------------------------------------------------
        let totalStudents = 0;
        let totalAdmins = 0;
        let totalTeachers = 0;
        let totalNoFee = 0;
        let totalSemiFee = 0;
        let totalFeePaying = 0;
        let totalPublic = 0;
        let totalIndependent = 0;

        schools.forEach((school) => {
          const province = school.province || 'Unknown';
          const region = school.region || school.district || 'Unknown';
          const quintile = school.quintile || 5;
          const feeCategory = getFeeCategory(quintile);
          const isPublic = school.schoolType !== 'independent';
          const students = school.totalStudents || 0;

          // Province bucket
          if (!byProvince[province]) {
            byProvince[province] = { name: province, schools: 0, learners: 0, noFee: 0, semiFee: 0, feePaying: 0, public: 0, independent: 0 };
          }
          byProvince[province].schools += 1;
          byProvince[province].learners += students;
          byProvince[province][feeCategory] += 1;
          if (isPublic) byProvince[province].public += 1;
          else byProvince[province].independent += 1;

          // Quintile bucket
          if (quintile >= 1 && quintile <= 5) quintileCounts[quintile] += 1;

          // Region bucket
          if (!byRegion[region]) byRegion[region] = { name: region, schools: 0, learners: 0, noFee: 0, semiFee: 0, feePaying: 0, public: 0, independent: 0 };
          byRegion[region].schools += 1;
          byRegion[region].learners += students;
          byRegion[region][feeCategory] += 1;
          if (isPublic) byRegion[region].public += 1;
          else byRegion[region].independent += 1;

          // Totals
          totalStudents += students;
          totalAdmins += school.totalAdmins || 0;
          totalTeachers += school.totalTeachers || 0;
          if (feeCategory === 'noFee') totalNoFee += 1;
          else if (feeCategory === 'semiFee') totalSemiFee += 1;
          else totalFeePaying += 1;

          if (isPublic) totalPublic += 1;
          else totalIndependent += 1;
        });

        const provinceStats = Object.values(byProvince).filter((p) => p.schools > 0);
        const regionStats = Object.values(byRegion).sort((a, b) => b.schools - a.schools).slice(0, 12);
        const topSchools = [...schools]
          .sort((a, b) => (b.totalStudents || 0) - (a.totalStudents || 0))
          .slice(0, 8)
          .map((school) => ({
            name: school.schoolName || school.name || 'Unnamed school',
            province: school.province || 'Unknown',
            region: school.region || school.district || 'Unknown',
            learners: school.totalStudents || 0,
            quintile: school.quintile || 'N/A',
            feeCategory: getFeeCategory(school.quintile || 5),
          }));
        const total = schools.length;
        const noFeePct = total ? Math.round((totalNoFee / total) * 100) : 0;
        const semiFeePct = total ? Math.round((totalSemiFee / total) * 100) : 0;
        const feePayingPct = total ? Math.round((totalFeePaying / total) * 100) : 0;

        setAnalytics({
          provinceStats,
          regionStats,
          quintileStats: Object.entries(quintileCounts).map(([q, count]) => ({
            name: QUINTILE_LABELS[q],
            count,
          })),
          feeTypeStats: [
            { name: 'No-fee (Q1–Q3)', value: noFeePct, count: totalNoFee },
            { name: 'Semi-fee (Q4)', value: semiFeePct, count: totalSemiFee },
            { name: 'Fee-paying (Q5)', value: feePayingPct, count: totalFeePaying },
          ],
          schoolTypeStats: [
            { name: 'Public schools', value: total ? Math.round((totalPublic / total) * 100) : 0, count: totalPublic },
            { name: 'Independent schools', value: total ? Math.round((totalIndependent / total) * 100) : 0, count: totalIndependent },
          ],
          topSchools,
          summaryMetrics: {
            totalSchools: total,
            totalStudents,
            totalAdmins,
            totalTeachers,
            totalPublic,
            totalIndependent,
            noFeePct,
            semiFeePct,
            feePayingPct,
            avgLearnersPerSchool: total ? Math.round(totalStudents / total) : 0,
          },
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) return null;

  const { provinceStats, regionStats, quintileStats, feeTypeStats, schoolTypeStats, topSchools, summaryMetrics } = analytics;

  return (
    <Box sx={{ width: '100%', p: 3, backgroundColor: 'background.default' }}>
      <PageTitle title="Super Admin Analytics" />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* ---- Summary metrics ---- */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[ 
          { label: 'Schools', value: summaryMetrics.totalSchools },
          { label: 'Learners', value: summaryMetrics.totalStudents.toLocaleString() },
          { label: 'Public schools', value: summaryMetrics.totalPublic },
          { label: 'Independent schools', value: summaryMetrics.totalIndependent },
          { label: 'No-fee share', value: formatPercent(summaryMetrics.noFeePct) },
          { label: 'Fee-paying share', value: formatPercent(summaryMetrics.feePayingPct) },
        ].map((m) => (
          <Grid item xs={6} sm={4} md={2.4} key={m.label}>
            <Card variant="outlined" sx={{ borderRadius: 3, borderColor: 'divider', boxShadow: 0, backgroundColor: 'background.paper' }}>
              <CardContent sx={{ pb: '12px !important' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {m.label}
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  {m.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ---- Tabs ---- */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="By Province" />
        <Tab label="Fee Type & Quintile" />
        <Tab label="By Region" />
        <Tab label="Trends" />
      </Tabs>

      {/* ======================================================== */}
      {/* TAB 0 — Province                                          */}
      {/* ======================================================== */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Schools per province</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Real school counts grouped by province, using the live school directory available to the super admin.
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={provinceStats} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="schools" fill={COLORS.public} name="Schools" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Learners per province</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Province-level learner enrolment helps identify where the largest school populations are concentrated.
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={provinceStats} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => v.toLocaleString()} />
                  <Bar dataKey="learners" fill={COLORS.semiFee} name="Learners" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Public vs independent mix by province</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={provinceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="public" stackId="a" fill={COLORS.public} name="Public" />
                  <Bar dataKey="independent" stackId="a" fill={COLORS.independent} name="Independent" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ======================================================== */}
      {/* TAB 1 — Fee type & quintile                               */}
      {/* ======================================================== */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Fee mix across the school system</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Schools are grouped using the South African quintile model: Q1–Q3 no-fee, Q4 semi-fee, and Q5 fee-paying.
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={feeTypeStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine
                  >
                    {feeTypeStats.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n, p) => [`${v}% (${p.payload.count} schools)`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Quintile distribution</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                This highlights how the national school base is split across government funding categories.
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={quintileStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Schools">
                    {quintileStats.map((_, i) => (
                      <Cell key={i} fill={[COLORS.noFee, COLORS.noFee, COLORS.noFee, COLORS.semiFee, COLORS.feePaying][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Fee type breakdown by province</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Province</TableCell>
                    <TableCell align="center">No-fee (Q1–Q3)</TableCell>
                    <TableCell align="center">Semi-fee (Q4)</TableCell>
                    <TableCell align="center">Fee-paying (Q5)</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {provinceStats.map((p) => (
                    <TableRow key={p.name} hover>
                      <TableCell>{p.name}</TableCell>
                      <TableCell align="center">
                        <Chip label={p.noFee} size="small" sx={{ bgcolor: '#E1F5EE', color: '#085041' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={p.semiFee} size="small" sx={{ bgcolor: '#E6F1FB', color: '#0C447C' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={p.feePaying} size="small" sx={{ bgcolor: '#185FA5', color: '#fff' }} />
                      </TableCell>
                      <TableCell align="right">{p.schools}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ======================================================== */}
      {/* TAB 2 — Region                                            */}
      {/* ======================================================== */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Regional school concentration</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                View which regions carry the largest share of schools and fee-paying coverage.
              </Typography>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={regionStats} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="noFee" stackId="a" fill={COLORS.noFee} name="No-fee" />
                  <Bar dataKey="feePaying" stackId="a" fill={COLORS.feePaying} name="Fee-paying" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Top regional learner load</Typography>
              {regionStats.slice(0, 6).map((row) => {
                const pct = summaryMetrics.totalStudents ? Math.round((row.learners / summaryMetrics.totalStudents) * 100) : 0;
                return (
                  <Box key={row.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{row.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{row.learners.toLocaleString()} learners ({pct}%)</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{ height: 10, borderRadius: 5, bgcolor: 'grey.100', '& .MuiLinearProgress-bar': { bgcolor: COLORS.public } }}
                    />
                  </Box>
                );
              })}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ======================================================== */}
      {/* TAB 3 — Trends                                            */}
      {/* ======================================================== */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Actual school mix by fee category</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                This reflects the real distribution of fee status across the current school register.
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={feeTypeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [`${value}${name === 'value' ? '%' : ' schools'}`, name]} />
                  <Bar dataKey="value" name="Share of schools" fill={COLORS.public} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Public vs independent coverage</Typography>
              {schoolTypeStats.map((row) => (
                <Box key={row.name} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{row.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{row.count} schools ({row.value}%)</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={row.value}
                    sx={{ height: 10, borderRadius: 5, bgcolor: 'grey.100', '& .MuiLinearProgress-bar': { bgcolor: row.name === 'Public schools' ? COLORS.public : COLORS.independent } }}
                  />
                </Box>
              ))}
            </Paper>

            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>Top schools by learner count</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>School</TableCell>
                    <TableCell align="right">Learners</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topSchools.map((school) => (
                    <TableRow key={school.name} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{school.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{school.province} • {school.region}</Typography>
                      </TableCell>
                      <TableCell align="right">{school.learners.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SuperAdminAnalytics;