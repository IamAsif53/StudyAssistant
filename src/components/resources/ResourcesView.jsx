import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderOpen, FileText, Download, ExternalLink, Trash2, Plus,
  X, File, FileCode, Image, FileArchive, Search, Eye
} from 'lucide-react';

// Pre-populated sample resources if none exist
const INITIAL_RESOURCES = [
  {
    id: 'res-sample-1',
    title: 'Mathematics Calculus Formula Sheet',
    subjectName: 'Mathematics',
    fileName: 'calculus_formulas.pdf',
    fileSize: '1.2 MB',
    fileType: 'application/pdf',
    fileData: 'data:text/plain;charset=utf-8,Sample Calculus Formula Sheet Content',
    uploadDate: '2026-08-10'
  },
  {
    id: 'res-sample-2',
    title: 'Physics Mechanics Notes & Diagrams',
    subjectName: 'Physics',
    fileName: 'physics_mechanics.pdf',
    fileSize: '850 KB',
    fileType: 'application/pdf',
    fileData: 'data:text/plain;charset=utf-8,Sample Physics Mechanics Notes Content',
    uploadDate: '2026-08-11'
  }
];

export const ResourcesView = () => {
  const [resources, setResources] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_real_resources');
      return saved !== null ? JSON.parse(saved) : INITIAL_RESOURCES;
    } catch (e) {
      return INITIAL_RESOURCES;
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_real_resources', JSON.stringify(resources));
  }, [resources]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Upload Form Fields
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Helper to format file size cleanly
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper to choose file icon based on file type / extension
  const getFileIcon = (fileName = '', fileType = '') => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (fileType.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) {
      return <Image className="w-6 h-6 text-emerald-500" />;
    }
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'json', 'cpp', 'java'].includes(ext)) {
      return <FileCode className="w-6 h-6 text-purple-500" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <FileArchive className="w-6 h-6 text-amber-500" />;
    }
    if (fileType.includes('pdf') || ext === 'pdf') {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    return <File className="w-6 h-6 text-[#2563EB]" />;
  };

  // Handle File Upload Form Submission
  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedFile) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result; // Base64 Data URL

      const newResource = {
        id: `res-${Date.now()}`,
        title: title.trim(),
        subjectName: subjectName.trim() || 'General',
        fileName: selectedFile.name,
        fileSize: formatFileSize(selectedFile.size),
        fileType: selectedFile.type || 'application/octet-stream',
        fileData: fileData,
        uploadDate: new Date().toISOString().split('T')[0]
      };

      setResources(prev => [newResource, ...prev]);

      // Reset Form & Close Modal
      setTitle('');
      setSubjectName('');
      setSelectedFile(null);
      setIsUploading(false);
      setIsModalOpen(false);
    };

    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      setIsUploading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  // Open / View File in New Window/Tab
  const handleOpenFile = (resource) => {
    if (!resource.fileData) return;
    try {
      const win = window.open();
      if (win) {
        if (resource.fileType.includes('image')) {
          win.document.write(`<title>${resource.title}</title><img src="${resource.fileData}" style="max-width:100%;height:auto;margin:auto;display:block;" />`);
        } else if (resource.fileType.includes('pdf')) {
          win.document.write(`<title>${resource.title}</title><iframe src="${resource.fileData}" style="width:100%;height:100vh;border:none;"></iframe>`);
        } else {
          win.location.href = resource.fileData;
        }
      }
    } catch (e) {
      console.error(e);
      window.open(resource.fileData, '_blank');
    }
  };

  // Download File to Local Device
  const handleDownloadFile = (resource) => {
    if (!resource.fileData) return;
    const a = document.createElement('a');
    a.href = resource.fileData;
    a.download = resource.fileName || `${resource.title}.file`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Delete Resource Card
  const handleDeleteResource = (id) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  // Filtered resources list
  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(search.toLowerCase()) ||
                          res.subjectName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-16 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E5E7EB] dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Resources & Study Materials
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload, store, open, and download reference books, formula sheets, and study notes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" /> Upload Material
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-[#E5E7EB] dark:border-slate-800 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search uploaded files by title or subject..."
          className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Resources Container Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="saas-card p-12 text-center text-slate-400 space-y-3 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {search ? 'No resources match your search query.' : 'No study materials uploaded yet.'}
          </p>
          {!search && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#2563EB] text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Upload First Material
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-blue-200 dark:hover:border-blue-500/50 transition-all group"
            >
              {/* Card Top Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    {getFileIcon(res.fileName, res.fileType)}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-extrabold text-[10px] border border-blue-200 dark:border-blue-800/60">
                    {res.subjectName}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                    📄 {res.fileName}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                  <span>Size: <strong>{res.fileSize}</strong></span>
                  <span>Uploaded: <strong>{res.uploadDate}</strong></span>
                </div>
              </div>

              {/* Action Buttons: Open, Download, Delete */}
              <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB] dark:border-slate-800">
                
                {/* OPEN / PREVIEW BUTTON */}
                <button
                  onClick={() => handleOpenFile(res)}
                  className="flex-1 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  title="Open / View File"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open</span>
                </button>

                {/* DOWNLOAD BUTTON */}
                <button
                  onClick={() => handleDownloadFile(res)}
                  className="h-9 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  title="Download File Again"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                {/* DELETE BUTTON */}
                <button
                  onClick={() => handleDeleteResource(res.id)}
                  className="h-9 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
                  title="Delete Resource"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Upload File Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="saas-card w-[92vw] sm:w-full max-w-lg p-5 sm:p-6 bg-white dark:bg-slate-900 space-y-4 shadow-xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
              Upload Study Material
            </h3>

            <form onSubmit={handleFileUpload} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry Reactions PDF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chemistry, Mathematics..."
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Select File to Upload *
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium cursor-pointer"
                  required
                />
                {selectedFile && (
                  <p className="text-[11px] text-[#2563EB] font-bold mt-1.5">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-md cursor-pointer hover:bg-blue-700 disabled:opacity-50"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? 'Uploading...' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
