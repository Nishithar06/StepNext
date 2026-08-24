import React, { useState, useRef, useEffect } from 'react';
import { ScenarioInput, SimulationResponse, UserProfile, OverloadScore, ActionRoadmap, ProgressSummary, AdaptiveFutureFeedback } from '../types/schema';
import { ActionRoadmapSection } from '../components/ActionRoadmapSection';
import { ProgressIntelligenceSection } from '../components/ProgressIntelligenceSection';
import { AdaptiveFutureSection } from '../components/AdaptiveFutureSection';
import { LifePilotStatus } from '../components/LifePilotStatus';
import { fetchRoadmap, generateRoadmap, updateRoadmapAction, fetchProgress, fetchAdaptiveFuture } from '../api/client';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { 
  CheckCircle2, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  Zap, 
  Compass, 
  TrendingUp, 
  ArrowRight, 
  Sliders, 
  AlertTriangle,
  Award,
  RefreshCw,
  Cpu,
  Target
} from 'lucide-react';

export type ScenarioType = 'placement' | 'higher_studies' | 'startup';

interface SimulatorPageProps {
  simulationData: SimulationResponse | null;
  loading: boolean;
  onRunSimulation: (scenarios: ScenarioInput[], selectedScenario?: string) => Promise<void>;
  profile?: UserProfile | null;
  overloadScore?: OverloadScore | null;
}

// Circular Progress Component for Node ③ Outcome
const CircularProgress: React.FC<{ percentage: number; size?: number }> = ({ percentage, size = 68 }) => {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E5DC"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#32C6A6"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute font-mono font-extrabold text-[#171827] text-sm">
        {percentage}%
      </span>
    </div>
  );
};

// Dynamic Live Consequence Preview calculation
// Pure local evaluation function mirroring backend evaluate_scenario_deterministic 1-to-1
export function evaluateScenarioFrontend(
  profile: UserProfile | null | undefined,
  scenarioName: 'Placement' | 'Higher Studies' | 'Startup',
  investments: Record<string, number>,
  overloadScoreVal: number = 20
) {
  const cg = (profile?.career_goal || '').toLowerCase();
  const ed = (profile?.education || '').toLowerCase();
  const stg = (profile?.short_term_goal || '').toLowerCase();
  const skills = profile?.skills || [];
  const skillsToImprove = profile?.skills_to_improve || [];

  const totalInvestmentHours = Object.values(investments).reduce((a, b) => a + b, 0);

  // 1. GOAL ALIGNMENT
  let goalAlignment = 65;

  if (scenarioName === 'Higher Studies') {
    if (['research', 'scientist', 'academic', 'phd', 'ms', 'master', 'higher', 'study', 'specialist'].some(term => cg.includes(term))) {
      goalAlignment += 18;
    } else if (['cs', 'computer', 'engineering', 'b.tech', 'btech', 'bs'].some(term => ed.includes(term))) {
      goalAlignment += 8;
    }
    if ((profile?.financial_priority ?? 5) <= 5) {
      goalAlignment += 8;
    }

    const epHrs = investments.exam_prep || 0;
    const rpHrs = investments.research_papers || 0;
    const saHrs = investments.sop_applications || 0;
    const hsBonus = Math.min(24, Math.floor(rpHrs * 1.0 + epHrs * 0.7 + saHrs * 0.8));
    goalAlignment += hsBonus;

  } else if (scenarioName === 'Startup') {
    if (['founder', 'startup', 'venture', 'build', 'business', 'entrepreneur'].some(term => cg.includes(term) || stg.includes(term))) {
      goalAlignment += 18;
    }
    if (skills.some(sk => ['product', 'full stack', 'react', 'python', 'ai'].includes(sk.toLowerCase()))) {
      goalAlignment += 8;
    }

    const mdHrs = investments.market_discovery || 0;
    const pdHrs = investments.product_development || 0;
    const pnHrs = investments.pitching_networking || 0;
    const startupBonus = Math.min(22, Math.floor(mdHrs * 1.2 + pdHrs * 0.6 + pnHrs * 0.5));
    goalAlignment += startupBonus;

  } else { // Placement
    if (['software', 'developer', 'engineer', 'placement', 'corporate', 'job', 'full stack', 'lead'].some(term => cg.includes(term))) {
      goalAlignment += 16;
    }
    if ((profile?.financial_priority ?? 5) >= 6) {
      goalAlignment += 10;
    }

    const dsaHrs = investments.dsa_prep || 0;
    const projHrs = investments.portfolio_projects || 0;
    const sysHrs = investments.system_design || 0;
    const placeBonus = Math.min(22, Math.floor(dsaHrs * 0.8 + projHrs * 0.7 + sysHrs * 0.5));
    goalAlignment += placeBonus;
  }

  goalAlignment = Math.min(98, Math.max(40, goalAlignment));

  // 2. SKILL GROWTH
  let skillGrowth = 60;
  if (skillsToImprove.length > 0) {
    skillGrowth += Math.min(15, 16);
  }

  let skillGrowthBonus = 0;
  if (scenarioName === 'Higher Studies') {
    const epHrs = investments.exam_prep || 0;
    const rpHrs = investments.research_papers || 0;
    const saHrs = investments.sop_applications || 0;
    skillGrowthBonus = Math.min(28, Math.floor(rpHrs * 1.3 + epHrs * 0.5 + saHrs * 0.2));
  } else if (scenarioName === 'Startup') {
    const pdHrs = investments.product_development || 0;
    const mdHrs = investments.market_discovery || 0;
    const pnHrs = investments.pitching_networking || 0;
    skillGrowthBonus = Math.min(28, Math.floor(pdHrs * 0.9 + pnHrs * 0.8 + mdHrs * 0.6));
  } else { // Placement
    const dsaHrs = investments.dsa_prep || 0;
    const projHrs = investments.portfolio_projects || 0;
    const sysHrs = investments.system_design || 0;
    skillGrowthBonus = Math.min(28, Math.floor(projHrs * 1.1 + dsaHrs * 0.8 + sysHrs * 0.7));
  }

  skillGrowth += skillGrowthBonus;
  skillGrowth = Math.min(98, Math.max(45, skillGrowth));

  // 3. FINANCIAL OUTLOOK
  let financialOutlook = 70;
  if (scenarioName === 'Higher Studies') {
    const rpHrs = investments.research_papers || 0;
    const epHrs = investments.exam_prep || 0;
    const baseFin = 65 + (10 - (profile?.financial_priority ?? 5)) * 1.2;
    const finBonus = Math.min(16, Math.floor(rpHrs * 1.2 + epHrs * 0.4));
    financialOutlook = Math.floor(baseFin + finBonus);
  } else if (scenarioName === 'Startup') {
    const pnHrs = investments.pitching_networking || 0;
    const mdHrs = investments.market_discovery || 0;
    const pdHrs = investments.product_development || 0;
    const finBonus = Math.min(25, Math.floor(pnHrs * 1.8 + mdHrs * 0.9 + pdHrs * 0.2) + ((profile?.financial_priority ?? 5) <= 5 ? 5 : 0));
    financialOutlook = 65 + finBonus;
  } else { // Placement
    const sysHrs = investments.system_design || 0;
    const projHrs = investments.portfolio_projects || 0;
    const dsaHrs = investments.dsa_prep || 0;
    const finBonus = Math.min(15, Math.floor(sysHrs * 1.2 + projHrs * 0.6 + dsaHrs * 0.2));
    financialOutlook = 75 + Math.min(10, profile?.financial_priority ?? 5) + finBonus;
  }

  financialOutlook = Math.min(95, Math.max(35, financialOutlook));

  // 4. LEARNING POTENTIAL
  let learningPotential = 80;
  if (scenarioName === 'Higher Studies') {
    const rpHrs = investments.research_papers || 0;
    const epHrs = investments.exam_prep || 0;
    const saHrs = investments.sop_applications || 0;
    learningPotential = 82 + Math.min(16, Math.floor(rpHrs * 1.1 + epHrs * 0.5 + saHrs * 0.2));
  } else if (scenarioName === 'Startup') {
    const mdHrs = investments.market_discovery || 0;
    const pdHrs = investments.product_development || 0;
    const pnHrs = investments.pitching_networking || 0;
    learningPotential = 80 + Math.min(18, Math.floor(mdHrs * 0.9 + pdHrs * 0.6 + pnHrs * 0.4));
  } else { // Placement
    const projHrs = investments.portfolio_projects || 0;
    const sysHrs = investments.system_design || 0;
    const dsaHrs = investments.dsa_prep || 0;
    learningPotential = 75 + Math.min(20, Math.floor(projHrs * 0.9 + sysHrs * 0.8 + dsaHrs * 0.4));
  }

  learningPotential = Math.min(98, Math.max(50, learningPotential));

  // 5. WORKLOAD / RISK CALCULATION
  const maxAvailWeekly = Math.max(1.0, (profile?.available_hours_per_day ?? 6.0) * 7.0);
  const hoursRisk = Math.floor((totalInvestmentHours / maxAvailWeekly) * 25.0);

  let excessRisk = 0;
  if (totalInvestmentHours > 25.0) {
    const excessHrs = totalInvestmentHours - 25.0;
    excessRisk = Math.floor(Math.pow(excessHrs, 1.3) * 2.2);
  }

  const overloadPenalty = Math.floor(overloadScoreVal * 0.25);
  const risk = Math.min(95, Math.max(15, 15 + hoursRisk + excessRisk + overloadPenalty));

  // 6. OVERALL SCORE CALCULATION
  const positiveScore = (
    (0.35 * goalAlignment) +
    (0.25 * skillGrowth) +
    (0.20 * financialOutlook) +
    (0.20 * learningPotential)
  );
  const overall = positiveScore - (0.15 * risk);
  const overallScore = Math.min(99, Math.max(35, Math.round(overall)));

  let riskLevel = 'Low';
  if (risk > 70) riskLevel = 'Critical';
  else if (risk > 50) riskLevel = 'High';
  else if (risk > 30) riskLevel = 'Moderate';

  return {
    name: scenarioName,
    goal_alignment: goalAlignment,
    skill_growth: skillGrowth,
    financial_outlook: financialOutlook,
    learning_potential: learningPotential,
    risk,
    riskLevel,
    overall_score: overallScore,
    total_hours: totalInvestmentHours
  };
}

export interface GoalSliderDimensions {
  professionTitle: string;
  scenarioTitle: string;
  scenarioDescription: string;
  sc2Title: string;
  sc2Desc: string;
  sc3Title: string;
  sc3Desc: string;
  slider1: { label: string; badge: string };
  slider2: { label: string; badge: string };
  slider3: { label: string; badge: string };
}

export function getGoalSliderDimensions(profile?: UserProfile | null): GoalSliderDimensions {
  const rawGoal = (profile?.career_goal || profile?.short_term_goal || '').trim();
  let cleanGoal = rawGoal || 'Professional Specialist';
  const lowerGoal = cleanGoal.toLowerCase();
  
  for (const prefix of [
    "become a ", "become an ", "become ",
    "work as a ", "work as an ", "work as ",
    "pursue a career as a ", "pursue a career as an ", "pursue ",
    "be a ", "be an ", "transition to "
  ]) {
    if (lowerGoal.indexOf(prefix) === 0) {
      cleanGoal = cleanGoal.slice(prefix.length).trim();
      break;
    }
  }

  const professionTitle = cleanGoal ? cleanGoal.charAt(0).toUpperCase() + cleanGoal.slice(1) : 'Professional Specialist';
  const skillsToImprove = profile?.skills_to_improve || [];
  const skills = profile?.skills || [];

  const primarySkill = skillsToImprove[0] || skills[0] || `${professionTitle} Core Principles`;
  const secondarySkill = skillsToImprove[1] || skills[1] || `${professionTitle} Practical Deliverables`;

  const edRaw = (profile?.education || '').trim();
  const edLower = edRaw.toLowerCase();

  let sc2Title = "RELEVANT POSTGRADUATE MASTER'S PATHWAY";
  let sc2Desc = "Pursue advanced post-graduate master's degree and academic specialization based on your academic foundation.";

  if (edLower.includes('b.e.') || edLower.includes('b.e') || edLower.includes('be ') || edLower.includes('btech') || edLower.includes('b.tech') || edLower.includes('engineering')) {
    let majorName = "Engineering";
    if (edLower.includes('computer') || edLower.includes('cs') || edLower.includes('it')) majorName = "Computer Science";
    else if (edLower.includes('mechanical')) majorName = "Mechanical Engineering";
    else if (edLower.includes('civil')) majorName = "Civil Engineering";
    else if (edLower.includes('electronics') || edLower.includes('electrical')) majorName = "Electronics & Electrical";
    else if (edLower.includes('ai') || edLower.includes('machine learning')) majorName = "AI & Machine Learning";
    else if (edLower.includes('data science')) majorName = "Data Science";

    const isIntl = (profile?.career_goal || '').toLowerCase().includes('gre') || (profile?.short_term_goal || '').toLowerCase().includes('abroad');
    sc2Title = isIntl ? `MS IN ${majorName.toUpperCase()}` : `M.TECH / M.E. IN ${majorName.toUpperCase()}`;
    sc2Desc = `Pursue postgraduate specialization based on your ${edRaw} foundation, focusing on core technical mastery, GATE/GRE entrance preparation, and research papers.`;

  } else if (edLower.includes('b.sc') || edLower.includes('bsc') || edLower.includes('bachelor of science')) {
    let majorName = "Science";
    if (edLower.includes('biology')) majorName = "Biology & Life Sciences";
    else if (edLower.includes('physics')) majorName = "Physics";
    else if (edLower.includes('chemistry')) majorName = "Chemistry";
    else if (edLower.includes('computer') || edLower.includes('cs')) majorName = "Computer Science";
    else if (edLower.includes('math') || edLower.includes('statistics')) majorName = "Mathematics & Statistics";

    sc2Title = `M.SC. IN ${majorName.toUpperCase()}`;
    sc2Desc = `Pursue M.Sc. in ${majorName} based on your ${edRaw} foundation, focusing on subject mastery, postgraduate entrance exams, and research projects.`;

  } else if (edLower.includes('bca')) {
    sc2Title = "MCA / MS IN COMPUTER APPLICATIONS";
    sc2Desc = "Pursue MCA or advanced computing master's degree based on your BCA foundation, focusing on core CS fundamentals and software systems.";

  } else if (edLower.includes('b.com') || edLower.includes('bcom') || edLower.includes('commerce')) {
    let majorName = edLower.includes('finance') ? "Finance" : (edLower.includes('accounting') ? "Accounting" : "Commerce");
    sc2Title = `M.COM / MBA IN ${majorName.toUpperCase()}`;
    sc2Desc = `Pursue MBA/M.Com graduate specialization based on your ${edRaw} foundation, focusing on advanced finance/management principles and entrance prep.`;

  } else if (edLower.includes('bba') || edLower.includes('management')) {
    sc2Title = "MBA / ADVANCED MANAGEMENT STUDIES";
    sc2Desc = "Pursue MBA graduate specialization based on your BBA foundation, focusing on management principles, entrance exams, and corporate strategy.";

  } else if (edLower.includes('ba') || edLower.includes('b.a.') || edLower.includes('arts') || edLower.includes('humanities')) {
    let majorName = "Humanities";
    if (edLower.includes('psychology')) majorName = "Psychology";
    else if (edLower.includes('economics')) majorName = "Economics";
    else if (edLower.includes('sociology')) majorName = "Sociology";
    else if (edLower.includes('history')) majorName = "History";
    sc2Title = `M.A. IN ${majorName.toUpperCase()}`;
    sc2Desc = `Pursue M.A. postgraduate specialization based on your ${edRaw} foundation, focusing on academic research, entrance preparation, and publications.`;

  } else if (edLower.includes('pharm')) {
    sc2Title = "M.PHARM POSTGRADUATE STUDIES";
    sc2Desc = "Pursue M.Pharm postgraduate specialization, GPAT entrance preparation, and pharmaceutical research.";

  } else if (edLower.includes('arch')) {
    sc2Title = "M.ARCH POSTGRADUATE STUDIES";
    sc2Desc = "Pursue M.Arch postgraduate specialization, GATE/portfolio entrance preparation, and architectural thesis.";

  } else if (edLower.includes('des')) {
    sc2Title = "M.DES MASTER'S STUDIES";
    sc2Desc = "Pursue M.Des master's specialization, CEED entrance preparation, and design research.";

  } else if (edRaw) {
    sc2Title = `MASTER'S IN ${edRaw.toUpperCase()}`;
    sc2Desc = `Pursue advanced master's degree and academic specialization based on your ${edRaw} foundation.`;
  }

  let sc3Title = `INDEPENDENT ${professionTitle.toUpperCase()} CONSULTANCY / VENTURE`;
  let sc3Desc = `Establish an independent practice, consultancy business, or professional service firm in ${professionTitle}.`;

  if (lowerGoal.includes('photographer') || lowerGoal.includes('photography') || lowerGoal.includes('wildlife')) {
    sc3Title = "INDEPENDENT PHOTOGRAPHY VENTURE";
    sc3Desc = "Prioritize photography business development, client acquisition, print licensing, and conservation organization partnerships.";
  } else if (lowerGoal.includes('teacher') || lowerGoal.includes('teaching') || lowerGoal.includes('educator')) {
    sc3Title = "EDTECH & TUTORING VENTURE";
    sc3Desc = "Build an independent online tutoring platform, educational content business, or learning academy.";
  } else if (lowerGoal.includes('doctor') || lowerGoal.includes('medical') || lowerGoal.includes('surgeon')) {
    sc3Title = "HEALTHTECH & PRIVATE PRACTICE VENTURE";
    sc3Desc = "Establish an independent medical practice, clinic management model, or healthcare technology venture.";
  } else if (lowerGoal.includes('lawyer') || lowerGoal.includes('legal') || lowerGoal.includes('attorney')) {
    sc3Title = "INDEPENDENT LEGAL FIRM VENTURE";
    sc3Desc = "Establish an independent law consultancy, legal advisory practice, or mediation firm.";
  } else if (lowerGoal.includes('designer') || lowerGoal.includes('ux') || lowerGoal.includes('ui')) {
    sc3Title = "DESIGN STUDIO & AGENCY VENTURE";
    sc3Desc = "Build an independent design studio, client branding agency, or digital product consultancy.";
  } else if (lowerGoal.includes('software') || lowerGoal.includes('developer') || lowerGoal.includes('engineer')) {
    sc3Title = "TECH STARTUP & PRODUCT VENTURE";
    sc3Desc = "Prioritize product MVP development, tech discovery, and startup pitch deck preparation.";
  }

  return {
    professionTitle,
    scenarioTitle: `CAREER EXECUTION (${professionTitle.toUpperCase()})`,
    scenarioDescription: `Prioritize career entry, practical deliverables, and professional growth as a ${professionTitle}.`,
    sc2Title,
    sc2Desc,
    sc3Title,
    sc3Desc,
    slider1: {
      label: `Master ${primarySkill} & ${professionTitle} Fundamentals`,
      badge: '+ HIGH IMPACT'
    },
    slider2: {
      label: `${professionTitle} Portfolio & ${secondarySkill}`,
      badge: '+ HIGH IMPACT'
    },
    slider3: {
      label: `${professionTitle} Career Prep & Peer Reviews`,
      badge: '+ MODERATE IMPACT'
    }
  };
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class SimulatorErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[SimulatorErrorBoundary] Caught rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border-2 border-red-500 rounded-2xl space-y-4 max-w-4xl mx-auto my-8">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <div>
              <h2 className="text-lg font-bold">Simulator Page Rendering Exception</h2>
              <p className="text-xs font-mono">{this.state.error?.toString()}</p>
            </div>
          </div>
          <p className="text-xs text-red-600">
            An unexpected error occurred while rendering the Future Simulator UI.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry Rendering
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SimulatorPageContent: React.FC<SimulatorPageProps> = ({
  simulationData,
  loading,
  onRunSimulation,
  profile,
  overloadScore
}) => {
  // Step 1: Explicit scenario selection state
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('placement');
  const [simulating, setSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Roadmap State
  const [roadmap, setRoadmap] = useState<ActionRoadmap | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState<boolean>(false);

  // Progress Intelligence State
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [progressLoading, setProgressLoading] = useState<boolean>(false);

  // Adaptive Future Feedback State
  const [adaptiveFuture, setAdaptiveFuture] = useState<AdaptiveFutureFeedback | null>(null);
  const [adaptiveFutureLoading, setAdaptiveFutureLoading] = useState<boolean>(false);

  const configRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Progress Intelligence refresh helper with diagnostic logs
  const refreshProgressAndAdaptive = async (uid: string) => {
    console.log(`[CheckIn] PROGRESS_REFRESH_STARTED: user_id=${uid}`);
    try {
      const [prog, af] = await Promise.all([
        fetchProgress(uid),
        fetchAdaptiveFuture(uid)
      ]);
      if (prog) {
        const count = prog.weekly_history_trend ? prog.weekly_history_trend.length : 0;
        console.log(`[CheckIn] SUBMIT_SUCCESS`);
        console.log(`[CheckIn] PROGRESS_REFRESH_SUCCESS: user_id=${uid}`);
        console.log(`[CheckIn] CHECKIN_COUNT=${count}`);
        setProgress(prog);
        console.log(`[CheckIn] PROGRESS_STATE_UPDATED`);
      }
      if (af) {
        setAdaptiveFuture(af);
      }
    } catch (err) {
      console.warn('[CheckIn] PROGRESS_REFRESH_ERROR:', err);
    }
  };

  // Load existing roadmap, progress intelligence, & adaptive future feedback for active user
  useEffect(() => {
    const uid = profile?.user_id || localStorage.getItem('stepnext_active_user_id');
    if (!uid) return;

    let isMounted = true;
    setRoadmapLoading(true);
    setProgressLoading(true);
    setAdaptiveFutureLoading(true);

    fetchRoadmap(uid)
      .then(rm => {
        if (isMounted && rm) {
          setRoadmap(rm);
        }
      })
      .catch(err => console.warn('Roadmap fetch notice:', err))
      .finally(() => {
        if (isMounted) setRoadmapLoading(false);
      });

    refreshProgressAndAdaptive(uid).finally(() => {
      if (isMounted) {
        setProgressLoading(false);
        setAdaptiveFutureLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [profile?.user_id, simulationData?.id, roadmap?.id]);

  const handleToggleAction = async (actionId: string) => {
    const uid = profile?.user_id || localStorage.getItem('stepnext_active_user_id');
    if (!uid || !roadmap) return;

    // Optimistic UI update
    setRoadmap(prev => {
      if (!prev) return null;
      return {
        ...prev,
        weekly_actions: prev.weekly_actions.map(act =>
          act.id === actionId ? { ...act, status: act.status === 'completed' ? 'not_started' : 'completed' } : act
        )
      };
    });

    try {
      const updated = await updateRoadmapAction(uid, actionId);
      setRoadmap(updated);
      await refreshProgressAndAdaptive(uid);
    } catch (err) {
      console.warn('Action toggle error:', err);
    }
  };

  // Step 2: Scenario-specific investment controls (Generic Dimension Abstraction)
  // Path 1 (Career Execution) controls
  const [path1Dim1Hours, setPath1Dim1Hours] = useState<number>(8);
  const [path1Dim2Projects, setPath1Dim2Projects] = useState<number>(2);
  const [path1Dim3Hours, setPath1Dim3Hours] = useState<number>(4);

  // Higher Studies controls
  const [examPrepHours, setExamPrepHours] = useState<number>(10);
  const [researchHours, setResearchHours] = useState<number>(6);
  const [sopAppHours, setSopAppHours] = useState<number>(4);

  // Startup controls
  const [productDevHours, setProductDevHours] = useState<number>(12);
  const [marketResearchHours, setMarketResearchHours] = useState<number>(5);
  const [pitchNetHours, setPitchNetHours] = useState<number>(3);

  // Live evaluation of current slider states using 1-to-1 deterministic backend formula with generic adapter
  const placementLive = evaluateScenarioFrontend(
    profile,
    'Placement',
    { dsa_prep: path1Dim1Hours, portfolio_projects: path1Dim2Projects * 3, system_design: path1Dim3Hours },
    overloadScore?.total_score || 20
  );
  const hsLive = evaluateScenarioFrontend(profile, 'Higher Studies', { exam_prep: examPrepHours, research_papers: researchHours, sop_applications: sopAppHours }, overloadScore?.total_score || 20);
  const startupLive = evaluateScenarioFrontend(profile, 'Startup', { product_development: productDevHours, market_discovery: marketResearchHours, pitching_networking: pitchNetHours }, overloadScore?.total_score || 20);

  const dims = getGoalSliderDimensions(profile);

  const getPreviewMetrics = () => {
    if (selectedScenario === 'higher_studies') {
      const baseReadiness = 65;
      const finalReadiness = hsLive.goal_alignment;
      const readinessGain = finalReadiness - baseReadiness;
      return {
        title: 'Higher Studies Readiness',
        before: baseReadiness,
        after: finalReadiness,
        gain: readinessGain,
        totalHours: hsLive.total_hours,
        eval: hsLive,
        focusSummary: `Exam (${examPrepHours}h) + Research (${researchHours}h) + SOP (${sopAppHours}h)`
      };
    } else if (selectedScenario === 'startup') {
      const baseReadiness = 65;
      const finalReadiness = startupLive.goal_alignment;
      const readinessGain = finalReadiness - baseReadiness;
      return {
        title: 'Startup Execution Readiness',
        before: baseReadiness,
        after: finalReadiness,
        gain: readinessGain,
        totalHours: startupLive.total_hours,
        eval: startupLive,
        focusSummary: `Product (${productDevHours}h) + Market (${marketResearchHours}h) + Pitch (${pitchNetHours}h)`
      };
    } else {
      // Career Execution / Placement
      const baseReadiness = 65;
      const finalReadiness = placementLive.goal_alignment;
      const readinessGain = finalReadiness - baseReadiness;
      return {
        title: `${dims.professionTitle} Career Readiness`,
        before: baseReadiness,
        after: finalReadiness,
        gain: readinessGain,
        totalHours: placementLive.total_hours,
        eval: placementLive,
        focusSummary: `${dims.slider1.label} (${path1Dim1Hours}h) + ${dims.slider2.label} (${path1Dim2Projects}/mo) + ${dims.slider3.label} (${path1Dim3Hours}h)`
      };
    }
  };

  const preview = getPreviewMetrics();

  const handleSimulate = async () => {
    if (simulating) return;
    setSimulating(true);
    setErrorMsg(null);
    setSimulationStep(1);

    setTimeout(() => setSimulationStep(2), 400);
    setTimeout(() => setSimulationStep(3), 800);
    setTimeout(() => setSimulationStep(4), 1200);

    const placementScenario: ScenarioInput = {
      name: 'Placement',
      description: dims.scenarioDescription,
      weekly_hours: path1Dim1Hours + path1Dim3Hours + (path1Dim2Projects * 3),
      focus_areas: [
        `${dims.slider1.label} (${path1Dim1Hours}h/wk)`,
        `${dims.slider2.label} (${path1Dim2Projects}/mo)`,
        `${dims.slider3.label} (${path1Dim3Hours}h/wk)`
      ],
      investments: {
        dsa_prep: path1Dim1Hours,
        portfolio_projects: path1Dim2Projects * 3,
        system_design: path1Dim3Hours
      }
    };

    const higherStudiesScenario: ScenarioInput = {
      name: 'Higher Studies',
      description: 'Prioritize entrance exams (GRE/GATE/CAT), academic research, and graduate applications.',
      weekly_hours: examPrepHours + researchHours + sopAppHours,
      focus_areas: [
        `Exam Prep (${examPrepHours}h/wk)`,
        `Research (${researchHours}h/wk)`,
        `SOP & Applications (${sopAppHours}h/wk)`
      ],
      investments: {
        exam_prep: examPrepHours,
        research_papers: researchHours,
        sop_applications: sopAppHours
      }
    };

    const startupScenario: ScenarioInput = {
      name: 'Startup',
      description: 'Prioritize product prototyping, market discovery, and early venture building.',
      weekly_hours: productDevHours + marketResearchHours + pitchNetHours,
      focus_areas: [
        `Product Dev (${productDevHours}h/wk)`,
        `Market Research (${marketResearchHours}h/wk)`,
        `Pitching (${pitchNetHours}h/wk)`
      ],
      investments: {
        product_development: productDevHours,
        market_discovery: marketResearchHours,
        pitching_networking: pitchNetHours
      }
    };

    let orderedScenarios: ScenarioInput[] = [];
    let selectedNameString = 'Placement';

    if (selectedScenario === 'higher_studies') {
      selectedNameString = 'Higher Studies';
      orderedScenarios = [higherStudiesScenario, placementScenario, startupScenario];
    } else if (selectedScenario === 'startup') {
      selectedNameString = 'Startup';
      orderedScenarios = [startupScenario, placementScenario, higherStudiesScenario];
    } else {
      selectedNameString = 'Placement';
      orderedScenarios = [placementScenario, higherStudiesScenario, startupScenario];
    }

    // Diagnostic logging for exact payload proof
    orderedScenarios.forEach((sc) => {
      if (sc.name.toLowerCase().includes('startup')) {
        console.log(`[Simulator] SCENARIO_INPUT:\nname=${sc.name}\nproduct_development=${sc.investments?.product_development ?? 0}\nmarket_discovery=${sc.investments?.market_discovery ?? 0}\npitching_networking=${sc.investments?.pitching_networking ?? 0}\ntotal_investment_hours=${sc.weekly_hours}`);
      } else if (sc.name.toLowerCase().includes('higher') || sc.name.toLowerCase().includes('study')) {
        console.log(`[Simulator] SCENARIO_INPUT:\nname=${sc.name}\nexam_prep=${sc.investments?.exam_prep ?? 0}\nresearch_papers=${sc.investments?.research_papers ?? 0}\nsop_applications=${sc.investments?.sop_applications ?? 0}\ntotal_investment_hours=${sc.weekly_hours}`);
      } else {
        console.log(`[Simulator] SCENARIO_INPUT:\nname=${sc.name}\ndsa_prep=${sc.investments?.dsa_prep ?? 0}\nportfolio_projects=${sc.investments?.portfolio_projects ?? 0}\nsystem_design=${sc.investments?.system_design ?? 0}\ntotal_investment_hours=${sc.weekly_hours}`);
      }
    });

    try {
      await onRunSimulation(orderedScenarios, selectedNameString);
      const uid = profile?.user_id || localStorage.getItem('stepnext_active_user_id');
      if (uid) {
        try {
          const rm = await generateRoadmap(uid);
          setRoadmap(rm);
        } catch (rmErr) {
          console.warn('Roadmap generation notice:', rmErr);
        }
      }
      setTimeout(() => {
        boardRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to complete scenario simulation.');
    } finally {
      setSimulating(false);
      setSimulationStep(0);
    }
  };

  const handleAdjustScenarios = () => {
    configRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const engineUsed = simulationData?.recommendation?.engine_used;
  const isGeminiUsed = engineUsed && engineUsed.includes('gemini');
  const recommendedName = simulationData?.recommendation?.recommended_scenario;  
  const allLive = [placementLive, hsLive, startupLive];
  const topLive = [...allLive].sort((a, b) => b.overall_score - a.overall_score)[0];
  const currentLeaderName = simulationData?.recommendation?.recommended_scenario || topLive.name;

  const activeSelectedScenario = (() => {
    if (selectedScenario === 'higher_studies') return hsLive;
    if (selectedScenario === 'startup') return startupLive;
    return placementLive;
  })();

  const activeResult = (() => {
    if (simulationData && simulationData.results && simulationData.results.length > 0) {
      const matched = simulationData.results.find(r => {
        const name = r.name.toLowerCase();
        if (selectedScenario === 'higher_studies') {
          return name.includes('higher') || name.includes('study') || name.includes('specialization');
        }
        if (selectedScenario === 'startup') {
          return name.includes('startup') || name.includes('venture') || name.includes('independent');
        }
        return name.includes('placement') || name.includes('career') || name.includes('execution');
      });
      if (matched) return matched;
    }
    return activeSelectedScenario;
  })();

  console.log('[LifePilot] CONTEXT_LOAD_STARTED: activeUserId=', profile?.user_id || 'demo_user');
  console.log('[LifePilot] STATUS_READY: simulation=', !!simulationData, 'roadmap=', !!roadmap, 'progress=', !!progress, 'adaptive=', !!adaptiveFuture);

  return (
    <div id="section-simulator" className="scroll-mt-24 space-y-10 animate-fade-in max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 min-w-0">
      {/* 0. LIFEPILOT SYSTEM INTELLIGENCE STATUS SUMMARY BANNER */}
      <LifePilotStatus
        simulationData={simulationData}
        roadmap={roadmap}
        progress={progress}
        adaptiveFuture={adaptiveFuture}
        onNavigateToSection={handleAdjustScenarios}
      />

      {/* 1. HERO INTRO */}
      <section className="bg-gradient-to-r from-white via-[#FAF9F5] to-[#F0EEFF] border border-[#635BFF]/30 rounded-[28px] p-6 lg:p-8 light-card-shadow space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#635BFF]" /> LIFEPILOT
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#32C6A6]/10 border border-[#32C6A6]/30 text-[10px] font-mono font-bold text-[#219B81]">
            <span className="w-2 h-2 rounded-full bg-[#32C6A6] animate-pulse" />
            DECISION ENGINE ACTIVE
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-[#171827] font-heading leading-tight">
          See where your choices lead.
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] max-w-2xl leading-relaxed">
          Compare possible futures, understand the tradeoffs, and turn the strongest path into an executable plan. Adjust sliders below to see live consequences instantly.
        </p>
      </section>

      {/* WHY LIFEPILOT IS DIFFERENT — THE CLOSED DECISION LOOP */}
      <section className="bg-gradient-to-r from-[#FAF9F5] to-white border border-[#E5E5DC] rounded-[24px] p-5 light-card-shadow space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E5E5DC] pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#635BFF]" /> WHY LIFEPILOT IS DIFFERENT
          </span>
          <span className="text-[10px] font-mono font-bold text-[#635BFF] bg-[#635BFF]/10 px-3 py-1 rounded-full border border-[#635BFF]/20">
            DECIDE → SIMULATE → ACT → CHECK IN → LEARN → ADAPT
          </span>
        </div>
        <p className="text-xs text-[#667085] leading-relaxed">
          Standard career tools stop at one-off suggestions. <strong className="text-[#171827]">LifePilot</strong> models your choices in real time, turns recommendations into executable 90-day roadmaps, tracks real weekly execution, and dynamically adapts when workload or trajectory demands it.
        </p>
      </section>

      {/* ERROR STATE CARD */}
      {errorMsg && (
        <Card level={2} className="border-l-4 border-l-[#FF7A6B] bg-[#FF7A6B]/5 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-[#FF7A6B] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-[#171827]">Simulation Error</h4>
              <p className="text-xs text-[#667085]">{errorMsg}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleSimulate} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Try Again
          </Button>
        </Card>
      )}

      {/* 2. SCENARIO COMPARISON (CLEAN COMPARISON ROW WITH LEADER BADGE) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
            1. SCENARIO COMPARISON — SELECT TARGET TRAJECTORY
          </h2>
          <span className="text-xs text-[#667085] font-mono">3 Scenarios Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Path 1: Placement */}
          {(() => {
            const isSelected = selectedScenario === 'placement';
            const isLeader = currentLeaderName.toLowerCase().includes('placement') || currentLeaderName.toLowerCase().includes('career');
            const score = simulationData?.results?.find(r => r.name.toLowerCase().includes('placement') || r.name.toLowerCase().includes('career'))?.overall_score ?? placementLive.overall_score;

            return (
              <Card
                level={2}
                activeBorder={isSelected}
                onClick={() => setSelectedScenario('placement')}
                className={`cursor-pointer space-y-4 relative group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-[#635BFF] bg-[#635BFF]/5' : ''
                } ${isLeader ? 'border-2 border-[#32C6A6] shadow-sm' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#635BFF]/10 text-[#635BFF]">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isLeader && (
                      <Badge variant="green" className="text-[10px] font-bold">
                        ★ LEADING / BEST FIT
                      </Badge>
                    )}
                    <Badge variant={isSelected ? 'indigo' : 'neutral'}>
                      {isSelected ? 'Selected ✓' : 'Select'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#171827] font-heading">{dims.scenarioTitle}</h3>
                    <span className="text-lg font-extrabold font-mono text-[#171827]">
                      {score} / 100
                    </span>
                  </div>
                  <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                    {dims.scenarioDescription}
                  </p>
                </div>
              </Card>
            );
          })()}

          {/* Path 2: Higher Studies */}
          {(() => {
            const isSelected = selectedScenario === 'higher_studies';
            const isLeader = currentLeaderName.toLowerCase().includes('higher') || currentLeaderName.toLowerCase().includes('study') || currentLeaderName.toLowerCase().includes('specialization');
            const score = simulationData?.results?.find(r => r.name.toLowerCase().includes('higher') || r.name.toLowerCase().includes('study') || r.name.toLowerCase().includes('specialization'))?.overall_score ?? hsLive.overall_score;

            return (
              <Card
                level={2}
                activeBorder={isSelected}
                onClick={() => setSelectedScenario('higher_studies')}
                className={`cursor-pointer space-y-4 relative group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-[#635BFF] bg-[#635BFF]/5' : ''
                } ${isLeader ? 'border-2 border-[#32C6A6] shadow-sm' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#32C6A6]/10 text-[#219B81]">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isLeader && (
                      <Badge variant="green" className="text-[10px] font-bold">
                        ★ LEADING / BEST FIT
                      </Badge>
                    )}
                    <Badge variant={isSelected ? 'indigo' : 'neutral'}>
                      {isSelected ? 'Selected ✓' : 'Select'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#171827] font-heading">{dims.sc2Title}</h3>
                    <span className="text-lg font-extrabold font-mono text-[#171827]">
                      {score} / 100
                    </span>
                  </div>
                  <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                    {dims.sc2Desc}
                  </p>
                </div>
              </Card>
            );
          })()}

          {/* Path 3: Startup / Venture */}
          {(() => {
            const isSelected = selectedScenario === 'startup';
            const isLeader = currentLeaderName.toLowerCase().includes('startup') || currentLeaderName.toLowerCase().includes('venture') || currentLeaderName.toLowerCase().includes('independent');
            const score = simulationData?.results?.find(r => r.name.toLowerCase().includes('startup') || r.name.toLowerCase().includes('venture') || r.name.toLowerCase().includes('independent'))?.overall_score ?? startupLive.overall_score;

            return (
              <Card
                level={2}
                activeBorder={isSelected}
                onClick={() => setSelectedScenario('startup')}
                className={`cursor-pointer space-y-4 relative group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-[#635BFF] bg-[#635BFF]/5' : ''
                } ${isLeader ? 'border-2 border-[#32C6A6] shadow-sm' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#FF7A6B]/10 text-[#FF7A6B]">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {isLeader && (
                      <Badge variant="green" className="text-[10px] font-bold">
                        ★ LEADING / BEST FIT
                      </Badge>
                    )}
                    <Badge variant={isSelected ? 'indigo' : 'neutral'}>
                      {isSelected ? 'Selected ✓' : 'Select'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#171827] font-heading">{dims.sc3Title}</h3>
                    <span className="text-lg font-extrabold font-mono text-[#171827]">
                      {score} / 100
                    </span>
                  </div>
                  <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                    {dims.sc3Desc}
                  </p>
                </div>
              </Card>
            );
          })()}
        </div>
      </section>

      {/* 3. INVESTMENT CONTROLS & LIVE CONSEQUENCE PANEL (DESKTOP SPLIT LAYOUT) */}
      <section ref={configRef} className="space-y-4 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
          2. CONFIGURE WEEKLY INVESTMENT ({activeResult.name.toUpperCase()})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Investment Sliders */}
          <Card level={2} className="md:col-span-7 space-y-5">
            <h3 className="text-sm font-bold text-[#171827] font-heading border-b border-[#E5E5DC] pb-3 flex items-center justify-between">
              <span>INVESTMENT SLIDERS</span>
              <Sliders className="w-4 h-4 text-[#635BFF]" />
            </h3>

            {/* CAREER EXECUTION / PLACEMENT CONTROLS */}
            {selectedScenario === 'placement' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#171827]">{dims.slider1.label}</span>
                    <Badge variant="green">{dims.slider1.badge}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#667085]">0</span>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={path1Dim1Hours}
                      onChange={e => setPath1Dim1Hours(Number(e.target.value))}
                      className="w-full cursor-pointer accent-[#635BFF]"
                    />
                    <span className="text-xs font-mono font-bold text-[#635BFF] shrink-0">{path1Dim1Hours} hrs/week</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#E5E5DC]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#171827]">{dims.slider2.label}</span>
                    <Badge variant="indigo">{dims.slider2.badge}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#667085]">0</span>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={path1Dim2Projects}
                      onChange={e => setPath1Dim2Projects(Number(e.target.value))}
                      className="w-full cursor-pointer accent-[#635BFF]"
                    />
                    <span className="text-xs font-mono font-bold text-[#635BFF] shrink-0">{path1Dim2Projects} / month ({path1Dim2Projects * 3}h/wk)</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#E5E5DC]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#171827]">{dims.slider3.label}</span>
                    <Badge variant="indigo">{dims.slider3.badge}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#667085]">0</span>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={path1Dim3Hours}
                      onChange={e => setPath1Dim3Hours(Number(e.target.value))}
                      className="w-full cursor-pointer accent-[#635BFF]"
                    />
                    <span className="text-xs font-mono font-bold text-[#635BFF] shrink-0">{path1Dim3Hours} hrs/week</span>
                  </div>
                </div>
              </>
            )}

            {/* HIGHER STUDIES CONTROLS */}
            {selectedScenario === 'higher_studies' && (() => {
              const edLower = (profile?.education || '').toLowerCase();
              const slider1Label = edLower.includes('b.sc') || edLower.includes('bsc')
                ? 'Core Subject Mastery (B.Sc. Foundation)'
                : edLower.includes('b.tech') || edLower.includes('engineering')
                ? 'Engineering Fundamentals & Core Technical Mastery'
                : edLower.includes('b.com') || edLower.includes('bba')
                ? 'Advanced Business & Finance Principles'
                : edLower.includes('ba')
                ? 'Humanities & Social Science Research'
                : 'Core Subject Mastery';

              const slider2Label = edLower.includes('b.sc') || edLower.includes('bsc')
                ? 'M.Sc. / Postgraduate Entrance Preparation'
                : edLower.includes('b.tech') || edLower.includes('engineering')
                ? 'GATE / GRE Exam Preparation'
                : edLower.includes('b.com') || edLower.includes('bba')
                ? 'CAT / MBA Entrance Preparation'
                : edLower.includes('ba')
                ? 'MA Entrance Preparation'
                : 'Postgraduate Entrance Preparation';

              const slider3Label = 'Research & Academic Projects';

              return (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#171827]">{slider1Label}</span>
                      <Badge variant="green">+ HIGH IMPACT</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#667085]">0</span>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={examPrepHours}
                        onChange={e => setExamPrepHours(Number(e.target.value))}
                        className="w-full cursor-pointer accent-[#32C6A6]"
                      />
                      <span className="text-xs font-mono font-bold text-[#32C6A6] shrink-0">{examPrepHours} hrs/week</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E5E5DC]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#171827]">{slider2Label}</span>
                      <Badge variant="indigo">+ HIGH IMPACT</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#667085]">0</span>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        value={researchHours}
                        onChange={e => setResearchHours(Number(e.target.value))}
                        className="w-full cursor-pointer accent-[#32C6A6]"
                      />
                      <span className="text-xs font-mono font-bold text-[#32C6A6] shrink-0">{researchHours} hrs/week</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E5E5DC]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#171827]">{slider3Label}</span>
                      <Badge variant="indigo">+ MODERATE IMPACT</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#667085]">0</span>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={sopAppHours}
                        onChange={e => setSopAppHours(Number(e.target.value))}
                        className="w-full cursor-pointer accent-[#32C6A6]"
                      />
                      <span className="text-xs font-mono font-bold text-[#32C6A6] shrink-0">{sopAppHours} hrs/week</span>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* STARTUP CONTROLS */}
            {selectedScenario === 'startup' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#171827]">Product Development & Prototyping</span>
                    <Badge variant="green">+ HIGH IMPACT</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#667085]">0</span>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={productDevHours}
                      onChange={e => setProductDevHours(Number(e.target.value))}
                      className="w-full cursor-pointer accent-[#FF7A6B]"
                    />
                    <span className="text-xs font-mono font-bold text-[#FF7A6B] shrink-0">{productDevHours} hrs/week</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#E5E5DC]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#171827]">Market Discovery & Customer Research</span>
                    <Badge variant="amber">+ HIGH IMPACT</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#667085]">0</span>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={marketResearchHours}
                      onChange={e => setMarketResearchHours(Number(e.target.value))}
                      className="w-full cursor-pointer accent-[#FF7A6B]"
                    />
                    <span className="text-xs font-mono font-bold text-[#FF7A6B] shrink-0">{marketResearchHours} hrs/week</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#E5E5DC]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#171827]">Pitching & Investor Networking</span>
                    <Badge variant="indigo">+ MODERATE IMPACT</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#667085]">0</span>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={pitchNetHours}
                      onChange={e => setPitchNetHours(Number(e.target.value))}
                      className="w-full cursor-pointer accent-[#FF7A6B]"
                    />
                    <span className="text-xs font-mono font-bold text-[#FF7A6B] shrink-0">{pitchNetHours} hrs/week</span>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Right Column: Premium Live Consequence Panel */}
          <div className="md:col-span-5 bg-gradient-to-b from-white to-[#FAF9F5] border-2 border-[#635BFF] rounded-[24px] p-6 light-card-shadow space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] font-mono">
                  LIVE CONSEQUENCE DASHBOARD
                </span>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  preview.eval.risk > 70
                    ? 'text-[#D84B3B] bg-[#FF7A6B]/15 border-[#FF7A6B]/30'
                    : preview.eval.risk > 50
                    ? 'text-amber-700 bg-amber-500/15 border-amber-500/30'
                    : 'text-[#219B81] bg-[#32C6A6]/15 border-[#32C6A6]/30'
                }`}>
                  Risk: {preview.eval.riskLevel} ({preview.eval.risk}%)
                </span>
              </div>

              {/* Big Score Header */}
              <div className="text-center py-2 bg-[#635BFF]/5 rounded-2xl border border-[#635BFF]/20 space-y-0.5">
                <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono block">
                  ESTIMATED OVERALL ALIGNMENT
                </span>
                <div className="text-4xl font-extrabold text-[#171827] font-mono">
                  {preview.eval.overall_score} <span className="text-sm font-normal text-[#667085]">/ 100</span>
                </div>
                <span className="text-[11px] text-[#635BFF] font-semibold">
                  {preview.title} ({preview.after}% Goal Fit)
                </span>
              </div>

              {/* 3-Column Dimension Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-[#E5E5DC] space-y-0.5">
                  <span className="text-[9px] font-bold text-[#667085] uppercase tracking-wider block">Goal Fit</span>
                  <span className="text-sm font-mono font-extrabold text-[#635BFF]">{preview.eval.goal_alignment}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E5E5DC] space-y-0.5">
                  <span className="text-[9px] font-bold text-[#667085] uppercase tracking-wider block">Skill Growth</span>
                  <span className="text-sm font-mono font-extrabold text-[#32C6A6]">{preview.eval.skill_growth}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E5E5DC] space-y-0.5">
                  <span className="text-[9px] font-bold text-[#667085] uppercase tracking-wider block">Financial</span>
                  <span className="text-sm font-mono font-extrabold text-[#F5C96A]">{preview.eval.financial_outlook}%</span>
                </div>
              </div>

              {/* Strengths vs Tradeoffs Breakdown */}
              <div className="space-y-2 pt-1 border-t border-[#E5E5DC]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] block">
                  STRENGTHS & TRADEOFFS
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-[#219B81]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Strong goal fit ({preview.eval.goal_alignment}%) and skill growth potential</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#219B81]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Learning potential estimated at {preview.eval.learning_potential}%</span>
                  </div>
                  <div className={`flex items-center gap-2 ${preview.eval.risk > 50 ? 'text-[#D84B3B]' : 'text-[#667085]'}`}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{preview.totalHours} hrs/wk investment ({preview.eval.riskLevel} workload risk)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSimulate}
                isLoading={simulating}
                icon={<Sparkles className="w-4 h-4" />}
                className="w-full justify-center py-3.5 font-bold shadow-lg shadow-[#635BFF]/25 hover:shadow-xl hover:shadow-[#635BFF]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                {simulating ? 'Evaluating scenario...' : `✦ RUN FULL SIMULATION`}
              </Button>
              <p className="text-[10px] text-center text-[#667085] font-mono">
                Lock in these assumptions and generate your full decision analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SIMULATION ANIMATION */}
      {simulating && (
        <Card level={3} className="p-8 text-center space-y-5 animate-pulse border-2 border-[#635BFF]">
          <Sparkles className="w-10 h-10 text-[#635BFF] mx-auto animate-spin" />
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-[#171827] font-heading uppercase tracking-wider">
              ANALYZING YOUR FUTURE...
            </h3>
            <p className="text-xs text-[#667085]">
              {isGeminiUsed ? 'AI analysis powered by Gemini 3.6 Flash' : 'Running deterministic constraint evaluation'}
            </p>
          </div>
        </Card>
      )}

      {/* 5. RECOMMENDATION & DECISION ANALYSIS */}
      <section ref={boardRef} className="space-y-4 pt-4 border-t border-[#E5E5DC]">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
          3. DECISION & RECOMMENDATION ANALYSIS
        </h2>

        <div className="bg-white rounded-[28px] border-2 border-[#635BFF] p-6 lg:p-8 light-card-shadow space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5DC]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#635BFF] font-mono flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#635BFF]" /> {simulationData ? 'STEPNEXT DECISION ANALYSIS' : 'PREVIEW ANALYSIS'}
              </span>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-[#171827] font-heading mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-[#32C6A6]" />
                {activeResult.name.toUpperCase()} {activeResult.overall_score === topLive.overall_score ? '(TOP ALIGNMENT)' : '(SELECTED PATH)'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={simulationData ? (isGeminiUsed ? 'indigo' : 'neutral') : 'neutral'} className="font-mono text-xs font-bold">
                {simulationData ? (isGeminiUsed ? `✨ ${engineUsed}` : `⚡ Rule-based analysis`) : `⚡ Live Preview`}
              </Badge>
              <Badge variant="green" className="text-xs px-3.5 py-1 font-mono font-bold">
                {activeResult.overall_score} / 100 alignment
              </Badge>
            </div>
          </div>

          {/* Reasoning */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF9F5] to-[#F0EEFF] border border-[#635BFF]/20 text-xs sm:text-sm text-[#171827] font-medium leading-relaxed">
            "{activeResult.explanation || `Your ${activeResult.name} path achieves an overall alignment score of ${activeResult.overall_score}/100 based on your current weekly time allocations and profile goals as a ${dims.professionTitle}. Goal Alignment is ${activeResult.goal_alignment}%, Skill Growth potential is ${activeResult.skill_growth}%, Financial Outlook is ${activeResult.financial_outlook}%, and Workload Risk is ${activeResult.risk}%.`}"
          </div>

          {/* SCORE DRIVERS BREAKDOWN */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase text-[#667085] tracking-wider">SCORE DRIVERS BREAKDOWN (CLICK CARD TO SWITCH ANALYSIS)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {(simulationData ? simulationData.results : allLive).map((res, idx) => {
                const isSelected = res.name.toLowerCase() === activeResult.name.toLowerCase() ||
                  (selectedScenario === 'higher_studies' && (res.name.toLowerCase().includes('higher') || res.name.toLowerCase().includes('specialization'))) ||
                  (selectedScenario === 'startup' && (res.name.toLowerCase().includes('startup') || res.name.toLowerCase().includes('venture'))) ||
                  (selectedScenario === 'placement' && (res.name.toLowerCase().includes('placement') || res.name.toLowerCase().includes('career')));

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (idx === 0) setSelectedScenario('placement');
                      else if (idx === 1) setSelectedScenario('higher_studies');
                      else setSelectedScenario('startup');
                    }}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 space-y-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-white via-[#FAF9F5] to-[#F0EEFF] border-2 border-[#635BFF] shadow-md ring-1 ring-[#635BFF]'
                        : 'bg-[#FAF9F5] border-[#E5E5DC] hover:border-[#635BFF]/50'
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono">
                      <span className={`font-bold ${isSelected ? 'text-[#635BFF]' : 'text-[#171827]'}`}>
                        0{idx + 1} {res.name.toUpperCase()} {isSelected ? '✓' : ''}
                      </span>
                      <span className="font-extrabold text-[#171827]">{res.overall_score}/100</span>
                    </div>
                    <p className="text-[11px] text-[#667085] leading-relaxed">
                      Goal Fit: {res.goal_alignment}%, Skill Growth: {res.skill_growth}%, Financial: {res.financial_outlook}%, Risk: {res.risk}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRADEOFFS */}
          <div className="space-y-3 pt-2 border-t border-[#E5E5DC]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D84B3B] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#D84B3B]" /> KEY TRADEOFFS TO CONSIDER FOR {activeResult.name.toUpperCase()}
            </h4>
            <ul className="space-y-2 text-xs text-[#171827]">
              {[
                `Executing ${activeResult.name} requires dedicated focus on target skill building (${activeSelectedScenario.total_hours || 18} hrs/wk).`,
                `Goal Alignment for this path is ${activeResult.goal_alignment}% with an estimated Workload Risk of ${activeResult.risk}%.`,
                activeResult.overall_score < topLive.overall_score
                  ? `Note: Alternative path ${topLive.name} achieves a higher alignment score of ${topLive.overall_score}/100.`
                  : `This path achieves top overall alignment (${activeResult.overall_score}/100) among all evaluated trajectories.`
              ].map((tradeoff, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FF7A6B]/10 border border-[#FF7A6B]/20">
                  <span className="text-[#FF7A6B] font-bold text-sm leading-none">−</span>
                  <span>{tradeoff}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ACTIONABLE NEXT STEPS */}
          <div className="space-y-3 pt-2 border-t border-[#E5E5DC]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#635BFF]" /> RECOMMENDED NEXT MOVES FOR {activeResult.name.toUpperCase()}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                `Set up weekly focus schedule for ${activeResult.name} preparation (${activeSelectedScenario.total_hours || 18} hrs/wk).`,
                `Focus execution on key growth areas: ${profile?.skills_to_improve ? profile.skills_to_improve.join(', ') : 'Core fundamentals'}.`,
                `Track weekly progress and adjust workload to keep risk at ${activeResult.risk}%.`
              ].map((stepItem, idx) => (
                <div key={idx} className={`p-4 rounded-2xl ${idx === 0 ? 'bg-gradient-to-r from-white to-[#F0EEFF] border-2 border-[#635BFF]' : 'bg-[#FAF9F5] border border-[#E5E5DC]'} space-y-2 light-card-shadow`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-[#635BFF]">0{idx + 1} {idx === 0 ? '★' : ''}</span>
                    <Badge variant={idx === 0 ? 'amber' : 'indigo'}>ACTIONABLE</Badge>
                  </div>
                  <p className="text-xs font-bold text-[#171827] leading-relaxed">{stepItem}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={handleAdjustScenarios} icon={<Sliders className="w-3.5 h-3.5" />}>
              Adjust & Re-Simulate
            </Button>
          </div>
        </div>
      </section>

      {/* 6. ACTION ROADMAP SECTION */}
      <ActionRoadmapSection
        roadmap={roadmap}
        loading={roadmapLoading}
        onToggleAction={handleToggleAction}
        onStartExecution={handleAdjustScenarios}
      />

      {/* 7. PROGRESS INTELLIGENCE SECTION */}
      <ProgressIntelligenceSection
        progress={progress}
        loading={progressLoading}
      />

      {/* 8. ADAPTIVE FUTURE FEEDBACK SECTION */}
      <AdaptiveFutureSection
        feedback={adaptiveFuture}
        loading={adaptiveFutureLoading}
        onReRunSimulator={handleAdjustScenarios}
      />
    </div>
  );
};

export const SimulatorPage: React.FC<SimulatorPageProps> = (props) => (
  <SimulatorErrorBoundary>
    <SimulatorPageContent {...props} />
  </SimulatorErrorBoundary>
);
