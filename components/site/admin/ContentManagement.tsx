'use client';

import { useState } from 'react';

interface ContentData {
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
}

interface ContentManagementProps {
  data: ContentData;
}

type ContentTab = 'rotations' | 'procedures' | 'requirements';

export function ContentManagement({ data }: ContentManagementProps) {
  const [activeTab, setActiveTab] = useState<ContentTab>('rotations');

  const tabs = [
    { id: 'rotations' as const, label: 'Rotations', count: data.rotations.length },
    { id: 'procedures' as const, label: 'Procedures', count: data.procedures.length },
    { id: 'requirements' as const, label: 'Requirements', count: data.requirements.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Content Management</h2>
          <p className="text-gray-600">Manage rotations, procedures, and requirements</p>
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
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'rotations' && <RotationsTab rotations={data.rotations} />}
        {activeTab === 'procedures' && <ProceduresTab procedures={data.procedures} />}
        {activeTab === 'requirements' && <RequirementsTab requirements={data.requirements} />}
      </div>
    </div>
  );
}

function RotationsTab({ rotations }: { rotations: ContentData['rotations'] }) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Rotations</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Add Rotation
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rotations.map((rotation) => (
          <div key={rotation.id} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{rotation.name}</h4>
                <p className="text-gray-600 mt-1">{rotation.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">{rotation._count.procedures}</span>
                    <span className="ml-1">procedures</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">{rotation._count.requirements}</span>
                    <span className="ml-1">requirements</span>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    rotation.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {rotation.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                Edit
              </button>
              <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && <AddRotationModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function ProceduresTab({ procedures }: { procedures: ContentData['procedures'] }) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Procedures</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Add Procedure
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Procedure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rotation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {procedures.map((procedure) => (
              <tr key={procedure.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{procedure.name}</div>
                    {procedure.description && (
                      <div className="text-sm text-gray-500">{procedure.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {procedure.rotation.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    <div>{procedure._count.logs} logs</div>
                    <div>{procedure._count.requirements} requirements</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && <AddProcedureModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function RequirementsTab({ requirements }: { requirements: ContentData['requirements'] }) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Requirements</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Add Requirement
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Procedure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rotation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Training Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requirements.map((requirement) => (
              <tr key={requirement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {requirement.procedure.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {requirement.rotation.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {requirement.minCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {requirement.trainingLevel || 'Any'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && <AddRequirementModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

// Placeholder modal components - these would be implemented with proper forms
function AddRotationModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Rotation</h3>
          <p className="text-gray-600">This feature will be implemented in the next iteration.</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddProcedureModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Procedure</h3>
          <p className="text-gray-600">This feature will be implemented in the next iteration.</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddRequirementModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Requirement</h3>
          <p className="text-gray-600">This feature will be implemented in the next iteration.</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
