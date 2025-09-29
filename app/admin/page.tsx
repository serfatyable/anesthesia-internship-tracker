'use client';
import { useState } from 'react';

const navLinks = [
  { label: 'Overview', href: '/admin' },
  { label: 'Assignments', href: '/admin/assignments' },
  { label: 'Files', href: '/admin/files' },
  { label: 'Rotations', href: '/admin/rotations' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Monitoring', href: '/admin/monitoring' },
  { label: 'Pending Approvals', href: '/admin/pending-approvals' },
  { label: 'Settings', href: '/admin/settings' },
];

const rotations = [
  { id: 'rotation1', name: 'Cardiology', color: 'bg-red-200' },
  { id: 'rotation2', name: 'Surgery', color: 'bg-green-200' },
  { id: 'rotation3', name: 'Anesthesiology', color: 'bg-blue-200' },
  { id: 'rotation4', name: 'ICU', color: 'bg-yellow-200' },
];

const tutors = [
  { id: 'tutor1', name: 'Dr. Alice Smith', initials: 'AS' },
  { id: 'tutor2', name: 'Dr. Bob Lee', initials: 'BL' },
  { id: 'tutor3', name: 'Dr. Carol Kim', initials: 'CK' },
  { id: 'tutor4', name: 'Dr. David Wong', initials: 'DW' },
];

const interns = [
  {
    id: 'intern1',
    name: 'John Doe',
    initials: 'JD',
    rotationId: 'rotation1',
    tutorIds: ['tutor1', 'tutor2'],
  },
  {
    id: 'intern2',
    name: 'Jane Roe',
    initials: 'JR',
    rotationId: 'rotation2',
    tutorIds: ['tutor2'],
  },
  {
    id: 'intern3',
    name: 'Sam Patel',
    initials: 'SP',
    rotationId: 'rotation1',
    tutorIds: ['tutor3'],
  },
  {
    id: 'intern4',
    name: 'Maria Garcia',
    initials: 'MG',
    rotationId: 'rotation3',
    tutorIds: ['tutor1', 'tutor4'],
  },
  {
    id: 'intern5',
    name: 'Liam Chen',
    initials: 'LC',
    rotationId: 'rotation4',
    tutorIds: ['tutor4'],
  },
  {
    id: 'intern6',
    name: 'Olivia Brown',
    initials: 'OB',
    rotationId: 'rotation2',
    tutorIds: ['tutor3', 'tutor2'],
  },
];

function AssignModal({
  open,
  onClose,
  title,
  options,
  onAssign,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  options: Array<{ id: string; name: string }>;
  onAssign: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = options.filter((opt) => opt.name.toLowerCase().includes(search.toLowerCase()));
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className="max-h-40 overflow-y-auto">
          {filtered.map((opt) => (
            <li key={opt.id}>
              <button
                className="w-full text-left px-2 py-1 rounded hover:bg-blue-100"
                onClick={() => {
                  onAssign(opt.id);
                  onClose();
                }}
              >
                {opt.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-zinc-200 hover:bg-zinc-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [internList, setInternList] = useState<
    Array<{
      id: string;
      name: string;
      initials: string;
      rotationId: string | null;
      tutorIds: string[];
    }>
  >(interns);
  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    type: string;
    targetId: string | null;
  }>({ open: false, type: '', targetId: null });

  // Assign tutor to intern
  const handleAssignTutor = (tutorId: string, intern: { id: string; tutorIds: string[] }) => {
    setInternList((prev) =>
      prev.map((i) =>
        i.id === intern.id && !i.tutorIds.includes(tutorId)
          ? { ...i, tutorIds: [...i.tutorIds, tutorId] }
          : i,
      ),
    );
  };
  // Assign intern to rotation
  const handleAssignRotation = (internId: string, rotation: { id: string }) => {
    setInternList((prev) =>
      prev.map((i) => (i.id === internId ? { ...i, rotationId: rotation.id } : i)),
    );
  };
  // Remove tutor from intern
  const removeTutor = (internId: string, tutorId: string) => {
    setInternList((prev) =>
      prev.map((i) =>
        i.id === internId ? { ...i, tutorIds: i.tutorIds.filter((tid) => tid !== tutorId) } : i,
      ),
    );
  };
  // Remove intern from rotation
  const removeInternFromRotation = (internId: string) => {
    setInternList((prev) => prev.map((i) => (i.id === internId ? { ...i, rotationId: null } : i)));
  };
  // Remove intern from system (pool)
  const removeInternFromSystem = (internId: string) => {
    setInternList((prev) => prev.filter((i) => i.id !== internId));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-200 bg-white border-r border-zinc-200/60 ${collapsed ? 'w-16' : 'w-56'} flex flex-col`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b">
          <span
            className={`font-bold text-blue-700 text-lg transition-all duration-200 ${collapsed ? 'hidden' : 'block'}`}
          >
            Admin
          </span>
          <button
            className="p-1 rounded hover:bg-zinc-100"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-zinc-600"
            >
              {collapsed ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              )}
            </svg>
          </button>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded transition-colors hover:bg-blue-50 text-zinc-700 ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="inline-block w-5 h-5 bg-blue-100 rounded-full" />
                  {!collapsed && <span>{link.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>
        {/* Tutor panel */}
        <div className="flex gap-3 mb-6">
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-green-200 font-bold text-green-800 text-lg cursor-pointer shadow"
              title={tutor.name}
              onClick={() => setAssignModal({ open: true, type: 'tutor', targetId: tutor.id })}
            >
              {tutor.initials}
            </div>
          ))}
        </div>
        {/* Unassigned Interns Pool */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Unassigned Interns</h2>
          <div className="flex gap-3 flex-wrap">
            {internList
              .filter((i) => !i.rotationId)
              .map((intern) => (
                <div
                  key={intern.id}
                  className="relative flex flex-col items-center bg-zinc-100 rounded-lg p-3 shadow w-24 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                  onClick={(e) => {
                    // Only open modal if not clicking the x
                    if ((e.target as HTMLElement).closest('.remove-intern-x')) return;
                    setAssignModal({ open: true, type: 'intern', targetId: intern.id });
                  }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-200 font-bold text-blue-800 mb-1">
                    {intern.initials}
                  </div>
                  <div className="text-xs text-zinc-700 text-center mb-1">{intern.name}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeInternFromSystem(intern.id);
                    }}
                    className="remove-intern-x absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center hover:bg-red-700"
                    style={{ lineHeight: 1 }}
                    title="Remove intern"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
        {/* Kanban board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rotations.map((rotation) => (
            <div key={rotation.id} className={`flex-1 min-w-[260px] max-w-xs transition-all`}>
              <div
                className={`rounded-t-lg px-4 py-2 font-semibold text-zinc-700 ${rotation.color}`}
              >
                {rotation.name}
              </div>
              <div className="bg-white border border-t-0 rounded-b-lg min-h-[300px] p-2 flex flex-col gap-3">
                {internList
                  .filter((i) => i.rotationId === rotation.id)
                  .map((intern) => (
                    <div
                      key={intern.id}
                      className="flex items-center gap-3 bg-zinc-50 rounded p-2 shadow-sm transition-all cursor-pointer hover:ring-2 hover:ring-blue-400"
                      onClick={(e) => {
                        // Only open modal if not clicking the x
                        if ((e.target as HTMLElement).closest('.remove-intern-x')) return;
                        setAssignModal({ open: true, type: 'intern', targetId: intern.id });
                      }}
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-200 font-bold text-blue-800">
                        {intern.initials}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-zinc-800">{intern.name}</div>
                        <div className="flex gap-1 mt-1">
                          {intern.tutorIds.map((tid) => {
                            const tutor = tutors.find((t) => t.id === tid);
                            return tutor ? (
                              <span
                                key={tid}
                                className="relative inline-block w-6 h-6 rounded-full bg-green-200 text-green-800 text-xs font-bold flex items-center justify-center"
                                title={tutor.name}
                              >
                                {tutor.initials}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTutor(intern.id, tid);
                                  }}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center hover:bg-red-700"
                                  style={{ lineHeight: 1 }}
                                  title="Remove tutor"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeInternFromRotation(intern.id);
                        }}
                        className="remove-intern-x ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-700"
                        style={{ lineHeight: 1 }}
                        title="Remove from rotation"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        {/* Assign Modal */}
        <AssignModal
          open={assignModal.open}
          onClose={() => setAssignModal({ open: false, type: '', targetId: null })}
          title={
            assignModal.type === 'tutor'
              ? 'Assign to Intern'
              : assignModal.type === 'intern'
                ? 'Assign to Rotation'
                : ''
          }
          options={
            assignModal.type === 'tutor'
              ? internList
              : assignModal.type === 'intern'
                ? rotations
                : []
          }
          onAssign={
            assignModal.type === 'tutor'
              ? (tutorId) =>
                  assignModal.targetId &&
                  handleAssignTutor(tutorId, { id: assignModal.targetId, tutorIds: [] })
              : assignModal.type === 'intern'
                ? (rotationId) =>
                    assignModal.targetId &&
                    handleAssignRotation(assignModal.targetId, { id: rotationId })
                : () => {}
          }
        />
      </main>
    </div>
  );
}
