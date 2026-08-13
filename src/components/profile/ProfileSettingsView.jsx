import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User, Settings, Bell, Shield, Trash2, Check, Award, Flame, Clock, CheckCircle2, Lock, Globe
} from 'lucide-react';

export const ProfileSettingsView = () => {
  const { userProfile, setUserProfile, theme, setTheme, achievements, goals } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('profile');

  const [name, setName] = useState(userProfile.name);
  const [school, setSchool] = useState(userProfile.school);
  const [grade, setGrade] = useState(userProfile.grade);
  const [bio, setBio] = useState(userProfile.bio);
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUserProfile(prev => ({
      ...prev,
      name,
      school,
      grade,
      bio
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Sub Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeSubTab === 'profile' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          Student Profile
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeSubTab === 'settings' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          App Settings & Account
        </button>
      </div>

      {activeSubTab === 'profile' ? (
        /* Profile Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Summary */}
          <div className="saas-card space-y-4 text-center">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-24 h-24 rounded-2xl mx-auto object-cover border-2 border-slate-200 dark:border-slate-700"
            />
            <div>
              <h2 className="text-card-title text-slate-900 dark:text-slate-100">{userProfile.name}</h2>
              <p className="text-small-body text-blue-600 font-medium">{userProfile.grade}</p>
              <p className="text-caption-text text-slate-500">{userProfile.school}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-caption-text text-slate-400 uppercase">Streak</span>
                <span className="block text-card-title font-bold text-orange-500">{userProfile.streak} Days</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-caption-text text-slate-400 uppercase">XP Level</span>
                <span className="block text-card-title font-bold text-purple-600">Lvl {userProfile.level}</span>
              </div>
            </div>
          </div>

          {/* Right Form & Badges */}
          <div className="lg:col-span-2 space-y-6">
            <div className="saas-card space-y-4">
              <h3 className="text-section-title text-slate-900 dark:text-slate-100">Student Profile Information</h3>

              {saved && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" /> Profile information updated!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">School / Institution</label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Grade / Track</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Bio / Goals</label>
                  <textarea
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs cursor-pointer shadow-xs"
                >
                  Save Profile
                </button>
              </form>
            </div>
          </div>

        </div>
      ) : (
        /* Settings Section */
        <div className="saas-card space-y-6 max-w-3xl">
          <h3 className="text-section-title text-slate-900 dark:text-slate-100">General Settings</h3>

          {/* Theme */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-slate-400">Theme Appearance</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-2 rounded-xl font-medium text-xs border cursor-pointer ${theme === 'light' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                Light Mode
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 rounded-xl font-medium text-xs border cursor-pointer ${theme === 'dark' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                Dark Mode
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-small-body font-semibold text-slate-900 dark:text-slate-100">Study Deadline Notifications</h4>
                <p className="text-caption-text text-slate-500">Receive alerts before homework and exam deadlines.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 cursor-pointer" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-small-body font-semibold text-slate-900 dark:text-slate-100">Sound Effects</h4>
                <p className="text-caption-text text-slate-500">Play clean chime when timer finishes.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 cursor-pointer" />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-small-body font-semibold text-red-600">Danger Zone</h4>
              <p className="text-caption-text text-slate-500">Reset local storage data to initial state.</p>
            </div>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs cursor-pointer shadow-xs"
            >
              Reset All Data
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
