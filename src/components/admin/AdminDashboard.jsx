import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-375 mx-auto px-6 lg:px-10 pt-32 pb-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user?.name}!</h2>
        <p className="text-gray-600">
          Ekhane amra Sales Statistics, Order Management, ebong Product Add korar option gulo toiri korbo.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;