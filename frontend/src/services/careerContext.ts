/**
 * Centralized Career Personalization Context for StepNext AI Frontend.
 * Derives goal-aligned titles, investment slider labels, descriptions, and focus areas for ANY career goal string.
 */

import { UserProfile } from '../types/schema';

export interface PersonalizedDimension {
  key: string;
  legacy_key: string;
  label: string;
  description: string;
  badge: string;
}

export interface PersonalizedCareerContext {
  professionTitle: string;
  rawGoal: string;
  domainFamily: string;
  primarySkill: string;
  secondarySkill: string;
  path1Title: string;
  path1Description: string;
  slider1: PersonalizedDimension;
  slider2: PersonalizedDimension;
  slider3: PersonalizedDimension;
  focusAreas: string[];
}

export function getPersonalizedCareerContext(profile?: UserProfile | null): PersonalizedCareerContext {
  const rawGoal = (profile?.career_goal || profile?.short_term_goal || '').trim();
  let cleanGoal = rawGoal || 'Professional Specialist';
  const lowerGoal = cleanGoal.toLowerCase();

  for (const prefix of [
    "become a ", "become an ", "become ",
    "work as a ", "work as an ", "work as ",
    "pursue a career as a ", "pursue a career as an ", "pursue ",
    "be a ", "be an ", "transition to "
  ]) {
    if (lowerGoal.startsWith(prefix)) {
      cleanGoal = cleanGoal.slice(prefix.length).trim();
      break;
    }
  }

  const professionTitle = cleanGoal ? cleanGoal.charAt(0).toUpperCase() + cleanGoal.slice(1) : 'Professional Specialist';
  const skillsToImprove = profile?.skills_to_improve || [];
  const skills = profile?.skills || [];

  const primarySkill = skillsToImprove[0] || skills[0] || `${professionTitle} Core Principles`;
  const secondarySkill = skillsToImprove[1] || skills[1] || `${professionTitle} Practical Deliverables`;

  let domainFamily = `${professionTitle} Execution`;
  let slider1Label = `Master ${primarySkill} & ${professionTitle} Fundamentals`;
  let slider1Desc = `Building core competence in ${primarySkill} and foundational domain principles.`;
  let slider2Label = `${professionTitle} Portfolio & ${secondarySkill}`;
  let slider2Desc = `Creating practical deliverables, portfolio artifacts, and executing ${secondarySkill}.`;
  let slider3Label = `${professionTitle} Career Prep & Peer Reviews`;
  let slider3Desc = `Industry networking, professional evaluation, and milestone execution.`;
  let focusAreas = [primarySkill, secondarySkill, `${professionTitle} Deliverables`, "Professional Review"];

  const g = lowerGoal;

  if (g.includes('teacher') || g.includes('teaching') || g.includes('educator') || g.includes('professor') || g.includes('lecturer')) {
    domainFamily = 'Education & Pedagogy';
    slider1Label = `Subject Mastery & ${primarySkill}`;
    slider1Desc = `Deepening knowledge in subject specialization and ${primarySkill}.`;
    slider2Label = `Lesson Planning & ${secondarySkill}`;
    slider2Desc = `Developing curriculum, lesson plans, and ${secondarySkill}.`;
    slider3Label = `Classroom Management & Practice`;
    slider3Desc = `Student engagement, pedagogical practice, and classroom delivery.`;
    focusAreas = [primarySkill, "Lesson Planning", "Classroom Management", "Pedagogy"];
  } else if (g.includes('doctor') || g.includes('medical') || g.includes('physician') || g.includes('clinician') || g.includes('nurse')) {
    domainFamily = 'Healthcare & Medicine';
    slider1Label = `Clinical Knowledge & ${primarySkill}`;
    slider1Desc = `Medical theory, diagnostics, and ${primarySkill} mastery.`;
    slider2Label = `Clinical Practice & Patient Care`;
    slider2Desc = `Direct clinical training, patient interaction, and case analysis.`;
    slider3Label = `Medical Boards & Licensing Prep`;
    slider3Desc = `Exam preparation, board certification, and clinical evaluations.`;
    focusAreas = [primarySkill, "Clinical Practice", "Medical Licensing", "Patient Diagnostics"];
  } else if (g.includes('lawyer') || g.includes('legal') || g.includes('advocate') || g.includes('attorney')) {
    domainFamily = 'Legal & Regulatory';
    slider1Label = `Legal Research & ${primarySkill}`;
    slider1Desc = `Statutory analysis, legal precedents, and ${primarySkill}.`;
    slider2Label = `Case Analysis & Document Drafting`;
    slider2Desc = `Brief writing, contract drafting, and case study preparation.`;
    slider3Label = `Moot Court & Advocacy Practice`;
    slider3Desc = `Oral arguments, litigation practice, and bar exam prep.`;
    focusAreas = [primarySkill, "Legal Research", "Case Briefing", "Advocacy"];
  } else if (g.includes('designer') || g.includes('ux') || g.includes('ui') || g.includes('graphic')) {
    domainFamily = 'Design & Creative Technologies';
    slider1Label = `Design Fundamentals & ${primarySkill}`;
    slider1Desc = `Visual hierarchy, typography, and ${primarySkill}.`;
    slider2Label = `Portfolio Case Studies & ${secondarySkill}`;
    slider2Desc = `End-to-end design case studies, prototyping, and user testing.`;
    slider3Label = `UX Research & Design Systems`;
    slider3Desc = `User research methods, design system architecture, and client review.`;
    focusAreas = [primarySkill, "Portfolio Case Studies", "UX Research", "Design Systems"];
  } else if (g.includes('photographer') || g.includes('photography') || g.includes('videographer')) {
    domainFamily = 'Visual Arts & Media';
    slider1Label = `Camera Handling & ${primarySkill}`;
    slider1Desc = `Lighting techniques, exposure mastery, and ${primarySkill}.`;
    slider2Label = `Portfolio Shoot & Editing`;
    slider2Desc = `Field shoots, color grading, post-processing, and client portfolio.`;
    slider3Label = `Client Pitching & Gallery Exhibition`;
    slider3Desc = `Client outreach, booking management, and portfolio exhibition.`;
    focusAreas = [primarySkill, "Portfolio Shoots", "Post-Processing", "Client Outreach"];
  } else if (g.includes('environmental') || g.includes('scientist') || g.includes('researcher') || g.includes('biologist')) {
    domainFamily = 'Scientific Research & Analysis';
    slider1Label = `Domain Research & ${primarySkill}`;
    slider1Desc = `Literature review, methodology design, and ${primarySkill}.`;
    slider2Label = `Data Analysis & Experimental Fieldwork`;
    slider2Desc = `Lab experiments, field sample collection, and statistical analysis.`;
    slider3Label = `Paper Publication & Grant Writing`;
    slider3Desc = `Peer-reviewed paper drafting, conference presentation, and grant proposals.`;
    focusAreas = [primarySkill, "Experimental Fieldwork", "Data Analysis", "Paper Publication"];
  } else if (g.includes('software') || g.includes('developer') || g.includes('engineer') || g.includes('full stack') || g.includes('ai') || g.includes('data scientist')) {
    domainFamily = 'Software & Engineering';
    slider1Label = `Technical Fundamentals & ${primarySkill}`;
    slider1Desc = `Algorithm optimization, code architecture, and ${primarySkill}.`;
    slider2Label = `Software Projects & ${secondarySkill}`;
    slider2Desc = `Building production-grade applications, deployment, and testing.`;
    slider3Label = `System Architecture & Code Review`;
    slider3Desc = `System design patterns, peer code reviews, and technical interview prep.`;
    focusAreas = [primarySkill, "Software Projects", "System Architecture", "Technical Interview Prep"];
  }

  return {
    professionTitle,
    rawGoal,
    domainFamily,
    primarySkill,
    secondarySkill,
    path1Title: `CAREER EXECUTION (${professionTitle.toUpperCase()})`,
    path1Description: `Prioritize career entry, practical deliverables, and professional growth as a ${professionTitle}.`,
    slider1: {
      key: 'dimension_1',
      legacy_key: 'dsa_prep',
      label: slider1Label,
      description: slider1Desc,
      badge: '+ HIGH IMPACT'
    },
    slider2: {
      key: 'dimension_2',
      legacy_key: 'portfolio_projects',
      label: slider2Label,
      description: slider2Desc,
      badge: '+ HIGH IMPACT'
    },
    slider3: {
      key: 'dimension_3',
      legacy_key: 'system_design',
      label: slider3Label,
      description: slider3Desc,
      badge: '+ SUSTAINED GROWTH'
    },
    focusAreas
  };
}
