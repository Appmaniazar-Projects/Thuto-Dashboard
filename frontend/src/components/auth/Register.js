import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    lastname: '',
    phoneNumber: '',
    gender: '',
    role: '',
    department: '',
    mother: '',
    father: '',
    guardian: '',
    grade: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} />
      </div>
      <div>
        <label>Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} />
      </div>
      <div>
        <label>Last Name:</label>
        <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} />
      </div>
      <div>
        <label>Phone Number:</label>
        <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
      </div>
      <div>
        <label>Gender:</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label>Role:</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
          <option value="student">Student</option>
        </select>
      </div>
      {formData.role === 'teacher' && (
        <div>
          <label>Department:</label>
          <input type="text" name="department" value={formData.department} onChange={handleChange} />
        </div>
      )}
      {formData.role === 'parent' && (
        <div>
          <label>Mother:</label>
          <input type="text" name="mother" value={formData.mother} onChange={handleChange} />
          <label>Father:</label>
          <input type="text" name="father" value={formData.father} onChange={handleChange} />
          <label>Guardian:</label>
          <input type="text" name="guardian" value={formData.guardian} onChange={handleChange} />
        </div>
      )}
      {formData.role === 'student' && (
        <div>
          <label>Grade:</label>
          <input type="text" name="grade" value={formData.grade} onChange={handleChange} />
        </div>
      )}
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
