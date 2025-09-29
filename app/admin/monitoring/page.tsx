// app/admin/monitoring/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
// import { monitoring } from '@/lib/monitoring';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: number;
  uptime: number;
  version: string;
  checks: Array<{
    name: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    message?: string;
    details?: Record<string, any>;
  }>;
  system: {
    nodeVersion: string;
    platform: string;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
  database?: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime?: number;
    error?: string;
  };
}

interface ErrorStats {
  total: number;
  resolved: number;
  unresolved: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  recent: number;
}

interface AnalyticsSummary {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  eventsByType: Record<string, number>;
  topPages: Array<{ page: string; views: number }>;
  topActions: Array<{ action: string; count: number }>;
  errorRate: number;
  avgResponseTime: number;
}

export default function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
  const [analyticsSummary, setAnalyticsSummary] =
    useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [healthRes, errorsRes, analyticsRes] = await Promise.all([
        fetch('/api/monitoring/health'),
        fetch('/api/monitoring/metrics?type=errors'),
        fetch('/api/monitoring/metrics?type=analytics'),
      ]);

      if (!healthRes.ok || !errorsRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch monitoring data');
      }

      const healthData = await healthRes.json();
      const errorsData = await errorsRes.json();
      const analyticsData = await analyticsRes.json();

      setHealthStatus(healthData);
      setErrorStats(errorsData.data.stats);
      setAnalyticsSummary(analyticsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-600 text-6xl mb-4'>⚠️</div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>
            Monitoring Error
          </h1>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={fetchData}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            System Monitoring
          </h1>
          <p className='mt-2 text-gray-600'>
            Real-time system health and performance metrics
          </p>
        </div>

        {/* Health Status */}
        {healthStatus && (
          <div className='mb-8'>
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  System Health
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthStatus.status)}`}
                >
                  {healthStatus.status.toUpperCase()}
                </span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Uptime
                  </h3>
                  <p className='text-2xl font-bold text-gray-900'>
                    {formatUptime(healthStatus.uptime)}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Version
                  </h3>
                  <p className='text-2xl font-bold text-gray-900'>
                    {healthStatus.version}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Platform
                  </h3>
                  <p className='text-2xl font-bold text-gray-900'>
                    {healthStatus.system.platform}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Memory Usage
                  </h3>
                  <div className='flex items-center'>
                    <div className='flex-1 bg-gray-200 rounded-full h-2 mr-3'>
                      <div
                        className='bg-blue-600 h-2 rounded-full'
                        style={{
                          width: `${healthStatus.system.memory.percentage}%`,
                        }}
                      ></div>
                    </div>
                    <span className='text-sm text-gray-600'>
                      {formatBytes(healthStatus.system.memory.used)} /{' '}
                      {formatBytes(healthStatus.system.memory.total)}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Database Status
                  </h3>
                  <div className='flex items-center'>
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        healthStatus.database?.status === 'connected'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></span>
                    <span className='text-sm text-gray-600'>
                      {healthStatus.database?.status || 'Unknown'}
                      {healthStatus.database?.responseTime &&
                        ` (${healthStatus.database.responseTime}ms)`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Checks */}
              <div className='mt-6'>
                <h3 className='text-sm font-medium text-gray-500 mb-3'>
                  Health Checks
                </h3>
                <div className='space-y-2'>
                  {healthStatus.checks.map((check, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-md'
                    >
                      <div>
                        <span className='font-medium text-gray-900'>
                          {check.name}
                        </span>
                        {check.message && (
                          <p className='text-sm text-gray-600'>
                            {check.message}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(check.status)}`}
                      >
                        {check.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Statistics */}
        {errorStats && (
          <div className='mb-8'>
            <div className='bg-white rounded-lg shadow p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Error Statistics
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Total Errors
                  </h3>
                  <p className='text-2xl font-bold text-gray-900'>
                    {errorStats.total}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Resolved
                  </h3>
                  <p className='text-2xl font-bold text-green-600'>
                    {errorStats.resolved}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Unresolved
                  </h3>
                  <p className='text-2xl font-bold text-red-600'>
                    {errorStats.unresolved}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Recent (1h)
                  </h3>
                  <p className='text-2xl font-bold text-orange-600'>
                    {errorStats.recent}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-3'>
                    By Severity
                  </h3>
                  <div className='space-y-2'>
                    {Object.entries(errorStats.bySeverity).map(
                      ([severity, count]) => (
                        <div
                          key={severity}
                          className='flex items-center justify-between'
                        >
                          <span className='capitalize text-gray-700'>
                            {severity}
                          </span>
                          <span className='font-medium text-gray-900'>
                            {count}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-3'>
                    By Type
                  </h3>
                  <div className='space-y-2'>
                    {Object.entries(errorStats.byType)
                      .slice(0, 5)
                      .map(([type, count]) => (
                        <div
                          key={type}
                          className='flex items-center justify-between'
                        >
                          <span className='text-gray-700'>{type}</span>
                          <span className='font-medium text-gray-900'>
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Summary */}
        {analyticsSummary && (
          <div className='mb-8'>
            <div className='bg-white rounded-lg shadow p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Analytics Summary (24h)
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Total Events
                  </h3>
                  <p className='text-2xl font-bold text-gray-900'>
                    {analyticsSummary.totalEvents}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Unique Users
                  </h3>
                  <p className='text-2xl font-bold text-blue-600'>
                    {analyticsSummary.uniqueUsers}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Unique Sessions
                  </h3>
                  <p className='text-2xl font-bold text-green-600'>
                    {analyticsSummary.uniqueSessions}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-2'>
                    Error Rate
                  </h3>
                  <p className='text-2xl font-bold text-red-600'>
                    {analyticsSummary.errorRate.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-3'>
                    Top Pages
                  </h3>
                  <div className='space-y-2'>
                    {analyticsSummary.topPages
                      .slice(0, 5)
                      .map((page, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between'
                        >
                          <span className='text-gray-700'>{page.page}</span>
                          <span className='font-medium text-gray-900'>
                            {page.views} views
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className='text-sm font-medium text-gray-500 mb-3'>
                    Top Actions
                  </h3>
                  <div className='space-y-2'>
                    {analyticsSummary.topActions
                      .slice(0, 5)
                      .map((action, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between'
                        >
                          <span className='text-gray-700'>{action.action}</span>
                          <span className='font-medium text-gray-900'>
                            {action.count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className='text-center'>
          <button
            onClick={fetchData}
            className='px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
