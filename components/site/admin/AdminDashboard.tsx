'use client';

import { useState } from 'react';
import { CardTile } from '@/components/site/CardTile';
import { UserManagement } from './UserManagement';
import { ContentManagement } from './ContentManagement';
import { Analytics } from './Analytics';
import { SystemSettings } from './SystemSettings';

interface AdminData {
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
    _count: {
      logs: number;
      verifications: number;
    };
  }>;
  rotations: Array<{
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    _count: {
      procedures: number;
      requirements: number;
    };
  }>;
  procedures: Array<{
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    rotation: {
      name: string;
    };
    _count: {
      logs: number;
      requirements: number;
    };
  }>;
  requirements: Array<{
    id: string;
    minCount: number;
    trainingLevel: string | null;
    rotation: {
      name: string;
    };
    procedure: {
      name: string;
    };
  }>;
  stats: {
    totalUsers: number;
    totalRotations: number;
    totalProcedures: number;
    totalRequirements: number;
    totalLogs: number;
    pendingVerifications: number;
    activeRotations: number;
  };
  recentActivity: Array<{
    id: string;
    date: Date;
    count: number;
    notes: string | null;
    createdAt: Date;
    intern: {
      name: string | null;
      email: string;
    };
    procedure: {
      name: string;
    };
    verification: {
      status: string;
    } | null;
  }>;
}

interface AdminDashboardProps {
  data: AdminData;
}

type AdminTab = 'overview' | 'users' | 'content' | 'analytics' | 'settings';

export function AdminDashboard({ data }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'users' as const, label: 'Users', icon: '👥' },
    { id: 'content' as const, label: 'Content', icon: '📚' },
    { id: 'analytics' as const, label: 'Analytics', icon: '📈' },
    { id: 'settings' as const, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, content, and system settings</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'users' && <UserManagement users={data.users} />}
        {activeTab === 'content' && <ContentManagement data={data} />}
        {activeTab === 'analytics' && <Analytics data={data} />}
        {activeTab === 'settings' && <SystemSettings />}
      </div>
    </div>
  );
}

function OverviewTab({ data }: { data: AdminData }) {
  const { stats, recentActivity } = data;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalLogs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingVerifications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Rotations</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeRotations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardTile
            title="Add User"
            href="#"
            desc="Create new user account"
            onClick={() => {/* TODO: Implement add user modal */}}
          />
          <CardTile
            title="Create Rotation"
            href="#"
            desc="Add new rotation"
            onClick={() => {/* TODO: Implement add rotation modal */}}
          />
          <CardTile
            title="Add Procedure"
            href="#"
            desc="Create new procedure"
            onClick={() => {/* TODO: Implement add procedure modal */}}
          />
          <CardTile
            title="Export Data"
            href="/api/export/logs"
            desc="Download system data"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Latest Log Entries</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {activity.intern.name?.charAt(0) || activity.intern.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.intern.name || activity.intern.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        Logged {activity.count} {activity.procedure.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.verification?.status === 'APPROVED' 
                        ? 'bg-green-100 text-green-800'
                        : activity.verification?.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.verification?.status || 'PENDING'}
                    </span>
                  </div>
                </div>
                {activity.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="italic">"{activity.notes}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}