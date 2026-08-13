import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderOpen, FileText, Download, ExternalLink, Trash2, Plus,
  X, File, FileCode, Image, FileArchive, Search, Eye, Maximize2, Check, Sparkles
} from 'lucide-react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';

// Helper to extract clean file extension (PDF, JPG, PNG, TXT, DOCX, etc.)
const getFileExt = (fileName = '', fileType = '') => {
  if (fileName && fileName.includes('.')) {
    const ext = fileName.split('.').pop().trim().toUpperCase();
    if (ext && ext.length <= 5) return ext;
  }
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'JPG';
  if (fileType.includes('png')) return 'PNG';
  if (fileType.includes('gif')) return 'GIF';
  if (fileType.includes('html')) return 'HTML';
  if (fileType.includes('text') || fileType.includes('plain')) return 'TXT';
  if (fileType.includes('word') || fileType.includes('document')) return 'DOCX';
  if (fileType.includes('zip') || fileType.includes('rar')) return 'ZIP';
  return 'FILE';
};

// Sample HTML / Document Data Generator
const createSampleDocData = (title, content) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; line-height: 1.6; color: #1e293b; background: #f8fafc; }
        .card { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        h1 { color: #2563eb; font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0; }
        .badge { background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; display: inline-block; margin-bottom: 12px; }
        pre { background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 13px; white-space: pre-wrap; word-break: break-word; color: #0f172a; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">Study Material Document</span>
        <h1>${title}</h1>
        <pre>${content}</pre>
        <p style="text-align:center; color:#94a3b8; font-size:12px; margin-top:30px;">Smart Study Planner - Academic Resource Document</p>
      </div>
    </body>
    </html>
  `;
  return `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
};

const INITIAL_RESOURCES = [
  {
    id: 'res-sample-1',
    title: 'Right Form of Verbs Board Rules & Exercises',
    subjectName: 'English',
    fileName: 'RightFormOfVerbsFinalRules.PDF',
    fileSize: '199.5 KB',
    fileType: 'application/pdf',
    fileData: createSampleDocData(
      'Right Form of Verbs Board Rules & Exercises',
      `RIGHT FORM OF VERBS - MASTER RULES:

1. SUBJECT-VERB AGREEMENT:
- Singular Subject -> Singular Verb (e.g. "He reads every day.")
- Plural Subject -> Plural Verb (e.g. "They study for exams.")
- Words joined by 'and' take plural verbs: "Rahim and Karim are study partners."

2. TENSE RULES:
- If sentence contains 'yesterday', 'ago', 'last night', 'in 1971' -> Use Past Indefinite (e.g. "He went home yesterday.")
- If sentence contains 'just', 'already', 'yet', 'recently' -> Use Present Perfect (e.g. "She has just finished her homework.")
- If sentence contains 'now', 'at this moment' -> Use Present Continuous (e.g. "They are reading now.")

3. PREPOSITION & MODAL RULES:
- Prepositions (of, for, in, with, without) are followed by Verb+ing: "He is fond of reading books."
- Modal Auxiliaries (can, could, may, might, shall, should, will, would, must) take base form of verb: "You must work hard."`
    ),
    uploadDate: '2026-08-13'
  },
  {
    id: 'res-sample-2',
    title: 'Mathematics Calculus Formula Sheet',
    subjectName: 'Mathematics',
    fileName: 'Calculus_Formulas_Master.pdf',
    fileSize: '1.2 MB',
    fileType: 'application/pdf',
    fileData: createSampleDocData(
      'Mathematics Calculus Formula Sheet',
      `DIFFERENTIATION FORMULAS:
1. d/dx(x^n) = n * x^(n-1)
2. d/dx(sin x) = cos x
3. d/dx(cos x) = -sin x
4. d/dx(e^x) = e^x
5. d/dx(ln x) = 1/x

INTEGRATION FORMULAS:
1. ∫ x^n dx = (x^(n+1))/(n+1) + C
2. ∫ sin x dx = -cos x + C
3. ∫ e^x dx = e^x + C`
    ),
    uploadDate: '2026-08-10'
  }
];

export const ResourcesView = () => {
  const [resources, setResources] = useState(() => {
    try {
      const saved = localStorage.getItem('ssp_real_resources_v3');
      return saved !== null ? JSON.parse(saved) : INITIAL_RESOURCES;
    } catch (e) {
      return INITIAL_RESOURCES;
    }
  });

  useEffect(() => {
    localStorage.setItem('ssp_real_resources_v3', JSON.stringify(resources));
  }, [resources]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState(null);

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
    const ext = getFileExt(fileName, fileType);
    if (['JPG', 'PNG', 'JPEG', 'GIF', 'SVG', 'WEBP'].includes(ext)) {
      return <Image className="w-6 h-6 text-emerald-500" />;
    }
    if (['JS', 'JSX', 'TS', 'TSX', 'PY', 'HTML', 'CSS', 'JSON', 'CPP', 'JAVA'].includes(ext)) {
      return <FileCode className="w-6 h-6 text-purple-500" />;
    }
    if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(ext)) {
      return <FileArchive className="w-6 h-6 text-amber-500" />;
    }
    if (ext === 'PDF') {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    return <File className="w-6 h-6 text-blue-600" />;
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
        fileType: selectedFile.type || 'application/pdf',
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

  // Helper to convert Data URI to Blob
  const dataURItoBlob = (dataURI) => {
    if (!dataURI || typeof dataURI !== 'string') return null;
    try {
      if (dataURI.startsWith('data:')) {
        const parts = dataURI.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        
        let byteString;
        if (parts[0].indexOf('base64') >= 0) {
          byteString = atob(parts[1]);
        } else {
          byteString = decodeURIComponent(parts[1]);
        }

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mime });
      } else {
        return new Blob([dataURI], { type: 'application/pdf' });
      }
    } catch (e) {
      console.error('Blob conversion error:', e);
      return null;
    }
  };

  // 100% Reliable Native Android & Web Universal File Downloader
  const handleDownloadFile = async (resource) => {
    if (!resource?.fileData) return;

    const ext = getFileExt(resource.fileName, resource.fileType);
    const fileName = resource.fileName || `${resource.title}.${ext.toLowerCase()}`;

    // 1. Try Native Android Capacitor Filesystem Write (saves directly to phone Documents)
    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        let base64Content = resource.fileData;
        if (base64Content.includes(',')) {
          base64Content = base64Content.split(',')[1];
        }

        await Filesystem.writeFile({
          path: fileName,
          data: base64Content,
          directory: Directory.Documents,
          recursive: true
        });

        setDownloadSuccessMsg(`Saved ${fileName} to Documents!`);
        setTimeout(() => setDownloadSuccessMsg(null), 4000);
        return;
      }
    } catch (fsErr) {
      console.warn('Capacitor Filesystem write error, fallback to Blob:', fsErr);
    }

    // 2. Cross-Platform Blob Link Download
    try {
      const blob = dataURItoBlob(resource.fileData);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setDownloadSuccessMsg(`Downloading ${fileName}...`);
        setTimeout(() => setDownloadSuccessMsg(null), 3000);

        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 2000);
        return;
      }
    } catch (e) {
      console.error('Download error:', e);
    }

    // 3. Fallback Link
    const link = document.createElement('a');
    link.href = resource.fileData;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccessMsg(`Downloading ${fileName}...`);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  // Open Document in In-App Preview Modal
  const handleOpenFile = (resource) => {
    if (!resource?.fileData) return;
    setPreviewResource(resource);
  };

  // Open Document in External System Browser / PDF Reader
  const handleOpenInExternalBrowser = async (resource) => {
    if (!resource?.fileData) return;
    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        await Browser.open({ url: resource.fileData });
        return;
      }
    } catch (e) {
      console.warn('Browser.open failed:', e);
    }

    try {
      const blob = dataURItoBlob(resource.fileData);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        return;
      }
    } catch (e) {}

    window.open(resource.fileData, '_blank');
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
    <div className="w-full max-w-full space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-16 overflow-x-hidden relative">
      
      {/* Toast Notification Banner for Downloads */}
      {downloadSuccessMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-5">
          <Check className="w-4 h-4" />
          <span>{downloadSuccessMsg}</span>
        </div>
      )}

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
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer shrink-0"
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
        <div className="p-12 text-center text-slate-400 space-y-3 bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {search ? 'No resources match your search query.' : 'No study materials uploaded yet.'}
          </p>
          {!search && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Upload First Material
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const extName = getFileExt(res.fileName, res.fileType);

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-blue-300 dark:hover:border-blue-500/50 transition-all group"
              >
                {/* Card Top Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      {getFileIcon(res.fileName, res.fileType)}
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] border border-blue-200 dark:border-blue-800/60">
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

                {/* Action Buttons: Open, Download EXT, Delete */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB] dark:border-slate-800">
                  
                  {/* OPEN / PREVIEW BUTTON */}
                  <button
                    onClick={() => handleOpenFile(res)}
                    className="flex-1 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    title="Open / View File"
                  >
                    <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Open</span>
                  </button>

                  {/* DOWNLOAD EXTENSION-SPECIFIC BUTTON */}
                  <button
                    onClick={() => handleDownloadFile(res)}
                    className="h-9 px-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    title={`Download ${extName} File`}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {extName}</span>
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
            );
          })}
        </div>
      )}

      {/* FULLSCREEN IN-APP DOCUMENT PREVIEW MODAL */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl mx-auto h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            
            {/* MODAL PREVIEW HEADER */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                  {getFileIcon(previewResource.fileName, previewResource.fileType)}
                </div>
                <div className="truncate">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                    {previewResource.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {previewResource.fileName} ({previewResource.fileSize})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownloadFile(previewResource)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {getFileExt(previewResource.fileName, previewResource.fileType)}</span>
                </button>

                <button
                  onClick={() => handleOpenInExternalBrowser(previewResource)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  title="Open in Browser Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setPreviewResource(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MODAL PREVIEW BODY - UNIVERSAL EXTENSION READER */}
            <div className="flex-1 w-full bg-slate-950 p-3 sm:p-6 overflow-y-auto flex flex-col items-center justify-start space-y-4">
              
              {/* IMAGE FILE RENDERING */}
              {['JPG', 'PNG', 'JPEG', 'GIF', 'SVG', 'WEBP'].includes(getFileExt(previewResource.fileName, previewResource.fileType)) ? (
                <div className="w-full h-full flex items-center justify-center my-auto">
                  <img
                    src={previewResource.fileData}
                    alt={previewResource.title}
                    className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
                  />
                </div>
              ) : (
                /* DOCUMENT & PDF RENDERING */
                <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {getFileIcon(previewResource.fileName, previewResource.fileType)}
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-white">
                          {previewResource.title}
                        </h4>
                        <p className="text-xs text-slate-400">
                          📄 {previewResource.fileName} • {previewResource.fileSize}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DOCUMENT IN-APP CONTENT DISPLAY CONTAINER */}
                  <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 max-h-[50vh] overflow-y-auto space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800/80 pb-2">
                      <span>DOCUMENT READER CONTENT</span>
                      <span className="text-blue-400">{getFileExt(previewResource.fileName, previewResource.fileType)} Document</span>
                    </div>

                    {/* Embedded Frame / Readable Content */}
                    <iframe
                      src={previewResource.fileData}
                      title={previewResource.title}
                      className="w-full min-h-[300px] border-none rounded-xl bg-white text-slate-900"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      onClick={() => handleDownloadFile(previewResource)}
                      className="w-full py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download {getFileExt(previewResource.fileName, previewResource.fileType)} File</span>
                    </button>

                    <button
                      onClick={() => handleOpenInExternalBrowser(previewResource)}
                      className="w-full py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open in Browser</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-[92vw] sm:w-full max-w-lg p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Upload Study Material
            </h3>

            <form onSubmit={handleFileUpload} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry Reactions PDF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chemistry, Mathematics..."
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select File to Upload *
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium cursor-pointer"
                  required
                />
                {selectedFile && (
                  <p className="text-[11px] text-blue-600 font-bold mt-1.5">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)}) [Type: {getFileExt(selectedFile.name, selectedFile.type)}]
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
                  className="flex-1 h-10 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md cursor-pointer hover:bg-blue-700 disabled:opacity-50"
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
