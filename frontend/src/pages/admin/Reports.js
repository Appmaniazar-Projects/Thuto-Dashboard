import React from 'react';

const Reports = () => {
  return (
    <div>
      <h1>Admin Reports Page</h1>
      <p>Welcome to the admin reports section. Here you can find various reports related to the system.</p>
      <button onClick={() => alert('Report downloaded!')}>Download Report</button>
    </div>
  );
};

export default Reports;
