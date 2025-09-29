'use client';
import { useState } from 'react';

// Mock data for folders and files
const initialData = [
  {
    id: 'rotation1',
    name: 'Cardiology',
    folders: [
      {
        id: 'syllabus1',
        name: 'Syllabus',
        files: [{ id: 'file1', name: 'Cardiology Syllabus.pdf', type: 'pdf' }],
      },
      {
        id: 'refs1',
        name: 'Reference Materials',
        files: [
          { id: 'file2', name: 'Heart Anatomy.png', type: 'image' },
          { id: 'file3', name: 'Cardiac Drugs.docx', type: 'word' },
        ],
      },
      {
        id: 'assign1',
        name: 'Assignments',
        files: [{ id: 'file4', name: 'Assignment 1.xlsx', type: 'excel' }],
      },
      {
        id: 'misc1',
        name: 'Miscellaneous',
        files: [],
      },
    ],
  },
  {
    id: 'rotation2',
    name: 'Surgery',
    folders: [
      {
        id: 'syllabus2',
        name: 'Syllabus',
        files: [{ id: 'file5', name: 'Surgery Syllabus.pdf', type: 'pdf' }],
      },
      {
        id: 'refs2',
        name: 'Reference Materials',
        files: [{ id: 'file6', name: 'Surgical Tools.jpg', type: 'image' }],
      },
      {
        id: 'assign2',
        name: 'Assignments',
        files: [],
      },
      {
        id: 'misc2',
        name: 'Miscellaneous',
        files: [],
      },
    ],
  },
];

const fileIcons = {
  pdf: '📄',
  word: '📝',
  excel: '📊',
  image: '🖼️',
  default: '📁',
};

export default function FileExplorer() {
  const [data, setData] = useState(initialData);
  const [selectedFolder, setSelectedFolder] = useState({
    rotationId: data[0]?.id || '',
    folderId: data[0]?.folders[0]?.id || '',
  });
  const [previewFile, setPreviewFile] = useState<{ id: string; name: string; type: string } | null>(
    null,
  );

  // Find selected folder
  const rotation = data.find((r) => r.id === selectedFolder.rotationId);
  const folder = rotation?.folders.find((f) => f.id === selectedFolder.folderId);

  // Simulate upload
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length || !rotation || !folder) return;
    setData((prev) =>
      prev.map((r) =>
        r.id === rotation.id
          ? {
              ...r,
              folders: r.folders.map((f) =>
                f.id === folder.id
                  ? {
                      ...f,
                      files: [
                        ...f.files,
                        ...files.map((file, idx) => ({
                          id: `file${Date.now()}${idx}`,
                          name: file.name,
                          type: getFileType(file.name),
                        })),
                      ],
                    }
                  : f,
              ),
            }
          : r,
      ),
    );
  };

  // Simulate delete
  const handleDelete = (fileId: string) => {
    if (!rotation || !folder) return;
    setData((prev) =>
      prev.map((r) =>
        r.id === rotation.id
          ? {
              ...r,
              folders: r.folders.map((f) =>
                f.id === folder.id
                  ? {
                      ...f,
                      files: f.files.filter((file) => file.id !== fileId),
                    }
                  : f,
              ),
            }
          : r,
      ),
    );
  };

  // Simulate download
  const handleDownload = (file: { name: string }) => {
    alert(`Simulated download: ${file.name}`);
  };

  // File type helper
  function getFileType(name: string) {
    if (name.endsWith('.pdf')) return 'pdf';
    if (name.endsWith('.docx') || name.endsWith('.doc')) return 'word';
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'excel';
    if (name.match(/\.(jpg|jpeg|png|gif)$/i)) return 'image';
    return 'default';
  }

  return (
    <div className="flex gap-6">
      {/* Tree view */}
      <nav className="w-64 min-w-[180px] border-r pr-4">
        <ul>
          {data.map((rot) => (
            <li key={rot.id}>
              <button
                className={`font-bold text-blue-700 py-1 ${selectedFolder.rotationId === rot.id ? 'underline' : ''}`}
                onClick={() =>
                  setSelectedFolder({ rotationId: rot.id, folderId: rot.folders[0]?.id || '' })
                }
              >
                {rot.name}
              </button>
              <ul className="ml-4">
                {rot.folders.map((f) => (
                  <li key={f.id}>
                    <button
                      className={`text-zinc-700 py-0.5 ${selectedFolder.folderId === f.id && selectedFolder.rotationId === rot.id ? 'font-semibold underline' : ''}`}
                      onClick={() => setSelectedFolder({ rotationId: rot.id, folderId: f.id })}
                    >
                      {f.name}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
      {/* File list and actions */}
      <section className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {rotation?.name} / {folder?.name}
          </h2>
          <label className="inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Upload
            <input type="file" multiple className="hidden" onChange={handleUpload} />
          </label>
        </div>
        <div className="border rounded-lg bg-zinc-50 p-4 min-h-[200px]">
          {folder?.files.length ? (
            <ul className="divide-y">
              {folder.files.map((file) => (
                <li key={file.id} className="flex items-center gap-3 py-2">
                  <span className="text-2xl">
                    {fileIcons[file.type as keyof typeof fileIcons] || fileIcons.default}
                  </span>
                  <span
                    className="flex-1 cursor-pointer hover:underline"
                    onClick={() => setPreviewFile(file)}
                  >
                    {file.name}
                  </span>
                  <button
                    onClick={() => handleDownload(file)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-zinc-400">No files in this folder.</div>
          )}
        </div>
        {/* File preview modal (mocked) */}
        {previewFile && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-lg relative">
              <button
                onClick={() => setPreviewFile(null)}
                className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-800"
              >
                ×
              </button>
              <h3 className="font-bold mb-2">Preview: {previewFile.name}</h3>
              {previewFile.type === 'image' ? (
                <div className="flex items-center justify-center">
                  <span className="text-6xl">🖼️</span>
                </div>
              ) : previewFile.type === 'pdf' ? (
                <div className="flex items-center justify-center">
                  <span className="text-6xl">📄</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="text-6xl">
                    {fileIcons[previewFile.type as keyof typeof fileIcons] || fileIcons.default}
                  </span>
                </div>
              )}
              <div className="mt-4 text-zinc-500 text-sm">(Preview is simulated for demo)</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
