import { useState } from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminCourseManagement from '../components/admin/AdminCourseManagement';
import useAuthStore from '../store/authStore';

export default function Admin() {
  const { isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'All Games', component: AdminDashboard },
    { id: 'courses', name: 'Course Management', component: AdminCourseManagement },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdminDashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <ActiveComponent />
    </div>
  );
}
