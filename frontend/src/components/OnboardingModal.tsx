import React, { useState, useEffect } from 'react';
import { UserProfile, Commitment } from '../types/schema';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, AlertCircle } from 'lucide-react';

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
      const generatedUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const profileData: UserProfile = {
        user_id: initialProfile?.user_id || generatedUserId,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#E5E5DC] rounded-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] light-card-shadow">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5DC] bg-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#635BFF]" />
            <h3 className="text-base font-bold text-[#171827] font-heading">
              User Profile Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#667085] hover:text-[#171827] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Progress Indicator */}
        <div className="px-6 py-3 bg-[#FAF9F5] border-b border-[#E5E5DC] flex items-center justify-between text-xs">
          <span className="text-[#667085] font-semibold">Step {step} of 6</span>
          <div className="flex items-center gap-1.5 font-mono">
            {[1, 2, 3, 4, 5, 6].map((s, idx) => (
              <React.Fragment key={s}>
                <span className={s <= step ? 'text-[#635BFF] font-bold' : 'text-[#D1D1C7]'}>
                  {s <= step ? '●' : '○'}
                </span>
                {idx < 5 && <span className="text-[#E5E5DC]">━</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white text-[#171827]">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-[#171827] font-heading">1. Basic Information</h4>
              <div>
                <label className="block text-xs font-bold text-[#171827] mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Chen"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] placeholder:text-[#98A2B3] text-sm font-medium focus:outline-none focus:border-[#635BFF] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171827] mb-1.5">Education / Background</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] placeholder:text-[#98A2B3] text-sm font-medium focus:outline-none focus:border-[#635BFF] focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Career & Goals */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-[#171827] font-heading">2. Career Aspirations & Priority</h4>
              <div>
                <label className="block text-xs font-bold text-[#171827] mb-1.5">Primary Career Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Senior AI Engineer"
                  value={careerGoal}
                  onChange={e => setCareerGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] placeholder:text-[#98A2B3] text-sm font-medium focus:outline-none focus:border-[#635BFF] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171827] mb-1.5">Short-term Goal (6 months)</label>
                <input
                  type="text"
                  placeholder="e.g. Secure high-growth placement"
                  value={shortTermGoal}
                  onChange={e => setShortTermGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] placeholder:text-[#98A2B3] text-sm font-medium focus:outline-none focus:border-[#635BFF] focus:bg-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label className="text-[#171827] font-bold">Financial Priority Rating</label>
                  <span className="text-[#635BFF] font-bold font-mono">{financialPriority} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={financialPriority}
                  onChange={e => setFinancialPriority(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Skills */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-[#171827] font-heading">3. Skills & Focus Areas</h4>
              <div>
                <label className="block text-xs font-bold text-[#171827] mb-1.5">Current Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, React, FastAPI"
                  value={skillsStr}
                  onChange={e => setSkillsStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] placeholder:text-[#98A2B3] text-sm font-medium focus:outline-none focus:border-[#635BFF] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171827] mb-1.5">Skills to Develop</label>
                <input
                  type="text"
                  placeholder="e.g. DSA, System Design, PyTorch"
                  value={skillsToImproveStr}
                  onChange={e => setSkillsToImproveStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] placeholder:text-[#98A2B3] text-sm font-medium focus:outline-none focus:border-[#635BFF] focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Lifestyle */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-[#171827] font-heading">4. Lifestyle & Workload</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171827] mb-1.5">Daily Available Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={availableHours}
                    onChange={e => setAvailableHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] text-sm font-medium focus:outline-none focus:border-[#635BFF] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171827] mb-1.5">Sleep Hours per Night</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleepHours}
                    onChange={e => setSleepHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] text-sm font-medium focus:outline-none focus:border-[#635BFF] focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171827] mb-1.5">Perceived Workload Pace</label>
                <select
                  value={workload}
                  onChange={e => setWorkload(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] text-sm font-medium focus:outline-none focus:border-[#635BFF] focus:bg-white"
                >
                  <option value="low" className="bg-white text-[#171827]">Low — Relaxed pace</option>
                  <option value="medium" className="bg-white text-[#171827]">Medium — Steady pace</option>
                  <option value="high" className="bg-white text-[#171827]">High — Intense schedule</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 5: Commitments */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-[#171827] font-heading">5. Major Weekly Commitments</h4>
              <div className="space-y-2">
                {commitments.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-xs">
                    <span className="font-semibold text-[#171827]">{c.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#635BFF] font-mono font-bold">{c.hours_per_week} hrs/wk</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCommitment(i)}
                        className="text-[#667085] hover:text-rose-600 font-bold text-sm"
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
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] text-xs font-medium focus:outline-none focus:border-[#635BFF] focus:bg-white"
                />
                <input
                  type="number"
                  placeholder="Hrs/wk"
                  value={newCommitmentHours}
                  onChange={e => setNewCommitmentHours(Number(e.target.value))}
                  className="w-20 px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] text-[#171827] text-xs font-medium focus:outline-none focus:border-[#635BFF] focus:bg-white"
                />
                <Button variant="secondary" size="sm" onClick={handleAddCommitment}>
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Review */}
          {step === 6 && (
            <div className="space-y-4 animate-fade-in text-xs">
              <h4 className="text-sm font-bold text-[#171827] font-heading">6. Review Profile Summary</h4>
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E5DC] space-y-2.5">
                <div className="flex justify-between border-b border-[#E5E5DC] pb-2">
                  <span className="text-[#667085] font-medium">Name:</span>
                  <span className="font-bold text-[#171827]">{name || 'User'}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E5DC] pb-2">
                  <span className="text-[#667085] font-medium">Career Goal:</span>
                  <span className="font-bold text-[#635BFF]">{careerGoal || 'Software Engineer'}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E5DC] pb-2">
                  <span className="text-[#667085] font-medium">Sleep / Available:</span>
                  <span className="font-bold text-[#171827]">{sleepHours}h sleep / {availableHours}h work</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085] font-medium">Weekly Commitments:</span>
                  <span className="font-bold text-purple-700">{commitments.reduce((sum, c) => sum + c.hours_per_week, 0)} hrs/wk</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E5DC] bg-[#FAF9F5]">
          {step > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStep(step - 1)}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : <div />}

          {step < 6 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStep(step + 1)}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={loading}
              icon={<Check className="w-4 h-4" />}
            >
              Save Profile & Re-analyze
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
