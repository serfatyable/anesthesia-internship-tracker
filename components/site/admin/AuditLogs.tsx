'use client';

import { useState, useEffect, useCallback } from 'react';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  timestamp: Date;
  actor: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    entity: '',
    entityId: '',
    action: '',
  });

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter.entity) params.append('entity', filter.entity);
      if (filter.entityId) params.append('entityId', filter.entityId);
      params.append('limit', '100');

      const response = await fetch(`/api/audit?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load audit logs');
      }

      const data = await response.json();
      setAuditLogs(data.auditLogs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filter.entity, filter.entityId]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const getActionColor = (action: string) => {
    if (action.includes('CREATED')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATED')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETED')) return 'bg-red-100 text-red-800';
    if (action.includes('APPROVED')) return 'bg-green-100 text-green-800';
    if (action.includes('REJECTED')) return 'bg-red-100 text-red-800';
    if (action.includes('NEEDS_REVISION')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Audit Logs</h2>
          <p className="text-gray-600">Track all critical system actions and changes</p>
        </div>
        <button
          onClick={loadAuditLogs}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
            <select
              value={filter.entity}
              onChange={(e) => setFilter({ ...filter, entity: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Entities</option>
              <option value="LogEntry">Log Entries</option>
              <option value="User">Users</option>
              <option value="Requirement">Requirements</option>
              <option value="Rotation">Rotations</option>
              <option value="Procedure">Procedures</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity ID</label>
            <input
              type="text"
              value={filter.entityId}
              onChange={(e) => setFilter({ ...filter, entityId: e.target.value })}
              placeholder="Enter entity ID..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="LOG_CREATED">Log Created</option>
              <option value="VERIFICATION_APPROVED">Verification Approved</option>
              <option value="VERIFICATION_REJECTED">Verification Rejected</option>
              <option value="VERIFICATION_NEEDS_REVISION">Needs Revision</option>
              <option value="USER_CREATED">User Created</option>
              <option value="USER_UPDATED">User Updated</option>
              <option value="ROLE_CHANGED">Role Changed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Activity ({auditLogs.length} logs)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {log.actor.name?.charAt(0) || log.actor.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {log.actor.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">{log.actor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}
                    >
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{log.entity}</div>
                      <div className="text-xs text-gray-400">{log.entityId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {auditLogs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No audit logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}
