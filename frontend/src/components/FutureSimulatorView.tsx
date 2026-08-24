import React, { useState } from 'react';
import { ScenarioInput, SimulationResponse, ScenarioResult } from '../types/schema';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Badge } from './common/Badge';
import { Skeleton } from './common/Skeleton';
import { Rocket, Play, CheckCircle2, ArrowRight, Layers, Plus, Trash2, ShieldAlert, Briefcase, GraduationCap } from 'lucide-react';

interface FutureSimulatorViewProps {
  simulationData: SimulationResponse | null;
  loading: boolean;
  onRunSimulation: (scenarios: ScenarioInput[]) => Promise<void>;
}

export const FutureSimulatorView: React.FC<FutureSimulatorViewProps> = ({
  simulationData,
  loading,
  onRunSimulation
}) => {
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([
    {
      name: 'Placement',
      description: 'Immediate industry software engineering roles and placement preparation.',
      weekly_hours: 15,
      focus_areas: ['DSA', 'Projects', 'Interviews']
    },
    {
      name: 'Higher Studies',
      description: 'Advanced academic specialization, exams, and research papers.',
      weekly_hours: 20,
      focus_areas: ['Research', 'Exams', 'Advanced AI']
    }
  ]);

  const [simulating, setSimulating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [newFocusInputs, setNewFocusInputs] = useState<{ [key: number]: string }>({});

  const handleUpdateScenario = (index: number, field: keyof ScenarioInput, value: any) => {
    const updated = [...scenarios];
    updated[index] = { ...updated[index], [field]: value };
    setScenarios(updated);
  };

  const handleAddFocusArea = (index: number) => {
    const text = newFocusInputs[index];
    if (!text || !text.trim()) return;
    const updated = [...scenarios];
    updated[index].focus_areas.push(text.trim());
    setScenarios(updated);
    setNewFocusInputs({ ...newFocusInputs, [index]: '' });
  };

  const handleRemoveFocusArea = (scenarioIndex: number, focusIndex: number) => {
    const updated = [...scenarios];
    updated[scenarioIndex].focus_areas = updated[scenarioIndex].focus_areas.filter((_, i) => i !== focusIndex);
    setScenarios(updated);
  };

  const handleAddScenario = () => {
    setScenarios([
      ...scenarios,
      {
        name: `Scenario ${scenarios.length + 1}`,
        description: 'Alternative career trajectory',
        weekly_hours: 15,
        focus_areas: ['Core Practice']
      }
    ]);
  };

  const handleRemoveScenario = (index: number) => {
    if (scenarios.length <= 2) return;
    setScenarios(scenarios.filter((_, i) => i !== index));
  };

  const handleSimulate = async () => {
    setSimulating(true);
    await onRunSimulation(scenarios);
    setSimulating(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 font-mono">
            Primary Decision Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-0.5 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-400" /> FUTURE SIMULATOR
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explore how different choices could shape your next few years before committing your time.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleSimulate}
          isLoading={simulating}
          icon={<Play className="w-4 h-4 fill-current" />}
        >
          {simulating ? 'Simulating...' : 'Simulate Future'}
        </Button>
      </div>

      {/* Hero Scenario Configuration Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-slate-300">Select Trajectories ({scenarios.length})</span>
          <button
            onClick={handleAddScenario}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3.5 h-3.5" /> Add Scenario
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {scenarios.map((sc, idx) => {
            const isSelected = selectedIndex === idx;
            const icon = sc.name.toLowerCase().includes('higher') ? (
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            ) : (
              <Briefcase className="w-5 h-5 text-cyan-400" />
            );

            return (
              <Card
                key={idx}
                activeBorder={isSelected}
                onClick={() => setSelectedIndex(idx)}
                className="cursor-pointer space-y-4 relative"
              >
                {scenarios.length > 2 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveScenario(idx);
                    }}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={sc.name}
                      onChange={e => handleUpdateScenario(idx, 'name', e.target.value)}
                      onClick={e => e.stopPropagation()}
                      className="bg-transparent text-base font-bold text-white focus:outline-none border-b border-transparent focus:border-indigo-500 font-heading w-full"
                    />
                    <p className="text-xs text-slate-400">{sc.description}</p>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-1" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Weekly Hours</span>
                    <span className="text-indigo-300 font-mono font-bold">{sc.weekly_hours} hrs/week</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={sc.weekly_hours}
                    onChange={e => handleUpdateScenario(idx, 'weekly_hours', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Focus Areas */}
                <div className="space-y-2" onClick={e => e.stopPropagation()}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Focus Areas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sc.focus_areas.map((fa, fIdx) => (
                      <Badge key={fIdx} variant="neutral">
                        {fa}
                        <button
                          onClick={() => handleRemoveFocusArea(idx, fIdx)}
                          className="ml-1 text-slate-500 hover:text-rose-400"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add focus area..."
                      value={newFocusInputs[idx] || ''}
                      onChange={e => setNewFocusInputs({ ...newFocusInputs, [idx]: e.target.value })}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFocusArea(idx); } }}
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <Button variant="secondary" size="sm" onClick={() => handleAddFocusArea(idx)}>
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Simulation Results Section */}
      {simulationData && (
        <div className="space-y-8 animate-fade-in pt-4">
          {/* Comparison Table / Card Hybrid */}
          <Card title="Scenario Metrics Comparison">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-3">Metric</th>
                    {simulationData.results.map((res, i) => (
                      <th key={i} className="py-3 px-3 text-right">{res.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-slate-300">
                  <MetricRow label="Goal Alignment" results={simulationData.results} keyName="goal_alignment" />
                  <MetricRow label="Skill Growth" results={simulationData.results} keyName="skill_growth" />
                  <MetricRow label="Financial Outlook" results={simulationData.results} keyName="financial_outlook" />
                  <MetricRow label="Learning Potential" results={simulationData.results} keyName="learning_potential" />
                  <MetricRow label="Workload Risk" results={simulationData.results} keyName="risk" isRisk />
                  <tr className="font-bold text-white bg-white/[0.02]">
                    <td className="py-3.5 px-3">Overall Score</td>
                    {simulationData.results.map((res, i) => (
                      <td key={i} className="py-3.5 px-3 text-right font-mono text-sm text-indigo-400">
                        {res.overall_score} / 100
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Visual Conclusion Recommendation Section */}
          <div className="bg-[#11141B] rounded-xl border-2 border-indigo-500/50 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 font-mono">
                  LIFEPILOT RECOMMENDS
                </span>
                <h3 className="text-2xl font-bold text-white font-heading mt-1 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  {simulationData.recommendation.recommended_scenario}
                </h3>
              </div>
              <Badge variant="green" className="text-xs px-3 py-1 self-start sm:self-auto">
                Optimal Path
              </Badge>
            </div>

            {/* Recommendation Justification */}
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {simulationData.recommendation.reason}
            </p>

            {/* Tradeoffs & Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Tradeoffs */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Trade-offs
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {simulationData.recommendation.tradeoffs.map((to, i) => (
                    <li key={i} className="flex items-start gap-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06]">
                      <span className="text-amber-400 font-mono font-bold">±</span>
                      <span>{to}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Numbered Next Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Actionable Next Steps
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {simulationData.recommendation.next_steps.map((ns, i) => (
                    <li key={i} className="flex items-start gap-2.5 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06]">
                      <span className="font-mono font-bold text-indigo-400">0{i + 1}</span>
                      <span>{ns}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Disclaimer */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
        <span>
          <strong>Disclaimer:</strong> Future Simulator provides trajectory modeling based on profile attributes and rule engines, not a guaranteed prediction of real-world outcomes.
        </span>
      </div>
    </div>
  );
};

// Helper metric row for table
const MetricRow: React.FC<{
  label: string;
  results: ScenarioResult[];
  keyName: keyof ScenarioResult;
  isRisk?: boolean;
}> = ({ label, results, keyName, isRisk }) => (
  <tr>
    <td className="py-3 px-3 text-slate-400">{label}</td>
    {results.map((res, i) => {
      const val = Number(res[keyName]);
      return (
        <td key={i} className="py-3 px-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="font-mono font-medium">{val}%</span>
            <div className="w-16 bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isRisk ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${val}%` }}
              />
            </div>
          </div>
        </td>
      );
    })}
  </tr>
);
