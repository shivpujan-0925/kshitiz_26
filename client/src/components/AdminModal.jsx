import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Image as ImageIcon, 
  Award, 
  Radio, 
  LogOut, 
  Trash2, 
  Upload, 
  Download, 
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
  FileImage,
  FolderOpen,
  Calendar,
  Clock,
  Plus,
  Pencil,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Heart
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { apiUrl } from '../config/api';

const AdminModal = ({ isOpen, onClose, onDataRefresh }) => {
  const [token, setToken] = useState(localStorage.getItem('kshitiz_admin_token') || localStorage.getItem('astra_admin_token') || '');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('participants');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [posters, setPosters] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [shoutoutSearch, setShoutoutSearch] = useState('');

  // Form states with local drive file support
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', tag: 'Urgent' });
  
  // Schedule state
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    time: '',
    title: '',
    category: 'Ceremony',
    venue: 'Academic campus, GCE',
    description: '',
    highlight: false,
    order: 1
  });
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);

  // Custom Delete Modal State (NOT browser based)
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });

  // Custom Toast State (NOT browser alerts)
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });
  const showToast = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: '', type: 'success' }), 4000);
  };

  // Poster state
  const [posterTitle, setPosterTitle] = useState('');
  const [posterDescription, setPosterDescription] = useState('');
  const [posterDirectUrl, setPosterDirectUrl] = useState('');
  const [posterFile, setPosterFile] = useState(null);

  // Gallery Photo state
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('Stage');
  const [galleryDirectUrl, setGalleryDirectUrl] = useState('');
  const [galleryFile, setGalleryFile] = useState(null);

  // Royalty Awards state
  const [awardForm, setAwardForm] = useState({
    mrName: '', mrRegNo: '', mrBranch: '', mrDirectUrl: '', mrAnnounced: true,
    mrsName: '', mrsRegNo: '', mrsBranch: '', mrsDirectUrl: '', mrsAnnounced: true
  });
  const [mrFile, setMrFile] = useState(null);
  const [mrsFile, setMrsFile] = useState(null);

  // Master links state
  const [settingsForm, setSettingsForm] = useState({
    googleDriveLink: '',
    instagramLink: '',
    venue: '',
    themeName: ''
  });

  const headers = {
    Authorization: `Bearer ${token}`
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: (credentials.username || '').trim(),
          password: (credentials.password || '').trim()
        })
      });
      const data = await res.json();

      if (data.success && data.token) {
        setToken(data.token);
        localStorage.setItem('kshitiz_admin_token', data.token);
        setStatusMsg({ type: 'success', text: 'Authenticated successfully!' });
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Invalid username or password' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to connect to backend server' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('kshitiz_admin_token');
    localStorage.removeItem('astra_admin_token');
  };

  // Fetch admin dashboard data
  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [dashRes, partRes, annRes, galRes, postRes, setRes, schRes, shoutRes] = await Promise.all([
        fetch(apiUrl('/api/admin/dashboard'), { headers }),
        fetch(apiUrl('/api/admin/participants'), { headers }),
        fetch(apiUrl('/api/announcements')),
        fetch(apiUrl('/api/gallery')),
        fetch(apiUrl('/api/posters')),
        fetch(apiUrl('/api/settings')),
        fetch(apiUrl('/api/schedule')),
        fetch(apiUrl('/api/hype-cheers'))
      ]);

      if (dashRes.status === 401 || partRes.status === 401) {
        handleLogout();
        setStatusMsg({ type: 'error', text: 'Admin session expired. Please log in again.' });
        return;
      }

      const [dash, part, ann, gal, post, sett, sch, shout] = await Promise.all([
        dashRes.json(),
        partRes.json(),
        annRes.json(),
        galRes.json(),
        postRes.json(),
        setRes.json(),
        schRes.json(),
        shoutRes.json()
      ]);

      if (dash.success) setDashboardStats(dash.stats);
      if (part.success) setParticipants(part.data);
      if (ann.success) setAnnouncements(ann.data);
      if (gal.success) setGallery(gal.data);
      if (post.success) setPosters(post.data);
      if (sch.success) setSchedule(sch.data);
      if (shout.success && shout.data) setShoutouts(shout.data);
      if (sett.success && sett.data) {
        setSettingsForm({
          googleDriveLink: sett.data.googleDriveLink || '',
          instagramLink: sett.data.instagramLink || '',
          venue: sett.data.venue || '',
          themeName: sett.data.themeName || ''
        });
        if (sett.data.mrFresher && sett.data.mrsFresher) {
          setAwardForm({
            mrName: sett.data.mrFresher.name || '',
            mrRegNo: sett.data.mrFresher.registrationNumber || '',
            mrBranch: sett.data.mrFresher.branch || '',
            mrDirectUrl: sett.data.mrFresher.imageUrl || '',
            mrAnnounced: sett.data.mrFresher.announced,
            mrsName: sett.data.mrsFresher.name || '',
            mrsRegNo: sett.data.mrsFresher.registrationNumber || '',
            mrsBranch: sett.data.mrsFresher.branch || '',
            mrsDirectUrl: sett.data.mrsFresher.imageUrl || '',
            mrsAnnounced: sett.data.mrsFresher.announced
          });
        }
      }
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchAdminData();
    }
  }, [isOpen, token]);

  // Filter participants by branch, role, and search query
  const filteredParticipants = participants.filter((p) => {
    const matchesBranch = filterBranch === 'All' || p.branch === filterBranch;
    const matchesRole = filterRole === 'All' || (
      filterRole === 'Performer' 
        ? (p.role || '').toLowerCase().includes('participant') || (p.role || '').toLowerCase().includes('performer')
        : filterRole === 'Volunteer' 
        ? (p.role || '').toLowerCase().includes('volunteer')
        : filterRole === 'Attendee' 
        ? (p.role || '').toLowerCase().includes('attendee') || (p.role || '').toLowerCase().includes('crowd') || (p.role || '').toLowerCase().includes('general')
        : p.role === filterRole
    );
    const matchesSearch = !searchQuery || 
      (p.fullName && p.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.registrationNumber && p.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.acts && p.acts.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.role && p.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.phone && p.phone.includes(searchQuery));
    return matchesBranch && matchesRole && matchesSearch;
  });

  // Filter live shoutouts by author, branch, batch, or message
  const filteredShoutouts = shoutouts.filter((s) => {
    if (!shoutoutSearch) return true;
    const q = shoutoutSearch.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.branch && s.branch.toLowerCase().includes(q)) ||
      (s.batch && s.batch.toLowerCase().includes(q)) ||
      (s.message && s.message.toLowerCase().includes(q))
    );
  });

  // Export Participants to CSV (Exports current filtered view)
  const exportToCSV = () => {
    const listToExport = filteredParticipants.length > 0 ? filteredParticipants : participants;
    if (!listToExport.length) return;
    const csvRows = [];
    const headersList = ['Full Name', 'Roll / Reg No', 'Branch', 'Role', 'Acts / What To Do', 'WhatsApp No', 'Status', 'Registered At'];
    csvRows.push(headersList.join(','));

    listToExport.forEach((p) => {
      const row = [
        `"${p.fullName || ''}"`,
        `"${p.registrationNumber || ''}"`,
        `"${p.branch || ''}"`,
        `"${p.role || ''}"`,
        `"${(p.acts || p.performanceTitle || p.category || '').replace(/"/g, '""')}"`,
        `"${p.phone || ''}"`,
        `"${p.status || 'Confirmed'}"`,
        `"${p.registeredAt || ''}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    const roleSuffix = filterRole !== 'All' ? `_${filterRole}` : '';
    a.setAttribute('download', `Kshitiz_2025_Participants${roleSuffix}_${Date.now()}.csv`);
    a.click();
  };

  // Helper: Open Custom Delete Confirm Modal (Zero Browser Confirm)
  const requestDelete = (title, message, deleteAction) => {
    setDeleteConfirm({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        setDeleteConfirm(prev => ({ ...prev, loading: true }));
        try {
          await deleteAction();
          setDeleteConfirm({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
        } catch (err) {
          setDeleteConfirm(prev => ({ ...prev, loading: false }));
          showToast('Failed to delete item: ' + err.message, 'error');
        }
      },
      loading: false
    });
  };

  // Delete participant (Custom Modal)
  const deleteParticipant = (p) => {
    requestDelete(
      'Remove Participant',
      `Are you sure you want to remove participant "${p.fullName || 'this participant'}" (Roll: ${p.registrationNumber || 'N/A'})? Their entry pass will be invalidated.`,
      async () => {
        const res = await fetch(apiUrl(`/api/admin/participants/${p._id}`), { method: 'DELETE', headers });
        const data = await res.json();
        if (data.success) {
          setParticipants(participants.filter(item => item._id !== p._id));
          showToast(`✓ Removed participant: ${p.fullName}`, 'success');
          if (onDataRefresh) onDataRefresh();
        } else {
          showToast(data.message || 'Delete failed', 'error');
        }
      }
    );
  };

  // Schedule Save (Create / Update)
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.time.trim() || !scheduleForm.title.trim()) {
      showToast('Please enter both slot time and act title', 'error');
      return;
    }

    try {
      const url = editingScheduleId 
        ? apiUrl(`/api/admin/schedule/${editingScheduleId}`)
        : apiUrl('/api/admin/schedule');
      const method = editingScheduleId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm)
      });
      const data = await res.json();

      if (data.success) {
        if (editingScheduleId) {
          setSchedule(schedule.map(s => s._id === editingScheduleId ? data.data : s));
          showToast(`✓ Updated timeline slot: "${data.data.title}"`, 'success');
        } else {
          setSchedule([...schedule, data.data]);
          showToast(`🎉 Added timeline slot: "${data.data.title}"`, 'success');
        }

        setEditingScheduleId(null);
        setScheduleForm({
          time: '',
          title: '',
          category: 'Ceremony',
          venue: 'Academic campus, GCE',
          description: '',
          highlight: false,
          order: schedule.length + 2
        });
        setIsScheduleFormOpen(false);
        if (onDataRefresh) onDataRefresh();
      } else {
        showToast(data.message || 'Failed to save timeline slot', 'error');
      }
    } catch (err) {
      showToast('Network error while saving timeline slot', 'error');
    }
  };

  const handleEditSchedule = (item) => {
    setEditingScheduleId(item._id);
    setScheduleForm({
      time: item.time || '',
      title: item.title || '',
      category: item.category || 'Ceremony',
      venue: item.venue || 'Academic campus, GCE',
      description: item.description || '',
      highlight: !!item.highlight,
      order: item.order || 1
    });
    setIsScheduleFormOpen(true);
  };

  const handleDeleteSchedule = (item) => {
    requestDelete(
      'Delete Timeline Slot',
      `Are you sure you want to remove "${item.title}" (${item.time}) from the official schedule timeline?`,
      async () => {
        const res = await fetch(apiUrl(`/api/admin/schedule/${item._id}`), { method: 'DELETE', headers });
        const data = await res.json();
        if (data.success) {
          setSchedule(schedule.filter(s => s._id !== item._id));
          showToast('✓ Timeline event deleted successfully', 'success');
          if (onDataRefresh) onDataRefresh();
        } else {
          showToast(data.message || 'Delete failed', 'error');
        }
      }
    );
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/admin/announcements'), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnouncement)
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements([data.data, ...announcements]);
        setNewAnnouncement({ title: '', content: '', tag: 'Urgent' });
        showToast('🎉 Announcement published live to all students!', 'success');
        if (onDataRefresh) onDataRefresh();
      } else {
        showToast(data.message || 'Failed to publish announcement', 'error');
      }
    } catch (err) {
      showToast('Failed to publish announcement', 'error');
    }
  };

  // Delete Announcement (Custom Modal)
  const deleteAnnouncement = (ann) => {
    requestDelete(
      'Delete Announcement',
      `Are you sure you want to delete "${ann.title}"? It will be removed immediately from the live broadcast.`,
      async () => {
        const res = await fetch(apiUrl(`/api/admin/announcements/${ann._id}`), { method: 'DELETE', headers });
        const data = await res.json();
        if (data.success) {
          setAnnouncements(announcements.filter(a => a._id !== ann._id));
          showToast('✓ Announcement deleted', 'success');
          if (onDataRefresh) onDataRefresh();
        } else {
          showToast(data.message || 'Delete failed', 'error');
        }
      }
    );
  };

  // Delete Live Shoutout (Custom Modal)
  const handleDeleteShoutout = (shoutout) => {
    requestDelete(
      'Delete Live Shoutout',
      `Permanently remove the shoutout from "${shoutout.name}" (${shoutout.branch})? This will immediately remove it from the live Hype Wall for all participants.`,
      async () => {
        const res = await fetch(apiUrl(`/api/admin/hype-cheers/${shoutout._id}`), { method: 'DELETE', headers });
        const data = await res.json();
        if (data.success) {
          setShoutouts(prev => prev.filter(s => s._id !== shoutout._id));
          showToast('✓ Shoutout deleted successfully', 'success');
          if (onDataRefresh) onDataRefresh();
        } else {
          showToast(data.message || 'Failed to delete shoutout', 'error');
        }
      }
    );
  };

  // Upload Poster (Supports Local File from Drive OR Direct Link)
  const handleUploadPoster = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', posterTitle);
      formData.append('description', posterDescription);
      if (posterFile) {
        formData.append('image', posterFile);
      } else if (posterDirectUrl) {
        formData.append('directUrl', posterDirectUrl);
      } else {
        showToast('Please choose an image file from your local drive or enter a photo URL', 'error');
        return;
      }

      const res = await fetch(apiUrl('/api/admin/posters'), {
        method: 'POST',
        headers, // FormData manages its own multipart boundary
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setPosters([data.data, ...posters]);
        setPosterTitle('');
        setPosterDescription('');
        setPosterDirectUrl('');
        setPosterFile(null);
        showToast('🎉 Event poster uploaded successfully!', 'success');
        if (onDataRefresh) onDataRefresh();
      } else {
        showToast(data.message || 'Failed to upload poster', 'error');
      }
    } catch (err) {
      showToast('Failed to upload poster: ' + err.message, 'error');
    }
  };

  // Delete Poster (Custom Modal)
  const deletePoster = (pos) => {
    requestDelete(
      'Delete Poster',
      `Are you sure you want to delete poster "${pos.title || 'Official Poster'}"?`,
      async () => {
        const res = await fetch(apiUrl(`/api/admin/posters/${pos._id}`), { method: 'DELETE', headers });
        const data = await res.json();
        if (data.success) {
          setPosters(posters.filter(p => p._id !== pos._id));
          showToast('✓ Poster deleted successfully', 'success');
          if (onDataRefresh) onDataRefresh();
        } else {
          showToast(data.message || 'Delete failed', 'error');
        }
      }
    );
  };

  // Upload Gallery Photo (Supports Local File from Drive OR Direct Link)
  const handleUploadGallery = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', galleryTitle);
      formData.append('category', galleryCategory);
      if (galleryFile) {
        formData.append('image', galleryFile);
      } else if (galleryDirectUrl) {
        formData.append('directUrl', galleryDirectUrl);
      } else {
        showToast('Please choose an image file from your local drive or enter a photo URL', 'error');
        return;
      }

      const res = await fetch(apiUrl('/api/admin/gallery'), {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setGallery([data.data, ...gallery]);
        setGalleryTitle('');
        setGalleryDirectUrl('');
        setGalleryFile(null);
        showToast('🎉 Party moment photo uploaded successfully!', 'success');
        if (onDataRefresh) onDataRefresh();
      } else {
        showToast(data.message || 'Failed to upload photo', 'error');
      }
    } catch (err) {
      showToast('Failed to upload photo: ' + err.message, 'error');
    }
  };

  // Delete Gallery Photo (Custom Modal)
  const deleteGalleryPhoto = (g) => {
    requestDelete(
      'Delete Gallery Photo',
      `Are you sure you want to delete "${g.title || 'Party Photo'}" from the gallery vault?`,
      async () => {
        const res = await fetch(apiUrl(`/api/admin/gallery/${g._id}`), { method: 'DELETE', headers });
        const data = await res.json();
        if (data.success) {
          setGallery(gallery.filter(item => item._id !== g._id));
          showToast('✓ Gallery photo deleted', 'success');
          if (onDataRefresh) onDataRefresh();
        } else {
          showToast(data.message || 'Delete failed', 'error');
        }
      }
    );
  };

  // Update Awards (Supports Local File Uploads for Winners)
  const handleUpdateAwards = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('mrName', awardForm.mrName);
      formData.append('mrRegNo', awardForm.mrRegNo);
      formData.append('mrBranch', awardForm.mrBranch);
      formData.append('mrDirectUrl', awardForm.mrDirectUrl);
      formData.append('mrAnnounced', awardForm.mrAnnounced);

      formData.append('mrsName', awardForm.mrsName);
      formData.append('mrsRegNo', awardForm.mrsRegNo);
      formData.append('mrsBranch', awardForm.mrsBranch);
      formData.append('mrsDirectUrl', awardForm.mrsDirectUrl);
      formData.append('mrsAnnounced', awardForm.mrsAnnounced);

      if (mrFile) formData.append('mrImage', mrFile);
      if (mrsFile) formData.append('mrsImage', mrsFile);

      const res = await fetch(apiUrl('/api/admin/awards'), {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast('🎉 Royalty Winners updated successfully!', 'success');
        if (onDataRefresh) onDataRefresh();
      } else {
        showToast(data.message || 'Update failed', 'error');
      }
    } catch (err) {
      showToast('Failed to update awards: ' + err.message, 'error');
    }
  };

  // Update Settings (Google Drive Link, Instagram, etc.)
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/admin/settings'), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Master settings & Google Drive link saved successfully!', 'success');
        if (onDataRefresh) onDataRefresh();
      } else {
        showToast('Failed to update settings', 'error');
      }
    } catch (err) {
      showToast('Failed to update settings: ' + err.message, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[900px] glass-panel rounded-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#070b20]">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">Kshitiz '25 Admin Cockpit</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Batch 2024–28 Committee
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">Gaya College of Engineering Fresher Operations Desk</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={handleLogout}
                className="p-2 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!token ? (
          /* Admin Login Form */
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl border border-white/10 text-center shadow-2xl">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">Committee Authentication</h4>
              <p className="text-xs text-slate-400 mb-6">Enter authorized committee credentials to access event management</p>

              {statusMsg.text && (
                <div className={`p-3 rounded-xl mb-4 text-xs font-semibold ${
                  statusMsg.type === 'success' ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'
                }`}>
                  {statusMsg.text}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full glass-input px-4 py-3 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full glass-input px-4 py-3 rounded-xl text-white text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 shadow-lg shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-sm"
                >
                  {loading ? 'Authenticating...' : 'Enter Admin Control'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Responsive Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 lg:w-64 border-b md:border-b-0 md:border-r border-white/10 p-2 sm:p-3 flex md:flex-col gap-1.5 overflow-x-auto bg-[#070b1e] flex-shrink-0">
              {[
                { id: 'participants', label: 'Participants', icon: Users, badge: participants.length },
                { id: 'shoutouts', label: 'Hype Shoutouts', icon: MessageSquare, badge: shoutouts.length },
                { id: 'schedule', label: 'Schedule Timeline', icon: Calendar, badge: schedule.length },
                { id: 'posters', label: 'Posters (Drive/URL)', icon: ImageIcon, badge: posters.length },
                { id: 'gallery', label: 'Party Glimpses', icon: Sparkles, badge: gallery.length },
                { id: 'royalty', label: 'Mr & Miss Fresher', icon: Award },
                { id: 'announcements', label: 'Announcements', icon: Radio, badge: announcements.length },
                { id: 'settings', label: 'Master Drive & Links', icon: LinkIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-purple-600/30 text-white border border-purple-500/40 shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 font-mono ml-2">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto bg-[#030614]">
              
              {/* TAB 1: PARTICIPANTS */}
              {activeTab === 'participants' && (
                <div className="space-y-5">
                  
                  {/* Stats Bar (Clickable quick role filters) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setFilterRole('All')}
                      className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                        filterRole === 'All' 
                          ? 'border-cyan-400/80 bg-cyan-950/40 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/40' 
                          : 'glass-card border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[11px] text-slate-400 uppercase font-bold flex items-center justify-between">
                        <span>Total Registrations</span>
                        {filterRole === 'All' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">Active</span>}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black text-white mt-1">{participants.length}</h4>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterRole('Performer')}
                      className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                        filterRole === 'Performer' 
                          ? 'border-purple-400/80 bg-purple-950/40 shadow-lg shadow-purple-950/50 ring-1 ring-purple-400/40' 
                          : 'glass-card border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[11px] text-purple-300 uppercase font-bold flex items-center justify-between">
                        <span>Performers / Acts</span>
                        {filterRole === 'Performer' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-200 font-bold border border-purple-500/30">Active</span>}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black text-purple-300 mt-1">
                        {participants.filter(p => (p.role || '').toLowerCase().includes('participant') || (p.role || '').toLowerCase().includes('performer')).length}
                      </h4>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterRole('Volunteer')}
                      className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                        filterRole === 'Volunteer' 
                          ? 'border-amber-400/80 bg-amber-950/40 shadow-lg shadow-amber-950/50 ring-1 ring-amber-400/40' 
                          : 'glass-card border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[11px] text-amber-300 uppercase font-bold flex items-center justify-between">
                        <span>Volunteers</span>
                        {filterRole === 'Volunteer' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 font-bold border border-amber-500/30">Active</span>}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                        {participants.filter(p => (p.role || '').toLowerCase().includes('volunteer')).length}
                      </h4>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFilterRole('Attendee')}
                      className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                        filterRole === 'Attendee' 
                          ? 'border-cyan-400/80 bg-cyan-950/40 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/40' 
                          : 'glass-card border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[11px] text-cyan-300 uppercase font-bold flex items-center justify-between">
                        <span>General Attendees</span>
                        {filterRole === 'Attendee' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-500/30">Active</span>}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">
                        {participants.filter(p => (p.role || '').toLowerCase().includes('attendee') || (p.role || '').toLowerCase().includes('crowd') || (p.role || '').toLowerCase().includes('general')).length}
                      </h4>
                    </button>
                  </div>

                  {/* Actions, Role Filter, Branch Filter & Search */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      <input
                        type="text"
                        placeholder="Search student, roll, or act..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 w-full sm:w-52"
                      />

                      {/* Filter by Role */}
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="glass-input px-3 py-2 rounded-xl text-xs text-white bg-slate-900 border border-purple-500/30 focus:border-purple-400"
                        title="Filter by Role"
                      >
                        <option value="All">All Roles ({participants.length})</option>
                        <option value="Performer">🎭 Performers & Acts</option>
                        <option value="Volunteer">🤝 Volunteers & Coordinators</option>
                        <option value="Attendee">🎟️ General Attendees</option>
                      </select>

                      {/* Filter by Branch */}
                      <select
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                        className="glass-input px-3 py-2 rounded-xl text-xs text-white bg-slate-900 border border-cyan-500/30 focus:border-cyan-400"
                        title="Filter by Branch"
                      >
                        <option value="All">All Branches</option>
                        <option value="Computer Science & Engineering">CSE</option>
                        <option value="Electronics & Communication Engineering">ECE</option>
                        <option value="Electrical & Electronics Engineering">EEE</option>
                        <option value="Mechanical Engineering">ME</option>
                        <option value="Civil Engineering">CE</option>
                      </select>

                      {(filterRole !== 'All' || filterBranch !== 'All' || searchQuery) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFilterRole('All');
                            setFilterBranch('All');
                            setSearchQuery('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-rose-300 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
                        >
                          ✕ Reset Filters
                        </button>
                      )}
                    </div>

                    <button
                      onClick={exportToCSV}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-600/50 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-4 h-4" /> 
                      Export CSV ({filteredParticipants.length})
                    </button>
                  </div>

                  {/* Responsive Table */}
                  <div className="glass-panel rounded-2xl border border-white/10 overflow-x-auto shadow-xl">
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase font-bold">
                        <tr>
                          <th className="p-3.5">Student Name</th>
                          <th className="p-3.5">Roll No.</th>
                          <th className="p-3.5">Branch</th>
                          <th className="p-3.5">Role</th>
                          <th className="p-3.5">Acts / What to do</th>
                          <th className="p-3.5">WhatsApp No.</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {filteredParticipants.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="p-6 text-center text-slate-400">
                              No participants matched your search criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredParticipants.map((p) => (
                            <tr key={p._id} className="hover:bg-white/5 transition-colors">
                              <td className="p-3.5 font-bold text-white">{p.fullName}</td>
                              <td className="p-3.5 font-mono text-cyan-300 font-semibold">{p.registrationNumber}</td>
                              <td className="p-3.5 max-w-[130px] truncate">{p.branch}</td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  (p.role || '').includes('Performer') || (p.role || '').includes('Participant')
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                    : (p.role || '').includes('Volunteer')
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                }`}>
                                  {p.role || 'Participant'}
                                </span>
                              </td>
                              <td className="p-3.5 text-slate-200 font-medium max-w-[160px] truncate">
                                {p.acts || p.performanceTitle || p.category || 'General Conclave'}
                              </td>
                              <td className="p-3.5 font-mono text-[11px] text-emerald-400">{p.phone}</td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => deleteParticipant(p)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                                  title="Delete Participant"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: LIVE HYPE & SHOUTOUTS MODERATION */}
              {activeTab === 'shoutouts' && (
                <div className="space-y-6">
                  {/* Header & Stats */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-pink-400" />
                        <span>Live Shoutouts & Hype Wall Moderation</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono font-bold border border-pink-500/30">
                          {shoutouts.length} Total
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Manage and moderate real-time messages, cheers, and confessions displayed on the live Hype Wall.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="glass-panel px-3.5 py-1.5 rounded-xl border border-white/10 text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Hearts</span>
                        <span className="text-sm font-black text-rose-400 font-mono">
                          {shoutouts.reduce((acc, curr) => acc + (curr.likes || 0), 0)} ❤️
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Search shoutouts by author, branch, batch, or message keyword..."
                        value={shoutoutSearch}
                        onChange={(e) => setShoutoutSearch(e.target.value)}
                        className="w-full glass-input px-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm"
                      />
                      {shoutoutSearch && (
                        <button
                          onClick={() => setShoutoutSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Shoutouts List / Cards */}
                  {filteredShoutouts.length === 0 ? (
                    <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 text-slate-400">
                      <MessageSquare className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                      <p className="font-semibold text-sm text-slate-300">No shoutouts found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {shoutoutSearch ? 'Try a different search term.' : 'Freshers and seniors have not posted shoutouts yet.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredShoutouts.map((item) => (
                        <div
                          key={item._id}
                          className="glass-card p-5 rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all flex flex-col justify-between group shadow-lg"
                        >
                          <div>
                            {/* Author & Meta */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 p-[1px] flex-shrink-0">
                                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    {(item.name || 'A').charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                    <span className="text-cyan-300 font-semibold">{item.batch || 'Batch 2025–29'}</span>
                                    <span>•</span>
                                    <span className="text-pink-300">{item.branch || 'General'}</span>
                                  </div>
                                </div>
                              </div>

                              <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                                {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Live'}
                              </span>
                            </div>

                            {/* Message */}
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/5 mb-3">
                              "{item.message}"
                            </p>
                          </div>

                          {/* Footer Action Bar */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/10">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                              <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
                              <span>{item.likes || 1} Likes</span>
                            </div>

                            <button
                              onClick={() => handleDeleteShoutout(item)}
                              title="Permanently Delete Shoutout"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-300 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Shoutout</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: SCHEDULE TIMELINE */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  {/* Header & Add Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        <span>Schedule Timeline & Stage Slots</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Manage official event program, arrival checkpoints, stage performances, and evening timetable.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isScheduleFormOpen && !editingScheduleId) {
                          setIsScheduleFormOpen(false);
                        } else {
                          setEditingScheduleId(null);
                          setScheduleForm({
                            time: '',
                            title: '',
                            category: 'Ceremony',
                            venue: 'Academic campus, GCE',
                            description: '',
                            highlight: false,
                            order: schedule.length + 1
                          });
                          setIsScheduleFormOpen(true);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/30 transition-all cursor-pointer w-fit"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isScheduleFormOpen && !editingScheduleId ? 'Close Form' : 'Add Timeline Slot'}</span>
                    </button>
                  </div>

                  {/* Add / Edit Form Card */}
                  {isScheduleFormOpen && (
                    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 shadow-xl animate-fade-in relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                          {editingScheduleId ? <Pencil className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-cyan-400" />}
                          {editingScheduleId ? 'Edit Schedule Slot' : 'Add New Schedule Slot'}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setIsScheduleFormOpen(false); setEditingScheduleId(null); }}
                          className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveSchedule} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Time Slot *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 05:30 PM"
                              value={scheduleForm.time}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white font-mono text-xs focus:border-cyan-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category *</label>
                            <select
                              value={scheduleForm.category}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, category: e.target.value })}
                              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs bg-slate-900 focus:border-purple-500"
                            >
                              {['Ceremony', 'Royalty', 'Music', 'Dance', 'Performance', 'DJ & Dance', 'Feast', 'Other'].map(c => (
                                <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Display Order #</label>
                            <input
                              type="number"
                              min="1"
                              placeholder="1, 2, 3..."
                              value={scheduleForm.order}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, order: e.target.value })}
                              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs focus:border-cyan-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Event / Act Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Senior Welcome & Auspicious Lamp Lighting"
                              value={scheduleForm.title}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs focus:border-cyan-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Venue / Stage Location *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Academic campus, GCE Stage"
                              value={scheduleForm.venue}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })}
                              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs focus:border-purple-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description / Notes</label>
                          <textarea
                            rows={2}
                            placeholder="Detailed schedule notes, acts breakdown, or instructions for freshers..."
                            value={scheduleForm.description}
                            onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                            className="w-full glass-input px-3.5 py-2 rounded-xl text-white text-xs resize-none"
                          />
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-pink-300">
                            <input
                              type="checkbox"
                              checked={scheduleForm.highlight}
                              onChange={(e) => setScheduleForm({ ...scheduleForm, highlight: e.target.checked })}
                              className="w-4 h-4 rounded bg-slate-900 border-white/20 text-pink-500 focus:ring-0 cursor-pointer"
                            />
                            <span>★ Feature as Major Highlight / VIP Slot (Golden/Pink Ribbon)</span>
                          </label>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="submit"
                            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{editingScheduleId ? 'Update Schedule Slot' : 'Save Timeline Slot'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsScheduleFormOpen(false); setEditingScheduleId(null); }}
                            className="py-2.5 px-4 rounded-xl glass-card text-slate-400 hover:text-white text-xs transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Schedule Items List */}
                  <div className="space-y-3">
                    {schedule.length === 0 ? (
                      <div className="text-center py-12 glass-panel rounded-2xl border border-white/10">
                        <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No schedule slots found. Click "Add Timeline Slot" to create the first one.</p>
                      </div>
                    ) : (
                      schedule.map((item, idx) => (
                        <div
                          key={item._id || idx}
                          className={`glass-card p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            item.highlight ? 'border-pink-500/30 bg-pink-950/10' : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="flex flex-col items-center justify-center w-20 py-2 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
                              <span className="text-xs font-mono font-bold text-cyan-300">{item.time}</span>
                              <span className="text-[9px] uppercase tracking-wider text-slate-400">#{item.order || idx + 1}</span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                                  {item.category}
                                </span>
                                {item.highlight && (
                                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40">
                                    ★ Major Highlight
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-slate-300 mt-1 line-clamp-2 max-w-xl">{item.description}</p>
                              )}
                              <span className="text-[11px] text-purple-300 mt-1 block">📍 {item.venue}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleEditSchedule(item)}
                              className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                              title="Edit Schedule Slot"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSchedule(item)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                              title="Delete Schedule Slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: POSTERS (LOCAL DRIVE + URL) */}
              {activeTab === 'posters' && (
                <div className="space-y-6">
                  <div className="glass-panel p-5 rounded-2xl border border-white/10">
                    <h4 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-purple-400" /> Upload Poster from Local Drive or Link
                    </h4>
                    <form onSubmit={handleUploadPoster} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Poster Title (e.g. Kshitiz 2025 Genesis Poster)"
                          value={posterTitle}
                          onChange={(e) => setPosterTitle(e.target.value)}
                          className="glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Poster Subtitle / Description"
                          value={posterDescription}
                          onChange={(e) => setPosterDescription(e.target.value)}
                          className="glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        {/* Local File Drive Upload */}
                        <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20">
                          <label className="block text-xs font-bold text-purple-300 uppercase mb-1.5 flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" /> Option A: Select File from Local Drive
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPosterFile(e.target.files[0] || null)}
                            className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                          />
                          {posterFile && (
                            <span className="text-[11px] text-cyan-300 mt-1 block font-mono">
                              Selected: {posterFile.name}
                            </span>
                          )}
                        </div>

                        {/* Online Direct URL */}
                        <div className="p-3.5 rounded-xl border border-white/10 bg-white/5">
                          <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
                            <FileImage className="w-3.5 h-3.5" /> Option B: Direct Image URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={posterDirectUrl}
                            onChange={(e) => setPosterDirectUrl(e.target.value)}
                            className="glass-input px-3 py-2 rounded-xl text-white text-xs w-full"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Publish Event Poster</span>
                      </button>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {posters.map((pos) => (
                      <div key={pos._id} className="glass-card rounded-2xl overflow-hidden border border-white/10 group relative shadow-lg">
                        <img src={pos.url} alt={pos.title} className="w-full h-48 object-cover" />
                        <div className="p-4 flex items-center justify-between bg-slate-950/80">
                          <div>
                            <h5 className="font-bold text-sm text-white">{pos.title}</h5>
                            {pos.description && (
                              <p className="text-xs text-slate-400 line-clamp-1">{pos.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => deletePoster(pos)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PARTY GLIMPSES (LOCAL DRIVE + URL) */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div className="glass-panel p-5 rounded-2xl border border-white/10">
                    <h4 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400" /> Add Party Glimpse Photo from Local Drive or URL
                    </h4>
                    <form onSubmit={handleUploadGallery} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Photo Caption / Description"
                          value={galleryTitle}
                          onChange={(e) => setGalleryTitle(e.target.value)}
                          className="glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                        />
                        <select
                          value={galleryCategory}
                          onChange={(e) => setGalleryCategory(e.target.value)}
                          className="glass-input px-3.5 py-2.5 rounded-xl text-white text-xs bg-slate-900"
                        >
                          <option value="Stage">Stage</option>
                          <option value="DJ Night">DJ Night</option>
                          <option value="Ramp Walk">Ramp Walk</option>
                          <option value="Music">Music</option>
                          <option value="Memories">Memories</option>
                          <option value="Campus">Campus</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        {/* Local File Drive Upload */}
                        <div className="p-3.5 rounded-xl border border-pink-500/30 bg-pink-950/20">
                          <label className="block text-xs font-bold text-pink-300 uppercase mb-1.5 flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" /> Option A: Select Photo from Local Drive
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setGalleryFile(e.target.files[0] || null)}
                            className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-500 cursor-pointer"
                          />
                          {galleryFile && (
                            <span className="text-[11px] text-cyan-300 mt-1 block font-mono">
                              Selected: {galleryFile.name}
                            </span>
                          )}
                        </div>

                        {/* Direct URL */}
                        <div className="p-3.5 rounded-xl border border-white/10 bg-white/5">
                          <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
                            <FileImage className="w-3.5 h-3.5" /> Option B: Direct Photo URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://..."
                            value={galleryDirectUrl}
                            onChange={(e) => setGalleryDirectUrl(e.target.value)}
                            className="glass-input px-3 py-2 rounded-xl text-white text-xs w-full"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="py-3 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Party Glimpse</span>
                      </button>
                    </form>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {gallery.map((g) => (
                      <div key={g._id} className="glass-card rounded-2xl overflow-hidden border border-white/10 relative group">
                        <img src={g.url} alt={g.title} className="w-full h-32 object-cover" />
                        <div className="p-3 flex items-center justify-between bg-slate-950/80">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-purple-400">{g.category}</span>
                            <h5 className="font-bold text-xs text-white truncate max-w-[120px]">{g.title}</h5>
                          </div>
                          <button
                            onClick={() => deleteGalleryPhoto(g)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ROYALTY WINNERS (MR & MISS FRESHER) */}
              {activeTab === 'royalty' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 shadow-2xl">
                    <h4 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" /> Mr. & Miss Kshitiz Crowning Manager
                    </h4>

                    <form onSubmit={handleUpdateAwards} className="space-y-6">
                      
                      {/* Mr. Fresher */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3.5">
                        <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">Mr. Kshitiz 2025 Profile</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Full Name (e.g. Aarav Sharma)"
                            value={awardForm.mrName}
                            onChange={(e) => setAwardForm({ ...awardForm, mrName: e.target.value })}
                            className="glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Branch (e.g. CSE)"
                            value={awardForm.mrBranch}
                            onChange={(e) => setAwardForm({ ...awardForm, mrBranch: e.target.value })}
                            className="glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Registration / Roll No"
                            value={awardForm.mrRegNo}
                            onChange={(e) => setAwardForm({ ...awardForm, mrRegNo: e.target.value })}
                            className="glass-input px-3.5 py-2.5 rounded-xl text-white text-xs font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] text-amber-300 font-bold mb-1">Upload Photo from Local Drive:</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setMrFile(e.target.files[0] || null)}
                              className="text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-amber-600 file:text-white cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Or Direct Photo Link:</label>
                            <input
                              type="url"
                              placeholder="https://..."
                              value={awardForm.mrDirectUrl}
                              onChange={(e) => setAwardForm({ ...awardForm, mrDirectUrl: e.target.value })}
                              className="glass-input px-3 py-1.5 rounded-xl text-white text-xs w-full"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 text-xs font-medium text-amber-200 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={awardForm.mrAnnounced}
                            onChange={(e) => setAwardForm({ ...awardForm, mrAnnounced: e.target.checked })}
                            className="rounded text-amber-500 focus:ring-0"
                          />
                          <span>Publish Mr. Fresher Winner Reveal on Website</span>
                        </label>
                      </div>

                      {/* Miss Fresher */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-pink-950/20 border border-pink-500/30 space-y-3.5">
                        <span className="text-xs font-bold uppercase text-pink-400 tracking-wider">Miss Kshitiz 2025 Profile</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Full Name (e.g. Ananya Verma)"
                            value={awardForm.mrsName}
                            onChange={(e) => setAwardForm({ ...awardForm, mrsName: e.target.value })}
                            className="glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Branch (e.g. ECE)"
                            value={awardForm.mrsBranch}
                            onChange={(e) => setAwardForm({ ...awardForm, mrsBranch: e.target.value })}
                            className="glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Registration / Roll No"
                            value={awardForm.mrsRegNo}
                            onChange={(e) => setAwardForm({ ...awardForm, mrsRegNo: e.target.value })}
                            className="glass-input px-3.5 py-2.5 rounded-xl text-white text-xs font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] text-pink-300 font-bold mb-1">Upload Photo from Local Drive:</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setMrsFile(e.target.files[0] || null)}
                              className="text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-pink-600 file:text-white cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Or Direct Photo Link:</label>
                            <input
                              type="url"
                              placeholder="https://..."
                              value={awardForm.mrsDirectUrl}
                              onChange={(e) => setAwardForm({ ...awardForm, mrsDirectUrl: e.target.value })}
                              className="glass-input px-3 py-1.5 rounded-xl text-white text-xs w-full"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 text-xs font-medium text-pink-200 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={awardForm.mrsAnnounced}
                            onChange={(e) => setAwardForm({ ...awardForm, mrsAnnounced: e.target.checked })}
                            className="rounded text-pink-500 focus:ring-0"
                          />
                          <span>Publish Miss Fresher Winner Reveal on Website</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 via-purple-600 to-pink-500 shadow-xl cursor-pointer text-sm"
                      >
                        Save & Announce Royalty Winners
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 5: ANNOUNCEMENTS */}
              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  <div className="glass-panel p-5 rounded-2xl border border-white/10">
                    <h4 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-400" /> Post New Announcement
                    </h4>
                    <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            required
                            placeholder="Announcement Headline"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                          />
                        </div>
                        <div>
                          <select
                            value={newAnnouncement.tag}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, tag: e.target.value })}
                            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs bg-slate-900"
                          >
                            <option value="Urgent">Urgent</option>
                            <option value="Theme">Theme</option>
                            <option value="Schedule">Schedule</option>
                            <option value="General">General</option>
                          </select>
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        required
                        placeholder="Detailed announcement broadcast..."
                        value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                        className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs resize-none"
                      />
                      <button
                        type="submit"
                        className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        Broadcast Announcement
                      </button>
                    </form>
                  </div>

                  <div className="space-y-3">
                    {announcements.map((ann) => (
                      <div key={ann._id} className="glass-card p-4 rounded-xl border border-white/10 flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-cyan-400">{ann.tag}</span>
                          <h5 className="font-bold text-sm text-white mt-0.5">{ann.title}</h5>
                          <p className="text-xs text-slate-400 mt-1">{ann.content}</p>
                        </div>
                        <button
                          onClick={() => deleteAnnouncement(ann)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: MASTER DRIVE & SOCIAL LINKS */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl">
                    <h4 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-yellow-400" /> Master Google Drive & Social Links
                    </h4>

                    <form onSubmit={handleUpdateSettings} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                          Google Drive Link for All Party Images & HD Dump *
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="https://drive.google.com/drive/folders/..."
                          value={settingsForm.googleDriveLink}
                          onChange={(e) => setSettingsForm({ ...settingsForm, googleDriveLink: e.target.value })}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          This link will be displayed across the website allowing all freshers to access the master drive folder.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                          Official Instagram Profile Link
                        </label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/gce_gaya_official"
                          value={settingsForm.instagramLink}
                          onChange={(e) => setSettingsForm({ ...settingsForm, instagramLink: e.target.value })}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-white text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-yellow-500 to-amber-600 shadow-lg cursor-pointer text-sm"
                      >
                        Save Master Links
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* In-app Toast Notification Banner */}
        {toast.show && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] pointer-events-none">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-2xl border backdrop-blur-xl ${
              toast.type === 'success' 
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-emerald-950/60' 
                : 'bg-red-950/90 text-red-300 border-red-500/50 shadow-red-950/60'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
              <span>{toast.text}</span>
            </div>
          </div>
        )}

        {/* Custom Confirmation Popup Modal */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          title={deleteConfirm.title}
          message={deleteConfirm.message}
          onConfirm={deleteConfirm.onConfirm}
          onCancel={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false, onConfirm: null }))}
          loading={deleteConfirm.loading}
        />

      </div>
    </div>
  );
};

export default AdminModal;
