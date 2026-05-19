import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import {
  Box,
  Autocomplete,
  CircularProgress,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  School as TeacherIcon,
  Note as NoteIcon

} from '@mui/icons-material';
import { getAllUsers, createUser, updateUser, deleteUser, getUsersByRole, searchStudents, checkParentPhoneExists } from '../../services/adminService';
import gradeService from '../../services/gradeService';
import subjectService from '../../services/subjectService';
import studentService from '../../services/studentService';
import PageTitle from '../../components/common/PageTitle';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false);

    // Bulk upload states
    const [bulkUploadFile, setBulkUploadFile] = useState(null);
    const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
    const [bulkUploadResults, setBulkUploadResults] = useState(null);
    const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
    const [bulkUploadErrors, setBulkUploadErrors] = useState([]);

    const [newParents, setNewParents] = useState([]);
    const [parentLookupPhone, setParentLookupPhone] = useState('');
    const [parentLookupResult, setParentLookupResult] = useState(null);
    const [parentLookupTried, setParentLookupTried] = useState(false);

    const [selectedStudents, setSelectedStudents] = useState([]);
    const [studentSearchInput, setStudentSearchInput] = useState('');
    const [studentSearchOptions, setStudentSearchOptions] = useState([]);
    const [studentSearchLoading, setStudentSearchLoading] = useState(false);
    
    // Form state
    const [userForm, setUserForm] = useState({
        name: '',
        lastName: '',
        username: '',
        email: '',
        phoneNumber: '',
        role: '',
        subjects: [],
        grade: '',
        schoolId: '',
        parentName: '',
        parentLastName: '',
        parentPhoneNumber: '',
        parentEmail: '',
    });

    const roles = [
        { value: 'student', label: 'Student' },
        { value: 'parent', label: 'Parent' },
        { value: 'teacher', label: 'Teacher' },
    ];

    const addNewParent = () => {
        setNewParents((prev) => [...prev, { name: '', lastName: '', email: '', phoneNumber: '' }]);
    };

    const removeNewParent = (indexToRemove) => {
        setNewParents((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const updateNewParent = (indexToUpdate, key, value) => {
        setNewParents((prev) =>
            prev.map((p, index) => (index === indexToUpdate ? { ...p, [key]: value } : p))
        );
    };

    const normalizePhone = (value) => (value || '').toString().replace(/\D/g, '');

    const findExistingParentByPhone = (phone) => {
        const normalized = normalizePhone(phone);
        if (!normalized) return null;
        return (parents || []).find((p) => normalizePhone(p?.phoneNumber) === normalized) || null;
    };

    const handleFindParent = () => {
        const found = findExistingParentByPhone(parentLookupPhone);
        setParentLookupTried(true);
        setParentLookupResult(found);

        if (found) {
            setNewParents([
                {
                    name: found?.name || '',
                    lastName: found?.lastName || '',
                    email: found?.email || '',
                    phoneNumber: found?.phoneNumber || parentLookupPhone || '',
                },
            ]);
            setFormErrors((prev) => ({ ...prev, parentPhoneNumber: false }));
        }
    };

    const clearParentLookup = () => {
        setParentLookupPhone('');
        setParentLookupResult(null);
        setParentLookupTried(false);
        setNewParents([]);
        setFormErrors((prev) => ({ ...prev, parentPhoneNumber: false }));
    };

    useEffect(() => {
        fetchUsers();
        loadGrades();
        loadSubjects();
    }, []);

    useEffect(() => {
        if (userForm.role !== 'parent') return;
        const query = (studentSearchInput || '').trim();
        if (!query) {
            setStudentSearchOptions([]);
            setStudentSearchLoading(false);
            return;
        }

        setStudentSearchLoading(true);
        const timer = setTimeout(() => {
            searchStudents(query)
                .then((results) => setStudentSearchOptions(Array.isArray(results) ? results : []))
                .catch(() => setStudentSearchOptions([]))
                .finally(() => setStudentSearchLoading(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [studentSearchInput, userForm.role]);

    const loadGrades = async () => {
        try {
            const gradesData = await gradeService.getSchoolGrades();
            setGrades(gradesData);
        } catch (error) {
            // Silently handle error and continue
        }
    };

    const loadSubjects = async () => {
        try {
            const subjectsData = await subjectService.getSchoolSubjects();
            setSubjects(subjectsData || []);
        } catch (error) {
            // Provide fallback subject data until backend implements the endpoint
            setSubjects([
                { id: 1, name: 'Mathematics' },
                { id: 2, name: 'English' },
                { id: 3, name: 'Science' },
                { id: 4, name: 'History' },
                { id: 5, name: 'Geography' }
            ]);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const [allUsersData, parentsData, teachersData, studentsData] = await Promise.all([
                getAllUsers(),
                getUsersByRole('parent'),
                getUsersByRole('teacher'),
                getUsersByRole('student')
            ]);
            setUsers(allUsersData);
            setParents(parentsData || []);
            setTeachers(teachersData || []);
            setStudents(studentsData || []);
        } catch (err) {
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    // Normalize role to lowercase before submission
    const normalizeRole = (role) => {
        if (!role) return 'student';
        return role.toLowerCase();
    };

    const toIdString = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
            const maybeId = value.id ?? value.subjectId ?? value.gradeId ?? value.value;
            return maybeId === null || maybeId === undefined ? '' : String(maybeId);
        }
        return String(value);
    };

    const normalizeSubjectIds = (rawSubjects) => {
        if (!Array.isArray(rawSubjects)) return [];
        return rawSubjects
            .map((s) => {
                if (typeof s === 'object' && s !== null) {
                    return toIdString(s.id ?? s.subjectId ?? s.value ?? s.name);
                }
                return toIdString(s);
            })
            .filter(Boolean);
    };

    const normalizeGradeId = (user) => {
        const raw = user?.grade?.id ?? user?.gradeId ?? user?.grade;
        return toIdString(raw);
    };

    const normalizeSchoolId = (user) => {
        return toIdString(user?.schoolId ?? user?.school?.id);
    };

    const toNumberIfNumeric = (value) => {
        if (value === null || value === undefined) return value;
        const str = String(value).trim();
        if (!str) return value;
        const num = Number(str);
        return Number.isFinite(num) ? num : value;
    };

    const handleSubmit = async () => {
        // Reset previous errors
        setFormErrors({});
        setError('');
        
        // Validation
        const errors = {};
        
        if (!userForm.name.trim()) {
            errors.name = true;
        }
        
        if (!userForm.email.trim()) {
            errors.email = true;
        } else {
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userForm.email)) {
                errors.email = true;
            }
        }
        

        if (userForm.role !== 'student') {
            // For parent/teacher, keep phone required
            if (!userForm.phoneNumber.trim()) {
                errors.phoneNumber = true;
            } else {
                const phoneRegex = /^[\d\s\+\-\(\)]+$/;
                if (!phoneRegex.test(userForm.phoneNumber)) {
                    errors.phoneNumber = true;
                }
            }
        } else {
            // For students, phone can be null. Validate only when provided.
            const studentPhone = userForm.phoneNumber.trim();
            if (studentPhone) {
                const phoneRegex = /^[\d\s\+\-\(\)]+$/;
                if (!phoneRegex.test(studentPhone)) {
                    errors.phoneNumber = true;
                }
            }

            // Student must have a username
            if (!userForm.username.trim()) {
                errors.username = true;
            }

            // Student must have a grade selected
            if (!userForm.grade) {
                errors.grade = true;
            }

            const validNewParentCount = newParents.filter((p) => p.phoneNumber?.trim()).length;

            const hasLookupPhone = !!normalizePhone(parentLookupPhone);
            const hasFoundExistingParent = !!parentLookupResult;
            const shouldRequireNewParentDetails = parentLookupTried && !hasFoundExistingParent;

            if (!editingUser) {
                if (shouldRequireNewParentDetails) {
                    if (validNewParentCount === 0) {
                        errors.parentPhoneNumber = true;
                    }
                } else if (!hasFoundExistingParent) {
                    if (!hasLookupPhone && validNewParentCount === 0) {
                        errors.parentPhoneNumber = true;
                    }
                }
            }

            // If parent email is provided, ensure it's a valid email (avoid backend validation errors)
            const primaryNewParent = newParents.find((p) => p.phoneNumber?.trim()) || null;
            const parentEmail = (primaryNewParent?.email || '').trim();
            if (parentEmail) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(parentEmail)) {
                    errors.parentEmail = true;
                }
            }
        }

        if (userForm.role === 'teacher') {
            if (!userForm.grade) {
                errors.grade = true;
            }
            if (!Array.isArray(userForm.subjects) || userForm.subjects.length === 0) {
                errors.subjects = true;
            }
        }



        
        if (!userForm.role) {
            errors.role = true;
        }
        
        // If there are errors, set them and return
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setError('Please fix the errors above');
            return;
        }
        
        // Normalize form data before submission
        const primaryNewParent = newParents.find((p) => p.phoneNumber?.trim()) || null;

        const shouldOverrideParentFields = !!(primaryNewParent?.phoneNumber || '').toString().trim();
        const lookupParentPhoneRaw = (parentLookupPhone || '').toString().trim();
        const hasLookupParentPhone = !!normalizePhone(lookupParentPhoneRaw);

        const formData = {
            ...userForm,
            role: normalizeRole(userForm.role),
            grade: userForm.grade ? toNumberIfNumeric(userForm.grade) : userForm.grade,
            subjects: Array.isArray(userForm.subjects)
                ? userForm.subjects.map((id) => toNumberIfNumeric(id)).filter((id) => id !== '' && id !== null && id !== undefined)
                : [],
            // Preserve existing linked parent details when editing a student,
            // unless the admin explicitly finds/enters a new parent/guardian.
            parentName: shouldOverrideParentFields ? (primaryNewParent?.name || '') : (userForm.parentName || ''),
            parentLastName: shouldOverrideParentFields ? (primaryNewParent?.lastName || '') : (userForm.parentLastName || ''),
            parentEmail: shouldOverrideParentFields ? (primaryNewParent?.email || '') : (userForm.parentEmail || ''),
            parentPhoneNumber: shouldOverrideParentFields
                ? (primaryNewParent?.phoneNumber || '')
                : (hasLookupParentPhone ? lookupParentPhoneRaw : (userForm.parentPhoneNumber || '')),
        };

        if ((formData.role || '').toString().toLowerCase() === 'parent') {
            const studentDTOS = (selectedStudents || [])
                .map((s) => ({ id: s?.id }))
                .filter((s) => s?.id !== null && s?.id !== undefined);

            if (studentDTOS.length > 0) {
                formData.studentDTOS = studentDTOS;
            }
        }

        try {
            // Server-side duplicate checks for parent phone numbers
            if (!editingUser) {
                const roleLower = (formData.role || '').toString().toLowerCase();

                if (roleLower === 'parent') {
                    const exists =
                        typeof checkParentPhoneExists === 'function'
                            ? await checkParentPhoneExists(formData.phoneNumber)
                            : !!findExistingParentByPhone(formData.phoneNumber);
                    if (exists) {
                        setFormErrors((prev) => ({ ...prev, phoneNumber: true }));
                        setError('A parent with this phone number already exists. Please enter a different phone number.');
                        return;
                    }
                }

                if (roleLower === 'student') {
                    const parentPhone = (formData.parentPhoneNumber || '').toString().trim();
                    if (parentPhone) {
                        findExistingParentByPhone(parentPhone);
                    }
                }
            }

            if (editingUser) {
                await updateUser(editingUser.id, formData);
            } else {
                await createUser(formData);
            }
            setDialogOpen(false);
            setEditingUser(null);
            resetForm();
            fetchUsers();
            setError(''); // Clear any previous errors
        } catch (err) {
            setError('Failed to save user: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                fetchUsers();
            } catch (err) {
                setError('Failed to delete user');
            }
        }
    };

    const handleExportStudentNotes = async (student) => {
        try {
            // Get student's notes from the backend
            const notes = await studentService.getStudentNotes(student.id);
            
            // Create CSV content
            const csvContent = [
                ['Student Name', 'Date', 'Note', 'Teacher', 'Subject'],
                ...notes.map(note => [
                    `${student.name} ${student.lastName || ''}`,
                    note.date || new Date().toISOString().split('T')[0],
                    note.content || '',
                    note.teacherName || '',
                    note.subjectName || ''
                ])
            ];

            // Convert to CSV string
            const csvString = Papa.unparse(csvContent);
            
            // Create blob and download
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `student_notes_${student.name}_${student.lastName || ''}_${new Date().toISOString().split('T')[0]}.csv`);
            
        } catch (error) {
            setError('Failed to export student notes. Please try again.');
        }
    };

    const openDialog = (user = null) => {
        if (user) {
            setEditingUser(user);

            const roleLower = (normalizeRole(user.role) || '').toString().toLowerCase();
            const normalizedUsername = normalizePhone(user.username);
            const normalizedPhone = normalizePhone(user.phoneNumber);
            const safeUsername =
                roleLower === 'student' && normalizedUsername && normalizedPhone && normalizedUsername === normalizedPhone
                    ? ''
                    : (user.username || '');

            setUserForm({
                name: user.name || '',
                lastName: user.lastName || '',
                username: safeUsername,
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                role: normalizeRole(user.role) || '',
                subjects: normalizeSubjectIds(user.subjects),
                grade: normalizeGradeId(user),
                schoolId: normalizeSchoolId(user),
                parentName: user.parentName || '',
                parentLastName: user.parentLastName || '',
                parentPhoneNumber: user.parentPhoneNumber || '',
                parentEmail: user.parentEmail || '',
            });

            // If editing a parent, show the currently linked student(s) in the dialog.
            if (roleLower === 'parent') {
                const rawLinks = user.studentDTOS || user.students || user.studentIds || [];
                const linkedIds = (Array.isArray(rawLinks) ? rawLinks : [])
                    .map((s) => (typeof s === 'object' && s !== null ? s.id : s))
                    .filter((id) => id !== null && id !== undefined);

                const linkedStudents = linkedIds
                    .map((id) => (students || []).find((st) => String(st?.id) === String(id)) || { id })
                    .filter(Boolean);

                setSelectedStudents(linkedStudents);
            }
        } else {
            setEditingUser(null);
            resetForm();
        }
        setNewParents([]);
        setParentLookupPhone('');
        setParentLookupResult(null);
        setParentLookupTried(false);
        // Only clear linked students when creating a new user or editing non-parent roles.
        if (!user || (normalizeRole(user?.role) || '').toString().toLowerCase() !== 'parent') {
            setSelectedStudents([]);
        }
        setStudentSearchInput('');
        setStudentSearchOptions([]);
        setFormErrors({});
        setError('');
        setDialogOpen(true);
    };

    const resetForm = () => {
        setUserForm({
            name: '',
            lastName: '',
            username: '',
            email: '',
            phoneNumber: '',
            role: '',
            subjects: [],
            grade: '',
            schoolId: '',
            parentName: '',
            parentLastName: '',
            parentPhoneNumber: '',
            parentEmail: '',
        });
        setNewParents([]);
        setParentLookupPhone('');
        setParentLookupResult(null);
        setParentLookupTried(false);
        setSelectedStudents([]);
        setStudentSearchInput('');
        setStudentSearchOptions([]);
        setFormErrors({});
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleExport = (data, title) => {
        if (!data || data.length === 0) {
            setError('No data to export.');
            return;
        }

        // Define headers based on the table
        const headers = ['Name', 'Last Name', 'Email', 'Phone Number', 'Role'];
        const isTeachersTable = title === 'Teachers';
        if (isTeachersTable) {
            headers.push('Subjects', 'Grade');
        }

        const csvData = data.map(user => {
            const row = {
                'Name': user.name,
                'Last Name': user.lastName || 'N/A',
                'Email': user.email,
                'Phone Number': user.phoneNumber,
                'Role': user.role,
            };
            if (isTeachersTable) {
                row['Subjects'] = user.subjects?.join(', ') || 'Not assigned';
                row['Grade'] = user.grade || 'Not assigned';
            }
            return row;
        });

        const csv = Papa.unparse(csvData, { header: true, columns: headers });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const fileName = `${title.replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}.csv`;
        saveAs(blob, fileName);
    };

    const downloadBulkUploadTemplate = () => {
        const headers = [
            'firstName',
            'lastName',
            'email',
            'phoneNumber',
            'role',
            'schoolId',
            'parentRole',
            'relationshipToStudent',
            'studentNames',
            'grade',
            'subjects',
            'password'
        ];

        const sampleRows = [
            // Student example
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@student.school.com',
                phoneNumber: '0761234567',
                role: 'student',
                schoolId: 'SCH001',
                parentRole: '',
                relationshipToStudent: '',
                studentNames: '',
                grade: '8',
                subjects: 'Mathematics,English,Science',
                password: 'TempPass123'
            },
            // Parent example
            {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@parent.com',
                phoneNumber: '0767654321',
                role: 'parent',
                schoolId: 'SCH001',
                parentRole: 'parent',
                relationshipToStudent: 'Mother',
                studentNames: 'John Doe',
                grade: '',
                subjects: '',
                password: 'TempPass123'
            },
            // Teacher example
            {
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'sarah.johnson@school.com',
                phoneNumber: '0712345678',
                role: 'teacher',
                schoolId: 'SCH001',
                parentRole: '',
                relationshipToStudent: '',
                studentNames: '',
                grade: '',
                subjects: 'Mathematics,Physics',
                password: 'TempPass123'
            }
        ];

        const csv = Papa.unparse(sampleRows, { header: true, columns: headers });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `user_bulk_upload_template_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleBulkUploadFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setBulkUploadFile(file);
            setBulkUploadErrors([]);
            setBulkUploadResults(null);
        }
    };

    const validateBulkUploadData = (data) => {
        const errors = [];
        const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'role'];

        data.forEach((row, index) => {
            const rowNum = index + 2; // +2 because of 0-index and header row

            // Check required fields
            requiredFields.forEach(field => {
                if (!row[field] || row[field].trim() === '') {
                    errors.push(`Row ${rowNum}: ${field} is required`);
                }
            });

            // Validate email format
            if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
                errors.push(`Row ${rowNum}: Invalid email format`);
            }

            // Validate phone number (South African format)
            if (row.phoneNumber && !/^(\+27|0)[0-9]{9}$/.test(row.phoneNumber.replace(/\s/g, ''))) {
                errors.push(`Row ${rowNum}: Invalid phone number format`);
            }

            // Validate role
            const validRoles = ['student', 'teacher', 'parent', 'admin'];
            if (row.role && !validRoles.includes(row.role.toLowerCase())) {
                errors.push(`Row ${rowNum}: Invalid role. Must be one of: ${validRoles.join(', ')}`);
            }

            // Validate parent role if role is parent
            if (row.role && row.role.toLowerCase() === 'parent') {
                const validParentRoles = ['parent', 'guardian', 'sponsor', 'helper'];
                if (row.parentRole && !validParentRoles.includes(row.parentRole.toLowerCase())) {
                    errors.push(`Row ${rowNum}: Invalid parent role. Must be one of: ${validParentRoles.join(', ')}`);
                }
            }
        });

        return errors;
    };

    const handleBulkUpload = async () => {
        if (!bulkUploadFile) {
            setBulkUploadErrors(['Please select a file to upload']);
            return;
        }

        setBulkUploadLoading(true);
        setBulkUploadProgress(0);
        setBulkUploadErrors([]);
        setBulkUploadResults(null);

        try {
            // Parse CSV file
            const fileContent = await bulkUploadFile.text();
            const parsed = Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim()
            });

            if (parsed.errors.length > 0) {
                setBulkUploadErrors(parsed.errors.map(err => `CSV Parse Error: ${err.message}`));
                return;
            }

            // Validate data
            const validationErrors = validateBulkUploadData(parsed.data);
            if (validationErrors.length > 0) {
                setBulkUploadErrors(validationErrors);
                return;
            }

            setBulkUploadProgress(25);

            // Process the data - normalize and prepare for upload
            const processedData = parsed.data.map(row => ({
                ...row,
                role: row.role.toLowerCase(),
                parentRole: row.parentRole ? row.parentRole.toLowerCase() : '',
                firstName: row.firstName.trim(),
                lastName: row.lastName.trim(),
                email: row.email.trim().toLowerCase(),
                phoneNumber: row.phoneNumber.replace(/\s/g, ''),
                name: `${row.firstName.trim()} ${row.lastName.trim()}`,
                status: row.role === 'parent' ? 'pending_approval' : 'active'
            }));

            setBulkUploadProgress(50);

            // Upload to Firebase Storage first
            const fileName = `bulk_users_${Date.now()}.csv`;
            const formData = new FormData();
            formData.append('file', bulkUploadFile);
            formData.append('fileName', fileName);

            // Import the upload service
            const { default: fileUploadService } = await import('../../services/fileUploadService');

            const uploadResult = await fileUploadService.uploadFile(formData, 'bulk-uploads');
            setBulkUploadProgress(75);

            // Send to backend for processing
            const bulkDataPayload = {
                dataType: 'users',
                fileName: uploadResult.fileName,
                fileUrl: uploadResult.downloadURL,
                filePath: uploadResult.filePath,
                uploadDate: uploadResult.uploadDate,
                recordCount: processedData.length
            };

            const response = await adminService.uploadBulkData(bulkDataPayload);
            setBulkUploadProgress(100);

            setBulkUploadResults({
                success: true,
                message: `Successfully uploaded ${response.created || 0} users`,
                details: response
            });

            // Refresh the user lists
            fetchUsers();

        } catch (error) {
            setBulkUploadErrors([error.response?.data?.message || error.message || 'Upload failed']);
        } finally {
            setBulkUploadLoading(false);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'error';
            case 'teacher': return 'primary';
            case 'parent': return 'secondary';
            case 'student': return 'success';
            default: return 'default';
        }
    };

    const renderUserTable = (userData, title, canCreateRole = true) => {
        // Safety check: ensure userData is always an array
        const safeUserData = Array.isArray(userData) ? userData : [];
        
        return (
        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1,
                        mb: 2
                    }}
                >
                    <Typography variant="h6" sx={{ lineHeight: 1.2 }}>{title}</Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            width: { xs: '100%', sm: 'auto' },
                            justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                        }}
                    >
                        {canCreateRole && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    const roleMap = {
                                        'All Users': 'student',
                                        'Parents': 'parent',
                                        'Students': 'student',
                                        'Teachers': 'teacher'
                                    };
                                    const selectedRole = roleMap[title] || 'student';
                                    
                                    // Reset form and set the role
                                    resetForm();
                                    setUserForm(prev => ({ ...prev, role: selectedRole }));
                                    setEditingUser(null);
                                    setFormErrors({});
                                    setError('');
                                    setDialogOpen(true);
                                }}
                                sx={{ flexGrow: 0 }}
                            >
                                Add {title === 'All Users' ? 'User' : title.slice(0, -1)}
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            onClick={() => setBulkUploadDialogOpen(true)}
                        >
                            Bulk Upload
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleExport(userData, title)}
                        >
                            Export CSV
                        </Button>
                    </Box>
                </Box>
                
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Role</TableCell>
                                {title === 'Teachers' && <TableCell>Subjects</TableCell>}
                                {title === 'Teachers' && <TableCell>Grade</TableCell>}
                                {title === 'Students' && <TableCell>Grade</TableCell>}
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {safeUserData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography color="text.secondary">
                                            No {title.toLowerCase()} found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                safeUserData.map((user) => {
                                    // For teachers: resolve subject and grade IDs to names
                                    let subjectNames = [];
                                    let gradeName = 'Not assigned';
                                    
                                    if (title === 'Teachers') {
                                        // Convert subject IDs to names
                                        if (Array.isArray(user.subjects) && user.subjects.length > 0) {
                                            subjectNames = user.subjects
                                                .map(subjectId => {
                                                    const subject = subjects.find(s => String(s.id) === String(subjectId));
                                                    return subject ? subject.name : null;
                                                })
                                                .filter(Boolean); // Remove null values
                                        }
                                        
                                        // Convert grade ID to name
                                        if (user.grade) {
                                            const grade = grades.find(g => String(g.id) === String(user.grade));
                                            gradeName = grade ? grade.name : 'Not assigned';
                                        }
                                    }
                                    
                                    // For students: resolve grade ID to name
                                    let studentGradeName = 'Not assigned';
                                    if (title === 'Students' && user.grade) {
                                        const grade = grades.find(g => String(g.id) === String(user.grade));
                                        studentGradeName = grade ? grade.name : 'Not assigned';
                                    }
                                    
                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.lastName || 'N/A'}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.phoneNumber}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={user.role} 
                                                    color={getRoleColor(user.role)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            {title === 'Teachers' && (
                                                <TableCell>
                                                    {subjectNames.length > 0 ? subjectNames.join(', ') : 'Not assigned'}
                                                </TableCell>
                                            )}
                                            {title === 'Teachers' && (
                                                <TableCell>{gradeName}</TableCell>
                                            )}
                                            {title === 'Students' && (
                                                <TableCell>{studentGradeName}</TableCell>
                                            )}
                                            <TableCell align="right">
                                                {title === 'Students' && (
                                                    <IconButton onClick={() => handleExportStudentNotes(user)} title="Export Notes">
                                                        <NoteIcon />
                                                    </IconButton>
                                                )}
                                                <IconButton onClick={() => openDialog(user)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton onClick={() => handleDelete(user.id)} color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
        );
    };

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ width: '100%', p: 0, m: 0 }}>
            <PageTitle title="User Management" subtitle="Manage users, administrators, and teachers in your school." />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" component="div">
                                        {users.length}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Total Users
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AdminIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" component="div">
                                        {parents.length}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Parents
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TeacherIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" component="div">
                                        {teachers.length}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Teachers
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" component="div">
                                        {students.length}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Students
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="All Users" />
                    <Tab label="Parents" />
                    <Tab label="Teachers" />
                    <Tab label="Students" />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            {activeTab === 0 && renderUserTable(users, 'All Users')}
            {activeTab === 1 && renderUserTable(parents, 'Parents')}
            {activeTab === 2 && renderUserTable(teachers, 'Teachers')}
            {activeTab === 3 && renderUserTable(students, 'Students')}

            {/* User Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="First Name"
                        fullWidth
                        variant="outlined"
                        value={userForm.name}
                    onChange={(e) => {
                        setUserForm({ ...userForm, name: e.target.value });
                        setFormErrors({ ...formErrors, name: false });
                    }}
                    error={formErrors.name}
                    helperText={formErrors.name ? 'Name is required' : ''}
                    required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Last Name"
                        fullWidth
                        variant="outlined"
                        value={userForm.lastName}
                        onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={userForm.email}
                    onChange={(e) => {
                        setUserForm({ ...userForm, email: e.target.value });
                        setFormErrors({ ...formErrors, email: false });
                    }}
                    error={formErrors.email}
                    helperText={formErrors.email ? 'Please enter a valid email address' : ''}
                    required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Phone Number"
                        fullWidth
                        variant="outlined"
                        value={userForm.phoneNumber}
                    onChange={(e) => {
                        setUserForm({ ...userForm, phoneNumber: e.target.value });
                        setFormErrors({ ...formErrors, phoneNumber: false });
                    }}
                    error={formErrors.phoneNumber}
                    helperText={formErrors.phoneNumber ? 'Phone number is required' : ''}
                    required={userForm.role !== 'student'}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Role"
                        fullWidth
                        variant="outlined"
                        value={userForm.role}
                        onChange={(e) => {
                            setUserForm({ ...userForm, role: e.target.value });
                            setFormErrors({ ...formErrors, role: false });

                            const nextRole = (e.target.value || '').toString().toLowerCase();
                            if (nextRole !== 'parent') {
                                setSelectedStudents([]);
                                setStudentSearchInput('');
                                setStudentSearchOptions([]);
                            }
                        }}
                        error={formErrors.role}
                        helperText={editingUser ? 'Role cannot be changed after creation' : (formErrors.role ? 'Role is required' : '')}
                        required
                        disabled={!!editingUser} // Disable role field when editing
                        sx={{ mb: 2 }}
                    >
                        {roles.map((role) => (
                            <MenuItem key={role.value} value={role.value}>
                                {role.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {userForm.role === 'parent' && (
                        <Autocomplete
                            multiple
                            options={studentSearchOptions || []}
                            value={selectedStudents}
                            loading={studentSearchLoading}
                            inputValue={studentSearchInput}
                            onInputChange={(event, newInputValue) => {
                                setStudentSearchInput(newInputValue);
                            }}
                            onChange={(event, newValue) => {
                                setSelectedStudents(newValue || []);
                                setStudentSearchInput('');
                                setStudentSearchOptions([]);
                            }}
                            filterOptions={(x) => x}
                            isOptionEqualToValue={(option, value) => String(option?.id) === String(value?.id)}
                            getOptionLabel={(option) => {
                                const firstName = (option?.name ?? '').toString().trim();
                                const lastName = (option?.lastName ?? '').toString().trim();
                                const fullName = `${firstName} ${lastName}`.trim();

                                const username = (option?.username ?? '').toString().trim();
                                const baseLabel = fullName || username || (option?.id ? `Student #${option.id}` : 'Student');

                                const grade = option?.grade?.name || option?.grade || option?.gradeId;
                                const gradeLabel = grade ? ` • ${grade}` : '';

                                return `${baseLabel}${gradeLabel}`.trim();
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin="dense"
                                    label="Link Student(s)"
                                    placeholder="Search by username"
                                    variant="outlined"
                                    helperText="Type the student's exact username, select to link, then type another username to add more"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {studentSearchLoading ? <CircularProgress color="inherit" size={18} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        )
                                    }}
                                />
                            )}
                            sx={{ mb: 2 }}
                        />
                    )}
                    
                    {(userForm.role === 'teacher' || userForm.role === 'student') && (
                        <>
                            <TextField
                                select
                                margin="dense"
                                label="Subjects"
                                fullWidth
                                variant="outlined"
                                value={userForm.subjects}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const next = Array.isArray(raw) ? raw.map((v) => String(v)) : [];
                                    setUserForm({ ...userForm, subjects: next });
                                }}
                                SelectProps={{
                                    multiple: true,
                                }}
                                error={formErrors.subjects}
                                helperText={formErrors.subjects ? 'At least one subject is required for teachers' : ''}
                                sx={{ mb: 2 }}
                            >
                                {subjects.map((subject) => (
                                    <MenuItem key={subject.id} value={String(subject.id)}>
                                        {subject.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                margin="dense"
                                label="Grade"
                                fullWidth
                                variant="outlined"
                                value={userForm.grade}
                                onChange={(e) => setUserForm({ ...userForm, grade: String(e.target.value) })}
                                error={formErrors.grade}
                                helperText={formErrors.grade ? 'Grade is required' : ''}
                                sx={{ mb: 2 }}
                            >
                                {grades.map((grade) => {
                                    const gradeValue = String(grade.id);
                                    return (
                                            <MenuItem key={grade.id} value={gradeValue}>
                                                {grade.name}
                                            </MenuItem>
                                    );
                                })}
                            </TextField>
                        </>
                    )}

                    {userForm.role === 'student' && (
                        <>
                            <TextField
                            margin="dense"
                            label="Username"
                            fullWidth
                            variant="outlined"
                            value={userForm.username}
                            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                            error={formErrors.username}
                            helperText={formErrors.username ? 'Username is required for students' : ''}
                            sx={{ mb: 2 }}
                            />

                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Find Existing Parent/Guardian
                                </Typography>

                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            margin="dense"
                                            label="Parent/Guardian Phone Number"
                                            fullWidth
                                            variant="outlined"
                                            value={parentLookupPhone}
                                            onChange={(e) => {
                                                setParentLookupPhone(e.target.value);
                                                setParentLookupTried(false);
                                                setParentLookupResult(null);
                                                setFormErrors((prev) => ({ ...prev, parentPhoneNumber: false }));
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            onClick={handleFindParent}
                                            disabled={!normalizePhone(parentLookupPhone)}
                                        >
                                            Find Parent
                                        </Button>
                                    </Grid>
                                </Grid>

                                {parentLookupTried && parentLookupResult && (
                                    <Alert severity="success" sx={{ mt: 2 }}>
                                        Existing parent found: {(parentLookupResult?.name || '')} {(parentLookupResult?.lastName || '')}{parentLookupResult?.phoneNumber ? ` (${parentLookupResult.phoneNumber})` : ''}
                                    </Alert>
                                )}

                                {parentLookupTried && !parentLookupResult && (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        No existing parent found for that phone number. Please add a new parent/guardian below.
                                    </Alert>
                                )}

                                {(parentLookupTried || parentLookupPhone || newParents.length > 0) && (
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                        <Button size="small" onClick={clearParentLookup}>
                                            Clear
                                        </Button>
                                    </Box>
                                )}
                            </Box>

                            {newParents.length === 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
                                    <Button size="small" onClick={addNewParent} startIcon={<AddIcon />}>
                                        Add Parent/Guardian
                                    </Button>
                                </Box>
                            )}

                            {newParents.length > 0 && (
                                <>
                                    {newParents.map((p, index) => (
                                        <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle2">Parent/Guardian</Typography>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => removeNewParent(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </Box>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        margin="dense"
                                                        label="First Name"
                                                        fullWidth
                                                        variant="outlined"
                                                        value={p.name}
                                                        onChange={(e) => updateNewParent(index, 'name', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        margin="dense"
                                                        label="Last Name"
                                                        fullWidth
                                                        variant="outlined"
                                                        value={p.lastName}
                                                        onChange={(e) => updateNewParent(index, 'lastName', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        margin="dense"
                                                        label="Email"
                                                        fullWidth
                                                        variant="outlined"
                                                        value={p.email}
                                                        onChange={(e) => updateNewParent(index, 'email', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        margin="dense"
                                                        label="Phone Number"
                                                        fullWidth
                                                        variant="outlined"
                                                        value={p.phoneNumber}
                                                        onChange={(e) => updateNewParent(index, 'phoneNumber', e.target.value)}
                                                        error={formErrors.parentPhoneNumber}
                                                        helperText={formErrors.parentPhoneNumber ? 'Parent/guardian phone number is required for students' : ''}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ))}
                                </>
                            )}

                        </>
                        )}
                    
                    
                    {/* Password removed - users authenticate with OTP */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={bulkUploadDialogOpen} onClose={() => setBulkUploadDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Bulk Upload Users</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Upload a CSV file with user data. Download the template first to see the required format.
                    </Alert>

                    {bulkUploadErrors.length > 0 && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Upload Errors:</Typography>
                            <List dense>
                                {bulkUploadErrors.map((error, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={error} />
                                    </ListItem>
                                ))}
                            </List>
                        </Alert>
                    )}

                    {bulkUploadResults && (
                        <Alert severity={bulkUploadResults.success ? "success" : "warning"} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                {bulkUploadResults.success ? "Upload Successful" : "Upload Completed with Issues"}
                            </Typography>
                            <Typography>{bulkUploadResults.message}</Typography>
                            {bulkUploadResults.details && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2">
                                        Created: {bulkUploadResults.details.created || 0} |
                                        Updated: {bulkUploadResults.details.updated || 0} |
                                        Failed: {bulkUploadResults.details.failed || 0}
                                    </Typography>
                                </Box>
                            )}
                        </Alert>
                    )}

                    {bulkUploadLoading && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" gutterBottom>Processing upload...</Typography>
                            <LinearProgress variant="determinate" value={bulkUploadProgress} />
                        </Box>
                    )}

                    <Box sx={{ mb: 2 }}>
                        <input
                            accept=".csv"
                            style={{ display: 'none' }}
                            id="bulk-upload-file"
                            type="file"
                            onChange={handleBulkUploadFileChange}
                        />
                        <label htmlFor="bulk-upload-file">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<UploadFileIcon />}
                                disabled={bulkUploadLoading}
                                fullWidth
                            >
                                {bulkUploadFile ? bulkUploadFile.name : 'Select CSV File'}
                            </Button>
                        </label>
                    </Box>

                    {bulkUploadFile && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            File selected: {bulkUploadFile.name} ({(bulkUploadFile.size / 1024).toFixed(1)} KB)
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkUploadDialogOpen(false)} disabled={bulkUploadLoading}>
                        Close
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={downloadBulkUploadTemplate}
                        startIcon={<DownloadIcon />}
                        disabled={bulkUploadLoading}
                    >
                        Download Template
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleBulkUpload}
                        disabled={!bulkUploadFile || bulkUploadLoading}
                        startIcon={bulkUploadLoading ? <CircularProgress size={20} /> : <UploadFileIcon />}
                    >
                        {bulkUploadLoading ? 'Uploading...' : 'Upload Users'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;
