
import React from 'react';

interface AdminDashboardProps {
  userRole: string;
}

const AdminDashboard = ({ userRole }: AdminDashboardProps) => {
  if (userRole === 'admin') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-blue-900 mb-2">Admin Dashboard</h2>
        <p className="text-blue-700">
          Manage user data, review requests, and oversee safety operations.
        </p>
      </div>
    );
  }

  if (userRole === 'govt_admin') {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-purple-900 mb-2">Government Admin Dashboard</h2>
        <p className="text-purple-700">
          Review government requests, manage safe zones, and oversee incident reports.
        </p>
      </div>
    );
  }

  return null;
};

export default AdminDashboard;
