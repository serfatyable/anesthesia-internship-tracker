'use client';

import { useState } from 'react';

interface AnalyticsData {
  stats: {
    totalUsers: number;
    totalRotations: number;
    totalProcedures: number;
    totalRequirements: number;
    totalLogs: number;
    pendingVerifications: number;
    activeRotations: number;
  };
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

interface AnalyticsProps {
  data: AnalyticsData;
}

type TimeRange = '7d' | '30d' | '90d' | '1y';

export function Analytics({ data }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('logs');

  const timeRanges = [
    { id: '7d' as const, label: 'Last 7 days' },
    { id: '30d' as const, label: 'Last 30 days' },
    { id: '90d' as const, label: 'Last 90 days' },
    { id: '1y' as const, label: 'Last year' },
  ];

  const metrics = [
    { id: 'logs', label: 'Log Entries', value: data.stats.totalLogs },
    { id: 'users', label: 'Active Users', value: data.stats.totalUsers },
    { id: 'verifications', label: 'Pending Verifications', value: data.stats.pendingVerifications },
    { id: 'procedures', label: 'Procedures', value: data.stats.totalProcedures },
  ];

  // Mock data for charts - in a real app, this would come from the API
  const mockChartData = {
    logs: [12, 19, 3, 5, 2, 3, 8, 15, 22, 18, 25, 30],
    users: [5, 7, 8, 9, 10, 12, 15, 18, 20, 22, 25, 28],
    verifications: [8, 12, 6, 9, 15, 18, 22, 25, 20, 16, 12, 8],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>
          <p className="text-gray-600">System performance and usage metrics</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {timeRanges.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={`bg-white p-6 rounded-lg shadow border cursor-pointer transition-colors ${
              selectedMetric === metric.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedMetric(metric.id)}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {metrics.find(m => m.id === selectedMetric)?.label} Over Time
        </h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {mockChartData[selectedMetric as keyof typeof mockChartData]?.map((value, index) => (
            <div
              key={index}
              className="bg-blue-500 rounded-t flex-1 flex items-end justify-center"
              style={{ height: `${(value / Math.max(...mockChartData[selectedMetric as keyof typeof mockChartData])) * 100}%` }}
            >
              <span className="text-xs text-white font-medium mb-1">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-500 text-center">
          Data for {timeRanges.find(r => r.id === timeRange)?.label.toLowerCase()}
        </div>
      </div>

      {/* User Activity Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">User Activity Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logs Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verifications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'TUTOR' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user._count.logs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user._count.verifications}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {data.recentActivity.slice(0, 5).map((activity) => (
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}