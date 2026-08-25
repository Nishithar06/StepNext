import React, { useState, useEffect } from 'react';
import { UserProfile, Commitment } from '../types/schema';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, AlertCircle, User, Compass, Zap, Target, Layers, Clock } from 'lucide-react';
import { getActiveUserId } from '../services/userService';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  onSaveProfile
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(initialProfile?.name || '');
  const [education, setEducation] = useState(initialProfile?.education || '');
  const [careerGoal, setCareerGoal] = useState(initialProfile?.career_goal || '');
  const [shortTermGoal, setShortTermGoal] = useState(initialProfile?.short_term_goal || '');
  const [financialPriority, setFinancialPriority] = useState(initialProfile?.financial_priority || 7);
  
  const [skillsStr, setSkillsStr] = useState(initialProfile?.skills?.join(', ') || '');
  const [skillsToImproveStr, setSkillsToImproveStr] = useState(initialProfile?.skills_to_improve?.join(', ') || '');
  const [interestsStr, setInterestsStr] = useState(initialProfile?.interests?.join(', ') || '');

  const [availableHours, setAvailableHours] = useState(initialProfile?.available_hours_per_day || 6.0);
  const [sleepHours, setSleepHours] = useState(initialProfile?.sleep_hours || 7.0);
  const [workload, setWorkload] = useState<string>(initialProfile?.workload || 'medium');

  const [commitments, setCommitments] = useState<Commitment[]>(initialProfile?.major_commitments || []);
  const [newCommitmentName, setNewCommitmentName] = useState('');
  const [newCommitmentHours, setNewCommitmentHours] = useState(10);

  useEffect(() => {
    if (isOpen && initialProfile) {
      setName(initialProfile.name || '');
      setEducation(initialProfile.education || '');
      setCareerGoal(initialProfile.career_goal || '');
      setShortTermGoal(initialProfile.short_term_goal || '');
      setFinancialPriority(initialProfile.financial_priority || 7);
      setSkillsStr(initialProfile.skills?.join(', ') || '');
      setSkillsToImproveStr(initialProfile.skills_to_improve?.join(', ') || '');
      setInterestsStr(initialProfile.interests?.join(', ') || '');
      setAvailableHours(initialProfile.available_hours_per_day || 6.0);
      setSleepHours(initialProfile.sleep_hours || 7.0);
      setWorkload(initialProfile.workload || 'medium');
      setCommitments(initialProfile.major_commitments || []);
    }
  }, [isOpen, initialProfile]);

  if (!isOpen) return null;

  const handleAddCommitment = () => {
    if (!newCommitmentName.trim()) return;
    setCommitments([...commitments, { name: newCommitmentName.trim(), hours_per_week: Number(newCommitmentHours) }]);
    setNewCommitmentName('');
    setNewCommitmentHours(10);
  };

  const handleRemoveCommitment = (index: number) => {
    setCommitments(commitments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeId = getActiveUserId();
      const generatedUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const profileData: UserProfile = {
        user_id: initialProfile?.user_id || activeId || generatedUserId,
        name: name.trim() || 'User',
        education: education.trim(),
        career_goal: careerGoal.trim() || 'Software Engineer',
        short_term_goal: shortTermGoal.trim(),
        financial_priority: Number(financialPriority),
        skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean),
        skills_to_improve: skillsToImproveStr.split(',').map(s => s.trim()).filter(Boolean),
        interests: interestsStr.split(',').map(s => s.trim()).filter(Boolean),
        available_hours_per_day: Number(availableHours),
        sleep_hours: Number(sleepHours),
        workload,
        regular_activities: ['Gym 3x/week', 'Coding practice'],
        major_commitments: commitments
      };

      await onSaveProfile(profileData);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      setLoading(false);
    }
  };

  const stepsList = [
    { title: 'Identity', icon: <User className="w-3.5 h-3.5" /> },
    { title: 'Aspirations', icon: <Target className="w-3.5 h-3.5" /> },
    { title: 'Skills', icon: <Layers className="w-3.5 h-3.5" /> },
    { title: 'Bandwidth', icon: <Clock className="w-3.5 h-3.5" /> },
    { title: 'Tracks', icon: <Compass className="w-3.5 h-3.5" /> },
    { title: 'Review', icon: <Check className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
      <div className="bg-white border border-black/[0.08] rounded-[28px] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5850EC]/10 text-[#5850EC] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] font-heading">
                Profile & Goals Baseline
              </h3>
              <p className="text-xs text-slate-500 font-medium">Configure parameters to personalize simulation trajectories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Progress Step Tabs */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-black/[0.06] flex items-center justify-between overflow-x-auto text-xs">
          {stepsList.map((st, idx) => {
            const stepNum = idx + 1;
            const isCurrent = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <div key={idx} className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(stepNum)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-[10px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#5850EC] text-white shadow-sm'
                      : isCompleted
                      ? 'bg-[#ECFDF5] text-[#10B981]'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <span>{stepNum}.</span>
                  <span>{st.title}</span>
                </button>
                {idx < stepsList.length - 1 && <span className="text-slate-300">›</span>}
              </div>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white text-[#0F172A]">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FFF1F2] border border-[#F43F5E]/30 text-[#F43F5E] text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#5850EC]">STEP 01</span>
                <h4 className="text-base font-bold text-[#0F172A] font-heading">Personal & Educational Background</h4>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Chen"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-black/[0.08] text-[#0F172A] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">Education Background / Major</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science (Final Year)"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-black/[0.08] text-[#0F172A] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Career & Goals */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#5850EC]">STEP 02</span>
                <h4 className="text-base font-bold text-[#0F172A] font-heading">Career Aspirations & Financial Weight</h4>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">Primary Career Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Senior AI Software Engineer"
                  value={careerGoal}
                  onChange={e => setCareerGoal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-black/[0.08] text-[#0F172A] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">Short-term Target (6 months)</label>
                <input
                  type="text"
                  placeholder="e.g. Secure high-impact software role"
                  value={shortTermGoal}
                  onChange={e => setShortTermGoal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-black/[0.08] text-[#0F172A] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-black/[0.05] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="text-[#0F172A] font-bold">Financial Priority Rating</label>
                  <span className="text-[#5850EC] font-bold font-mono">{financialPriority} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={financialPriority}
                  onChange={e => setFinancialPriority(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Skills */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#5850EC]">STEP 03</span>
                <h4 className="text-base font-bold text-[#0F172A] font-heading">Skills Profile & Growth Focus</h4>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">Current Active Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, React, FastAPI, SQL"
                  value={skillsStr}
                  onChange={e => setSkillsStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-black/[0.08] text-[#0F172A] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">Skills to Develop (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. DSA, System Design, LLM fine-tuning"
                  value={skillsToImproveStr}
                  onChange={e => setSkillsToImproveStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-black/[0.08] text-[#0F172A] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Lifestyle */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#5850EC]">STEP 04</span>
                <h4 className="text-base font-bold text-[#0F172A] font-heading">Lifestyle & Bandwidth Parameters</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">Daily Available Focus (hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={availableHours}
                    onChange={e => setAvailableHours(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-black/[0.08] text-[#0F172A] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">Sleep Hours / Night</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleepHours}
                    onChange={e => setSleepHours(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-black/[0.08] text-[#0F172A] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">Perceived Workload Intensity</label>
                <select
                  value={workload}
                  onChange={e => setWorkload(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-black/[0.08] text-[#0F172A] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                >
                  <option value="low">Low — Relaxed pace</option>
                  <option value="medium">Medium — Steady pace</option>
                  <option value="high">High — Intense schedule</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 5: Commitments */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#5850EC]">STEP 05</span>
                <h4 className="text-base font-bold text-[#0F172A] font-heading">Major Active Commitments</h4>
              </div>
              <div className="space-y-2">
                {commitments.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-black/[0.05] text-xs">
                    <span className="font-semibold text-[#0F172A]">{c.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#5850EC] font-mono font-bold">{c.hours_per_week} hrs/wk</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCommitment(i)}
                        className="text-slate-400 hover:text-[#F43F5E] font-bold text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Commitment name..."
                  value={newCommitmentName}
                  onChange={e => setNewCommitmentName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-black/[0.08] text-[#0F172A] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                />
                <input
                  type="number"
                  placeholder="Hrs/wk"
                  value={newCommitmentHours}
                  onChange={e => setNewCommitmentHours(Number(e.target.value))}
                  className="w-24 px-4 py-2.5 rounded-2xl bg-slate-50 border border-black/[0.08] text-[#0F172A] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5850EC]/30"
                />
                <Button variant="outline" size="sm" onClick={handleAddCommitment}>
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Review */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#10B981]">STEP 06</span>
                <h4 className="text-base font-bold text-[#0F172A] font-heading">Review & Confirm Profile</h4>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.06] space-y-3">
                <div className="flex justify-between border-b border-black/[0.05] pb-2">
                  <span className="text-slate-500 font-mono">Name:</span>
                  <span className="font-bold text-[#0F172A]">{name || 'User'}</span>
                </div>
                <div className="flex justify-between border-b border-black/[0.05] pb-2">
                  <span className="text-slate-500 font-mono">Career Target:</span>
                  <span className="font-bold text-[#5850EC]">{careerGoal || 'Software Engineer'}</span>
                </div>
                <div className="flex justify-between border-b border-black/[0.05] pb-2">
                  <span className="text-slate-500 font-mono">Sleep / Work Quota:</span>
                  <span className="font-bold text-[#0F172A]">{sleepHours}h sleep / {availableHours}h focus</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono">Commitment Load:</span>
                  <span className="font-bold text-purple-600 font-mono">{commitments.reduce((sum, c) => sum + c.hours_per_week, 0)} hrs/wk</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.06] bg-slate-50/80">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(step - 1)}
              className="gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : <div />}

          {step < 6 ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => setStep(step + 1)}
              className="gap-1.5 font-bold"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="gradient"
              size="sm"
              onClick={handleSubmit}
              disabled={loading}
              className="gap-1.5 font-bold shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save Profile & Re-analyze"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
