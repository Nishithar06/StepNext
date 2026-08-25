/**
 * Goal Intelligence Engine for StepNext.
 * Analyzes ANY career goal string and returns the complete set of required sub-goals,
 * essential competencies, 3-phase milestones, and gap analysis.
 */

export interface GoalMilestone {
  phaseNumber: number;
  phaseName: string;
  duration: string;
  focusTitle: string;
  description: string;
  keyDeliverables: string[];
  recommendedHoursPerWeek: number;
}

export interface GoalIntelligenceBreakdown {
  rawGoal: string;
  normalizedTitle: string;
  domainFamily: string;
  tagline: string;
  requiredCompetencies: string[];
  matchingSkills: string[];
  skillsToAcquire: string[];
  readinessPercentage: number;
  recommendedWeeklyHours: {
    coreLearning: number;
    practicalProjects: number;
    reviewAndOutreach: number;
    total: number;
  };
  milestones: GoalMilestone[];
  criticalSuccessFactors: string[];
}

export function analyzeCareerGoal(
  rawGoalInput: string | null | undefined,
  userSkills: string[] = [],
  userSkillsToImprove: string[] = []
): GoalIntelligenceBreakdown {
  const rawGoal = (rawGoalInput || '').trim() || 'Software & AI Engineer';
  let cleanTitle = rawGoal;

  const lower = rawGoal.toLowerCase();
  const prefixes = [
    'become a ', 'become an ', 'become ',
    'work as a ', 'work as an ', 'work as ',
    'pursue a career as a ', 'pursue a career as an ', 'pursue ',
    'be a ', 'be an ', 'transition to '
  ];

  for (const prefix of prefixes) {
    if (lower.startsWith(prefix)) {
      cleanTitle = cleanTitle.substring(prefix.length).trim();
      break;
    }
  }

  const normalizedTitle = cleanTitle
    ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1)
    : 'Professional Specialist';

  const goalLower = normalizedTitle.toLowerCase();
  const allUserSkillsLower = [
    ...userSkills.map(s => s.toLowerCase()),
    ...userSkillsToImprove.map(s => s.toLowerCase())
  ];

  let domainFamily = 'Professional Execution';
  let tagline = `Comprehensive roadmap & milestone trajectory for ${normalizedTitle}`;
  let requiredCompetencies: string[] = [];
  let milestones: GoalMilestone[] = [];
  let criticalSuccessFactors: string[] = [];
  let recommendedWeeklyHours = {
    coreLearning: 8,
    practicalProjects: 6,
    reviewAndOutreach: 4,
    total: 18
  };

  // 1. SOFTWARE / DEVELOPER / AI / DATA SCIENCE
  if (
    goalLower.includes('software') ||
    goalLower.includes('developer') ||
    goalLower.includes('engineer') ||
    goalLower.includes('full stack') ||
    goalLower.includes('backend') ||
    goalLower.includes('frontend') ||
    goalLower.includes('ai') ||
    goalLower.includes('machine learning') ||
    goalLower.includes('data scientist') ||
    goalLower.includes('programmer') ||
    goalLower.includes('cloud') ||
    goalLower.includes('devops')
  ) {
    domainFamily = 'Software & AI Engineering';
    tagline = `Production-grade software mastery, algorithm fluency, and system design architecture.`;
    requiredCompetencies = [
      'Data Structures & Algorithms (DSA)',
      'Full Stack Architecture & REST APIs',
      'System Design & Microservices',
      'Database Optimization & SQL',
      'Git, CI/CD & Cloud Deployment',
      'Unit Testing & Code Quality'
    ];
    recommendedWeeklyHours = { coreLearning: 8, practicalProjects: 7, reviewAndOutreach: 4, total: 19 };
    milestones = [
      {
        phaseNumber: 1,
        phaseName: 'Phase 01: Core Foundations',
        duration: 'Month 1 (Days 1–30)',
        focusTitle: 'Algorithmic Mastery & Language Fundamentals',
        description: 'Establish deep mastery in core programming language, data structures, and daily problem-solving discipline.',
        keyDeliverables: [
          'Solve 40+ Medium LeetCode/DSA problems (Arrays, Trees, Graphs, DP)',
          'Master OOP, memory management, and asynchronous concurrency patterns',
          'Set up production Git workflow and clean code repository structure'
        ],
        recommendedHoursPerWeek: 8
      },
      {
        phaseNumber: 2,
        phaseName: 'Phase 02: Practical Architecture',
        duration: 'Month 2 (Days 31–60)',
        focusTitle: 'Full-Stack Application & System Architecture',
        description: 'Design and build 2 end-to-end full-stack applications with database indexing, authentication, and API caching.',
        keyDeliverables: [
          'Build & deploy full-stack production application with real database integration',
          'Implement JWT authentication, rate limiting, and automated CI/CD pipeline',
          'Document system architecture diagrams and API contract schemas'
        ],
        recommendedHoursPerWeek: 7
      },
      {
        phaseNumber: 3,
        phaseName: 'Phase 03: Placement & Career Execution',
        duration: 'Month 3 (Days 61–90)',
        focusTitle: 'Technical Interviews, Mock Drills & Outreach',
        description: 'Complete rigorous mock technical interviews, system design walkthroughs, and proactive job application pipeline.',
        keyDeliverables: [
          'Conduct 5+ peer technical mock interviews and live coding walkthroughs',
          'Polish technical resume with quantified project impact metrics',
          'Apply to 30+ targeted tech companies with personalized developer outreach'
        ],
        recommendedHoursPerWeek: 4
      }
    ];
    criticalSuccessFactors = [
      'Daily 60-min coding streak without breaking momentum',
      'Public GitHub repository with clean commits and live demo links',
      'Ability to articulate architectural trade-offs during live whiteboard discussions'
    ];
  }
  // 2. DATA SCIENCE & ANALYTICS
  else if (goalLower.includes('data analyst') || goalLower.includes('analytics') || goalLower.includes('business analyst')) {
    domainFamily = 'Data Analytics & Intelligence';
    tagline = `Statistical modeling, SQL mastery, business visualization, and data-driven storytelling.`;
    requiredCompetencies = [
      'Advanced SQL & Query Optimization',
      'Python / R for Data Analysis (Pandas, NumPy)',
      'Tableau / Power BI Interactive Dashboards',
      'Statistical Analysis & A/B Testing',
      'Data Cleaning & ETL Pipelines',
      'Business Presentation & Storytelling'
    ];
    recommendedWeeklyHours = { coreLearning: 8, practicalProjects: 6, reviewAndOutreach: 4, total: 18 };
    milestones = [
      {
        phaseNumber: 1,
        phaseName: 'Phase 01: Core Foundations',
        duration: 'Month 1 (Days 1–30)',
        focusTitle: 'SQL Mastery & Statistical Foundations',
        description: 'Master complex multi-table SQL queries, window functions, and fundamental statistical distributions.',
        keyDeliverables: [
          'Complete 50+ complex SQL query challenges (Window Functions, CTEs, Aggregates)',
          'Master descriptive and inferential statistics with Python Pandas',
          'Build automated data ingestion and cleaning script'
        ],
        recommendedHoursPerWeek: 8
      },
      {
        phaseNumber: 2,
        phaseName: 'Phase 02: Practical Analytics',
        duration: 'Month 2 (Days 31–60)',
        focusTitle: 'Executive Dashboards & Business Case Studies',
        description: 'Create 2 comprehensive business dashboards solving real-world churn, revenue, or customer segmentation problems.',
        keyDeliverables: [
          'Publish interactive Power BI / Tableau dashboard with drill-down KPIs',
          'Perform end-to-end exploratory data analysis (EDA) on messy real-world datasets',
          'Generate executive-ready insights report with actionable business recommendations'
        ],
        recommendedHoursPerWeek: 6
      },
      {
        phaseNumber: 3,
        phaseName: 'Phase 03: Placement & Execution',
        duration: 'Month 3 (Days 61–90)',
        focusTitle: 'Portfolio Showcase & Analytical Case Interviews',
        description: 'Package data portfolio on GitHub/Tableau Public and execute targeted analytics recruitment pipeline.',
        keyDeliverables: [
          'Host data analytics portfolio showcasing SQL queries and dashboard walkthroughs',
          'Practice 10+ business case studies and SQL live query drills',
          'Engage with analytics hiring managers across targeted industries'
        ],
        recommendedHoursPerWeek: 4
      }
    ];
    criticalSuccessFactors = [
      'Deep mastery of SQL window functions and aggregations',
      'Interactive visual dashboards accessible via web link',
      'Clear translation of complex numbers into business action items'
    ];
  }
  // 3. UI/UX & PRODUCT DESIGN
  else if (goalLower.includes('design') || goalLower.includes('ui') || goalLower.includes('ux') || goalLower.includes('product designer')) {
    domainFamily = 'Product & UX Design';
    tagline = `User research, design systems, interactive prototyping, and case study storytelling.`;
    requiredCompetencies = [
      'Figma & Advanced Prototyping',
      'UX Research & User Testing Methodologies',
      'Design System Architecture & Tokens',
      'Information Architecture & Wireframing',
      'Visual Hierarchy & Typography',
      'Case Study Writing & Stakeholder Handoff'
    ];
    recommendedWeeklyHours = { coreLearning: 7, practicalProjects: 8, reviewAndOutreach: 3, total: 18 };
    milestones = [
      {
        phaseNumber: 1,
        phaseName: 'Phase 01: Core Foundations',
        duration: 'Month 1 (Days 1–30)',
        focusTitle: 'Design Principles & Tool Fluency',
        description: 'Master visual layout principles, responsive grids, typography hierarchies, and Figma component libraries.',
        keyDeliverables: [
          'Build scalable mini design system with responsive auto-layout components',
          'Conduct 3 user usability interviews and synthesis affinity diagrams',
          'Redesign a complex real-world flow with documented UX rationale'
        ],
        recommendedHoursPerWeek: 7
      },
      {
        phaseNumber: 2,
        phaseName: 'Phase 02: In-Depth Case Studies',
        duration: 'Month 2 (Days 31–60)',
        focusTitle: 'End-to-End Product Design Case Studies',
        description: 'Execute 2 comprehensive product case studies from user research problem framing to high-fidelity prototypes.',
        keyDeliverables: [
          'Publish 2 polished Figma prototype walkthroughs with motion micro-interactions',
          'Document full UX case study highlighting problem, iterations, and user metrics',
          'Test prototypes with 5 external users and iterate based on feedback'
        ],
        recommendedHoursPerWeek: 8
      },
      {
        phaseNumber: 3,
        phaseName: 'Phase 03: Placement & Portfolio',
        duration: 'Month 3 (Days 61–90)',
        focusTitle: 'Portfolio Site & Design Review Presentations',
        description: 'Launch professional portfolio site and prepare whiteboard challenge and app critique presentations.',
        keyDeliverables: [
          'Deploy personal design portfolio website showcasing case studies',
          'Prepare slide deck for 30-min portfolio deep-dive interviews',
          'Outreach to design leads and recruiters across high-growth product companies'
        ],
        recommendedHoursPerWeek: 3
      }
    ];
    criticalSuccessFactors = [
      'Clear explanation of the "Why" behind design decisions, not just pretty visuals',
      'Live clickable prototypes demonstrating realistic state transitions',
      'Strong typography, accessibility (WCAG), and responsive constraints'
    ];
  }
  // 4. DOCTOR / HEALTHCARE / CLINICAL
  else if (goalLower.includes('doctor') || goalLower.includes('medical') || goalLower.includes('physician') || goalLower.includes('surgeon') || goalLower.includes('nurse')) {
    domainFamily = 'Healthcare & Clinical Medicine';
    tagline = `Clinical diagnostics, anatomy & pharmacology mastery, patient management, and licensing board prep.`;
    requiredCompetencies = [
      'Clinical Diagnostics & Symptom Pathology',
      'Human Anatomy, Physiology & Pharmacology',
      'Patient Case Studies & Differential Diagnosis',
      'Medical Ethics & Emergency Protocols',
      'Board Exam & Licensing Preparation',
      'Clinical Rotations & Case Documentation'
    ];
    recommendedWeeklyHours = { coreLearning: 10, practicalProjects: 6, reviewAndOutreach: 4, total: 20 };
    milestones = [
      {
        phaseNumber: 1,
        phaseName: 'Phase 01: Core Foundations',
        duration: 'Month 1 (Days 1–30)',
        focusTitle: 'Medical Science Foundations & Pathology',
        description: 'Deepen knowledge in core medical sciences, clinical pharmacology, and systematic symptom evaluations.',
        keyDeliverables: [
          'Complete 50+ clinical pathology diagnostic case reviews',
          'Master high-yield pharmacology interactions and emergency drug protocols',
          'Complete daily 2-hour medical board question bank drills'
        ],
        recommendedHoursPerWeek: 10
      },
      {
        phaseNumber: 2,
        phaseName: 'Phase 02: Clinical Depth',
        duration: 'Month 2 (Days 31–60)',
        focusTitle: 'Clinical Rotations & Differential Diagnostics',
        description: 'Engage in clinical case studies, hospital rounds/observerships, and patient interaction procedures.',
        keyDeliverables: [
          'Document 20 comprehensive patient case study summaries',
          'Participate in simulated clinical OSCE examinations and viva evaluations',
          'Master vital diagnostic chart readings (ECG, imaging, blood chemistry)'
        ],
        recommendedHoursPerWeek: 6
      },
      {
        phaseNumber: 3,
        phaseName: 'Phase 03: Licensing & Residency',
        duration: 'Month 3 (Days 61–90)',
        focusTitle: 'Board Exam Readiness & Residency Matching',
        description: 'Finalize board certification prep, letters of recommendation, and residency program applications.',
        keyDeliverables: [
          'Achieve 85%+ score in full-length timed mock licensing examinations',
          'Finalize medical CV, clinical personal statement, and recommendation dossiers',
          'Complete residency interview preparation with senior attending physicians'
        ],
        recommendedHoursPerWeek: 4
      }
    ];
    criticalSuccessFactors = [
      'High consistency on daily board question bank drills (QBank)',
      'Accurate differential diagnostic reasoning under timed constraints',
      'Strong clinical empathy and structured communication protocols'
    ];
  }
  // 5. LAWYER / LEGAL / ADVOCACY
  else if (goalLower.includes('lawyer') || goalLower.includes('legal') || goalLower.includes('advocate') || goalLower.includes('attorney') || goalLower.includes('counsel')) {
    domainFamily = 'Legal & Regulatory Practice';
    tagline = `Statutory research, brief drafting, judicial precedents, and courtroom oral advocacy.`;
    requiredCompetencies = [
      'Legal Research & Case Precedent Retrieval',
      'Statutory Interpretation & Constitutional Law',
      'Legal Brief & Contract Drafting',
      'Moot Court & Oral Arguments',
      'Bar Exam & Regulatory Compliance Prep',
      'Client Counseling & Negotiation'
    ];
    recommendedWeeklyHours = { coreLearning: 8, practicalProjects: 6, reviewAndOutreach: 4, total: 18 };
    milestones = [
      {
        phaseNumber: 1,
        phaseName: 'Phase 01: Core Foundations',
        duration: 'Month 1 (Days 1–30)',
        focusTitle: 'Statutory Research & Legal Analysis',
        description: 'Master primary case law databases, statutory citations, and structured IRAC legal writing methodology.',
        keyDeliverables: [
          'Conduct comprehensive legal research briefs across 10 landmark case precedents',
          'Draft 3 formal legal memoranda analyzing regulatory dispute scenarios',
          'Master civil and criminal statutory procedure codes'
        ],
        recommendedHoursPerWeek: 8
      },
      {
        phaseNumber: 2,
        phaseName: 'Phase 02: Practical Drafting',
        duration: 'Month 2 (Days 31–60)',
        focusTitle: 'Contract Drafting & Moot Advocacy',
        description: 'Draft commercial agreements, trial pleadings, and participate in moot court oral advocacy drills.',
        keyDeliverables: [
          'Draft 2 commercial contract agreements with indemnity and arbitration clauses',
          'Participate in simulated moot court oral argument and rebuttal round',
          'Complete internship / chambers litigation case file reviews'
        ],
        recommendedHoursPerWeek: 6
      },
      {
        phaseNumber: 3,
        phaseName: 'Phase 03: Bar Exam & Placement',
        duration: 'Month 3 (Days 61–90)',
        focusTitle: 'Bar Exam Licensing & Law Firm Recruitment',
        description: 'Complete bar examination preparation and apply to target law firms and legal chambers.',
        keyDeliverables: [
          'Complete 500+ bar exam practice questions and legal ethics drills',
          'Publish a legal research article on a current regulatory development',
          'Apply to associate roles across targeted law firms and corporate legal teams'
        ],
        recommendedHoursPerWeek: 4
      }
    ];
    criticalSuccessFactors = [
      'Rigorous legal research using precise statutory citation standards',
      'Concise and unambiguous legal drafting without superfluous text',
      'Confident, evidence-based oral argumentation during cross-examinations'
    ];
  }
  // 6. TEACHER / PROFESSOR / EDUCATION
  else if (goalLower.includes('teacher') || goalLower.includes('teaching') || goalLower.includes('educator') || goalLower.includes('professor') || goalLower.includes('lecturer')) {
    domainFamily = 'Education & Academic Pedagogy';
    tagline = `Subject matter mastery, curriculum design, classroom engagement, and pedagogical leadership.`;
    requiredCompetencies = [
      'Specialized Subject Matter Mastery',
      'Curriculum Design & Lesson Planning',
      'Pedagogical Strategies & Student Engagement',
      'Assessment Design & Grading Rubrics',
      'Educational Technology & LMS Platforms',
      'Classroom Management & Inclusive Learning'
    ];
    recommendedWeeklyHours = { coreLearning: 8, practicalProjects: 6, reviewAndOutreach: 4, total: 18 };
    milestones = [
      {
        phaseNumber: 1,
        phaseName: 'Phase 01: Core Foundations',
        duration: 'Month 1 (Days 1–30)',
        focusTitle: 'Subject Specialization & Curriculum Mapping',
        description: 'Deepen core subject mastery and study modern pedagogical frameworks and Bloom’s taxonomy.',
        keyDeliverables: [
          'Build complete 12-week syllabus curriculum with learning outcomes',
          'Design 5 interactive lesson plans with multimedia teaching aids',
          'Review pedagogical assessment standards and state eligibility exams'
        ],
        recommendedHoursPerWeek: 8
      },
      {
        phaseNumber: 2,
        phaseName: 'Phase 02: Practical Teaching',
        duration: 'Month 2 (Days 31–60)',
        focusTitle: 'Classroom Delivery & Student Engagement',
        description: 'Deliver recorded micro-teaching sessions, student assessments, and differentiated learning modules.',
        keyDeliverables: [
          'Deliver and record 3 micro-teaching mock lectures with peer feedback',
          'Create formative and summative digital quizzes with automated rubrics',
          'Implement active learning classroom management exercises'
        ],
        recommendedHoursPerWeek: 6
      },
      {
        phaseNumber: 3,
        phaseName: 'Phase 03: Certification & Placement',
        duration: 'Month 3 (Days 61–90)',
        focusTitle: 'Teaching Certification & Institutional Hiring',
        description: 'Finalize teaching licensing/eligibility tests and apply to educational institutions.',
        keyDeliverables: [
          'Pass required teacher eligibility exam (TET/NET/B.Ed modules)',
          'Assemble teaching portfolio with recorded video lectures and student testimonials',
          'Apply to 15+ target schools, colleges, or online learning platforms'
        ],
        recommendedHoursPerWeek: 4
      }
    ];
    criticalSuccessFactors = [
      'Ability to explain complex subject concepts through simple real-world analogies',
      'Interactive student engagement and constructive feedback loops',
      'Structured curriculum pacing with clear milestone evaluations'
    ];
  }
  // 7. CIVIL SERVICES / IAS / GOVERNMENT EXAMS
  else if (goalLower.includes('ias') || goalLower.includes('civil service') || goalLower.includes('upsc') || goalLower.includes('government') || goalLower.includes('bank po') || goalLower.includes('ssc')) {
    domainFamily = 'Public Administration & Civil Services';
    tagline = `General studies breadth, current affairs analysis, answer writing discipline, and mock interview drills.`;
    requiredCompetencies = [
      'General Studies (Polity, Economy, History, Geography)',
      'Current Affairs & Policy Analysis',
      'Mains Answer Writing & Essay Composition',
      'Analytical Reasoning & Aptitude (CSAT)',
      'Optional Subject Depth',
      'Personality Test & Ethical Decision Making'
    ];
    recommendedWeeklyHours = { coreLearning: 12, practicalProjects: 6, reviewAndOutreach: 4, total: 22 };
    milestones = [
      {
        phaseNumber: 1,
        phaseName: 'Phase 01: Core Foundations',
        duration: 'Month 1 (Days 1–30)',
        focusTitle: 'NCERT Foundation & Core Syllabus Mastery',
        description: 'Build robust foundational knowledge in Constitution, Economy, History, and daily newspaper editorial analysis.',
        keyDeliverables: [
          'Read and summarize core NCERT and standard reference textbooks',
          'Maintain daily current affairs notes linked to syllabus keywords',
          'Solve 25 daily static MCQs with analytical error logs'
        ],
        recommendedHoursPerWeek: 12
      },
      {
        phaseNumber: 2,
        phaseName: 'Phase 02: Answer Writing Depth',
        duration: 'Month 2 (Days 31–60)',
        focusTitle: 'Daily Mains Answer Writing & Ethics Case Studies',
        description: 'Practice structured 150/250 word answer writing with diagrams, policy data, and balanced conclusions.',
        keyDeliverables: [
          'Write 2 structured Mains answers daily with peer/mentor evaluation',
          'Solve 15 ethics case studies evaluating constitutional dilemmas',
          'Complete 4 sectional Prelims mock tests with detailed gap analysis'
        ],
        recommendedHoursPerWeek: 6
      },
      {
        phaseNumber: 3,
        phaseName: 'Phase 03: Full-Length Mocks & Revision',
        duration: 'Month 3 (Days 61–90)',
        focusTitle: 'Full-Length Timed Test Series & Interview Prep',
        description: 'Simulate exact exam conditions with timed 3-hour test papers and personality test preparation.',
        keyDeliverables: [
          'Attempt 8 full-length Prelims mock tests scoring above cutoff benchmark',
          'Complete 2 full 3-hour Mains mock papers under strict exam timer',
          'Participate in DAF analysis and mock interview personality panels'
        ],
        recommendedHoursPerWeek: 4
      }
    ];
    criticalSuccessFactors = [
      'Strict daily revision schedule without information overload',
      'Speed and structure in 7-minute answer writing per question',
      'Balanced, objective policy arguments supported by constitutional facts'
    ];
  }
  // 8. DYNAMIC FALLBACK FOR ANY OTHER CUSTOM CAREER GOAL
  else {
    domainFamily = `${normalizedTitle} Mastery`;
    tagline = `Targeted professional capabilities, portfolio proof-of-work, and career execution for ${normalizedTitle}.`;
    requiredCompetencies = [
      `Core ${normalizedTitle} Fundamentals & Theory`,
      `Practical Deliverables & Case Studies in ${normalizedTitle}`,
      `Industry Tools & Technical Workflow for ${normalizedTitle}`,
      `Professional Standards & Ethics`,
      `Portfolio Presentation & Peer Review`,
      `Interview, Networking & Opportunity Sourcing`
    ];
    recommendedWeeklyHours = { coreLearning: 8, practicalProjects: 6, reviewAndOutreach: 4, total: 18 };
    milestones = [
      {
        phaseNumber: 1,
        phaseName: 'Phase 01: Core Foundations',
        duration: 'Month 1 (Days 1–30)',
        focusTitle: `Core Principles & ${normalizedTitle} Fundamentals`,
        description: `Establish strong foundational knowledge, standard operating methodologies, and tools required for ${normalizedTitle}.`,
        keyDeliverables: [
          `Master fundamental theories and technical workflows in ${normalizedTitle}`,
          `Complete structured learning modules across core focus topics`,
          `Set up dedicated workstation, tools, and daily learning habits`
        ],
        recommendedHoursPerWeek: 8
      },
      {
        phaseNumber: 2,
        phaseName: 'Phase 02: Practical Deliverables',
        duration: 'Month 2 (Days 31–60)',
        focusTitle: `Hands-on Proof of Work & Deliverables`,
        description: `Create 2 tangible real-world deliverables or case studies demonstrating verified competence as a ${normalizedTitle}.`,
        keyDeliverables: [
          `Complete and publish 2 high-impact practical projects/deliverables`,
          `Receive feedback and critique from experienced practitioners in ${normalizedTitle}`,
          `Document project methodologies, challenge resolutions, and outcome metrics`
        ],
        recommendedHoursPerWeek: 6
      },
      {
        phaseNumber: 3,
        phaseName: 'Phase 03: Placement & Career Execution',
        duration: 'Month 3 (Days 61–90)',
        focusTitle: `Career Launch & Industry Opportunity Sourcing`,
        description: `Package professional portfolio, polish CV, and engage in targeted outreach to land roles in ${normalizedTitle}.`,
        keyDeliverables: [
          `Publish comprehensive portfolio demonstrating verified capabilities in ${normalizedTitle}`,
          `Conduct 5 mock interview/presentation rehearsals with domain peers`,
          `Submit 25+ targeted applications and outreach pitches to industry leads`
        ],
        recommendedHoursPerWeek: 4
      }
    ];
    criticalSuccessFactors = [
      `Consistent weekly practice of core ${normalizedTitle} skills`,
      `Public proof-of-work demonstrating problem-solving ability`,
      `Proactive networking with active practitioners in ${normalizedTitle}`
    ];
  }

  // Calculate matching vs skills to acquire
  const matchingSkills: string[] = [];
  const skillsToAcquire: string[] = [];

  for (const comp of requiredCompetencies) {
    const compLower = comp.toLowerCase();
    const hasMatch = allUserSkillsLower.some(uSkill =>
      compLower.includes(uSkill) || uSkill.includes(compLower.split(' ')[0])
    );

    if (hasMatch) {
      matchingSkills.push(comp);
    } else {
      skillsToAcquire.push(comp);
    }
  }

  // Compute readiness percentage
  const totalComp = requiredCompetencies.length || 1;
  const matchCount = matchingSkills.length;
  const baseScore = Math.round((matchCount / totalComp) * 50) + 35;
  const readinessPercentage = Math.min(95, Math.max(30, baseScore));

  return {
    rawGoal,
    normalizedTitle,
    domainFamily,
    tagline,
    requiredCompetencies,
    matchingSkills,
    skillsToAcquire,
    readinessPercentage,
    recommendedWeeklyHours,
    milestones,
    criticalSuccessFactors
  };
}
