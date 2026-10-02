import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Hash,
  GraduationCap,
  Briefcase,
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  Flame,
  Search,
  Ticket,
  Eye,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import DigitalPassCard from './DigitalPassCard';
import { apiUrl } from '../config/api';

const RegistrationSection = ({ onRegisterSuccess }) => {
  const [activeTab, setActiveTab] = useState('register'); // 'register' or 'lookup'

  const [formData, setFormData] = useState({
    fullName: '',
    registrationNumber: '',
    branch: 'Computer Science & Engineering',
    role: 'Participant / Performer',
    acts: 'Mr. & Miss Kshitiz Ramp Walk',
    customAct: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [confirmedParticipant, setConfirmedParticipant] = useState(null);

  // Roll Number Lookup state
  const [lookupRoll, setLookupRoll] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');

  const branches = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'B.arch'
  ];

  const participantRoles = [
    'Participant / Performer',
    'Volunteer / Event Coordinator',
    'General Attendee & Party Pass'
  ];

  const popularActs = [
    'Mr. & Miss Kshitiz Ramp Walk',
    'Solo Dance Spotlight',
    'Solo Singing / Acoustic Melodies',
    'Live Musical Band Showdown',
    'Standup Comedy & Mimicry',
    'Poetry / Shayari / Monologue',
    'Beatboxing / Rap Battle',
    'Batch Games & Fun Quizzes',
    'Audience Cheering & Crowd Energy',
    'Other Custom Act'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    const finalActs = formData.acts === 'Other Custom Act' && formData.customAct.trim()
      ? formData.customAct.trim()
      : formData.acts;

    try {
      const res = await fetch(apiUrl('/api/participants/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          registrationNumber: formData.registrationNumber,
          branch: formData.branch,
          role: formData.role,
          acts: finalActs,
          phone: formData.phone
        })
      });
      const data = await res.json();

      if (data.success) {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.55 },
          colors: ['#00F5D4', '#8B5CF6', '#EC4899', '#FBBF24', '#3B82F6']
        });

        setStatusMsg({
          type: 'success',
          text: `🎉 Welcome ${formData.fullName}! Your VIP Fresher Entry Pass for KSHITIZ '25 is confirmed. Check out your generated pass below!`
        });

        setConfirmedParticipant(data.data);
        if (onRegisterSuccess) onRegisterSuccess();
      } else {
        setStatusMsg({
          type: 'error',
          text: data.message || 'Registration failed. Please check details.'
        });
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: 'Network error or backend offline. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupRoll.trim()) return;

    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const res = await fetch(apiUrl(`/api/participants/lookup/${encodeURIComponent(lookupRoll.trim())}`));
      const data = await res.json();

      if (data.success && data.data) {
        setLookupResult(data.data);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        setLookupError(data.message || 'No registration found with this Roll Number.');
      }
    } catch (err) {
      setLookupError('Failed to lookup pass. Please verify backend connection.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <section id="register" className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto relative z-10">

      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-3 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Official Fresher Registration & VIP Pass Hub
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-heading">
          Register for Kshitiz '25
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Batch 2025–2029 • Claim your entry pass, choose your stage act, and get instant access to the grand fresher celebration!
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 rounded-2xl glass-panel border border-white/10 shadow-lg">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'register'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Ticket className="w-4 h-4" />
            <span>New Registration & Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${activeTab === 'lookup'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Search className="w-4 h-4" />
            <span>Find / Retrieve My Pass</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: REGISTRATION & LIVE PASS ================= */}
      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Form Column */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Ticket className="w-4 h-4 text-purple-400" /> Fresher Entry Form
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                ● 100% Free Entry
              </span>
            </div>

            {statusMsg.text && (
              <div className={`p-4 rounded-2xl mb-6 text-sm flex items-start gap-3 border ${statusMsg.type === 'success'
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                  : 'bg-red-950/70 text-red-300 border-red-500/40 shadow-lg shadow-red-950/40'
                }`}>
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-snug">{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Row 1: Name & Registration Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full glass-input px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Registration No (Roll No.) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 25101001"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full glass-input px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Row 2: Branch & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Branch / Department *</span>
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full glass-input px-4 py-3 rounded-xl text-white text-sm bg-slate-900 focus:border-amber-500"
                  >
                    {branches.map((b) => (
                      <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-pink-400" />
                    <span>Role of Participant *</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full glass-input px-4 py-3 rounded-xl text-white text-sm bg-slate-900 focus:border-pink-500"
                  >
                    {participantRoles.map((r) => (
                      <option key={r} value={r} className="bg-slate-900 text-white">{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Acts Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Choose Your Act / What You Want To Do *</span>
                </label>
                <select
                  value={formData.acts}
                  onChange={(e) => setFormData({ ...formData, acts: e.target.value })}
                  className="w-full glass-input px-4 py-3 rounded-xl text-white text-sm bg-slate-900 focus:border-purple-500"
                >
                  {popularActs.map((act) => (
                    <option key={act} value={act} className="bg-slate-900 text-white">{act}</option>
                  ))}
                </select>
              </div>

              {/* Conditional Custom Act Input */}
              {formData.acts === 'Other Custom Act' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Specify Your Custom Act or Performance Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Magic Show, Instrumental Flute, Skit, etc."
                    value={formData.customAct}
                    onChange={(e) => setFormData({ ...formData, customAct: e.target.value })}
                    className="w-full glass-input px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:border-pink-500"
                  />
                </div>
              )}

              {/* Row 4: WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full glass-input px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:border-emerald-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 rounded-2xl font-black tracking-wide text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 shadow-2xl shadow-purple-600/40 hover:shadow-cyan-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 text-base cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit & Claim Kshitiz '25 Pass</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Dynamic Pass Preview Column */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full text-center mb-3">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {confirmedParticipant ? 'Your Official Confirmed Pass' : 'Live Holographic Pass Preview'}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {confirmedParticipant
                  ? 'Ready to save or show at the red carpet gates!'
                  : 'Updates in real-time as you type your credentials!'}
              </p>
            </div>

            <DigitalPassCard
              participant={confirmedParticipant || {
                fullName: formData.fullName || 'Aarav Sharma',
                registrationNumber: formData.registrationNumber || '25101001',
                branch: formData.branch,
                role: formData.role,
                acts: formData.acts === 'Other Custom Act' && formData.customAct ? formData.customAct : formData.acts,
                phone: formData.phone
              }}
              isPreview={!confirmedParticipant}
            />
          </div>

        </div>
      )}

      {/* ================= TAB 2: FIND / RETRIEVE MY PASS ================= */}
      {activeTab === 'lookup' && (
        <div className="max-w-xl mx-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              <span>Retrieve Registered Entry Pass</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Already submitted your form? Enter your College Roll Number to fetch and view your confirmed Kshitiz '25 VIP pass.
            </p>

            <form onSubmit={handleLookup} className="flex gap-2 mb-4">
              <input
                type="text"
                required
                placeholder="Enter Roll No (e.g. 25101001)"
                value={lookupRoll}
                onChange={(e) => setLookupRoll(e.target.value)}
                className="flex-1 glass-input px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer flex items-center gap-2 text-sm disabled:opacity-60"
              >
                {lookupLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </form>

            {lookupError && (
              <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{lookupError}</span>
              </div>
            )}
          </div>

          {lookupResult && (
            <div className="mt-8 flex flex-col items-center animate-fade-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-4">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Confirmed Entry Pass Verified
              </div>
              <DigitalPassCard participant={lookupResult} isPreview={false} />
            </div>
          )}
        </div>
      )}

    </section>
  );
};

export default RegistrationSection;
