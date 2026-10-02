import React, { useEffect, useState } from 'react';
import { User, Building2, BookOpen, ShieldCheck, Check, AlertCircle, Save, Award, Atom } from 'lucide-react';
import { getProfile, updateProfile } from '../services/api';
import ButtonSpinner from '../components/common/ButtonSpinner';

export default function Profile() {
  const [profile, setProfile] = useState({ full_name: '', organization: '', interests: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile();
        if (data && data.user) {
          setProfile({
            full_name: data.user.full_name || '',
            organization: data.user.organization || '',
            interests: data.user.interests || '',
          });
        }
      } catch (err) {
        setError(err.message || 'Could not load profile');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = await updateProfile(profile);
      setSuccess('Scientific profile updated successfully');
      if (data && data.user) {
        setProfile({
          full_name: data.user.full_name || '',
          organization: data.user.organization || '',
          interests: data.user.interests || '',
        });
      }
    } catch (err) {
      setError(err.message || 'Could not update profile');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="workspace-container font-sans select-none space-y-6 max-w-4xl mx-auto">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
                SCIENTIST PROFILE DOSSIER
              </h1>
              <span className="telemetry-pill text-[9px] font-bold">
                CHEMSPACE RESEARCHER ID
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
              Manage your academic credentials, laboratory institution, and chemoinformatics research specializations.
            </p>
          </div>
        </div>

        <div className="telemetry-pill text-[10px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Credential Verified</span>
        </div>
      </div>

      {/* Main Profile Dossier Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] space-y-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-inner)] border border-[var(--border-subtle)] flex items-center justify-center text-orange-500 font-mono text-xl font-black shadow-inner">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {profile.full_name || 'Anonymous Chemist'}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                {profile.organization || 'ChemSpace Research Institute'}
              </p>
            </div>
          </div>

          <span className="telemetry-pill text-[10px] text-emerald-500 font-mono font-bold">
            Status: Active Contributor
          </span>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block mb-1.5 font-bold text-[var(--text-primary)]">
              Full Legal / Academic Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Dr. Marie Curie"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-orange-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[var(--text-primary)] font-mono outline-none shadow-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-[var(--text-primary)]">
              Laboratory Organization / Institution
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
              <input
                type="text"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                placeholder="Department of Chemistry, ChemSpace Research Institute"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-orange-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-[var(--text-primary)] font-mono outline-none shadow-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-[var(--text-primary)]">
              Primary Research Interests & Specializations
            </label>
            <div className="relative">
              <textarea
                rows={4}
                value={profile.interests}
                onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                placeholder="e.g. Asymmetric Catalysis, DFT Quantum Solvers, RDKit QSAR Descriptors, FT-IR Spectroscopy, Reaction Mechanism Discovery..."
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-orange-500 rounded-xl p-3 text-xs text-[var(--text-primary)] font-mono outline-none shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-horizontal btn-orange text-xs font-bold shadow-lg px-6 py-2.5 flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? <ButtonSpinner className="text-white" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
