"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import React from "react";

const steps = [
  {
    id: "language",
    tag: "Language",
    question: "What's your preferred language?",
    sub: "PathForge works in both English and French.",
    type: "single",
    options: [
      { value: "en", label: "English", sub: "Continue in English" },
      { value: "fr", label: "Français", sub: "Continuer en français" },
    ],
  },
  {
    id: "stage",
    tag: "Your stage",
    question: "Where are you right now?",
    sub: "This helps us tailor your roadmap to exactly where you are in life.",
    type: "single",
    options: [
      { value: "secondary", label: "Secondary school", sub: "SS1, SS2, SS3 or equivalent" },
      { value: "applicant", label: "University applicant", sub: "Preparing for JAMB, A-levels etc" },
      { value: "undergraduate", label: "Undergraduate", sub: "Currently in university" },
      { value: "graduate", label: "Graduate / job seeker", sub: "Finished school, building career" },
    ],
  },
  {
    id: "country",
    tag: "Your location",
    question: "Which country are you in?",
    sub: "We use this to show you relevant local opportunities and salary ranges.",
    type: "single",
    options: [
      { value: "Nigeria", label: "Nigeria", sub: "West Africa" },
      { value: "Senegal", label: "Senegal", sub: "West Africa" },
      { value: "Ghana", label: "Ghana", sub: "West Africa" },
      { value: "Kenya", label: "Kenya", sub: "East Africa" },
      { value: "South Africa", label: "South Africa", sub: "Southern Africa" },
      { value: "Côte d'Ivoire", label: "Côte d'Ivoire", sub: "West Africa" },
      { value: "United Kingdom", label: "United Kingdom", sub: "Europe" },
      { value: "Other", label: "Other country", sub: "Rest of the world" },
    ],
  },
  {
    id: "interests",
    tag: "Your interests",
    question: "What areas excite you most?",
    sub: "Pick up to 3. This shapes your career suggestions.",
    type: "multi",
    max: 3,
    options: [
      { value: "technology", label: "Technology", sub: "Software, AI, engineering" },
      { value: "business", label: "Business", sub: "Finance, marketing, strategy" },
      { value: "health", label: "Health & medicine", sub: "Medicine, pharmacy, nursing" },
      { value: "creative", label: "Creative arts", sub: "Design, media, content" },
      { value: "law", label: "Law & policy", sub: "Legal, governance, diplomacy" },
      { value: "science", label: "Science & research", sub: "Biology, chemistry, physics" },
      { value: "education", label: "Education", sub: "Teaching, curriculum, training" },
      { value: "social", label: "Social impact", sub: "NGOs, development, community" },
    ],
  },
  {
    id: "field",
    tag: "Your field",
    question: "What is your current or most recent field of study?",
    sub: "Pick the closest match to your course or subject area.",
    type: "single",
    options: [
      { value: "engineering", label: "Engineering & technology", sub: "Computer science, electrical etc" },
      { value: "medicine", label: "Medicine & health sciences", sub: "Medicine, pharmacy, nursing" },
      { value: "business", label: "Business & economics", sub: "Accounting, finance, management" },
      { value: "law", label: "Law", sub: "LLB, legal studies" },
      { value: "arts", label: "Arts & humanities", sub: "English, history, philosophy" },
      { value: "sciences", label: "Pure sciences", sub: "Biology, chemistry, physics" },
      { value: "social_sciences", label: "Social sciences", sub: "Sociology, political science" },
      { value: "education", label: "Education", sub: "Teaching, curriculum" },
    ],
  },
  {
    id: "skills",
    tag: "Your existing skills",
    question: "Which of these do you already have experience with?",
    sub: "Be honest — this stops us suggesting things you already know. Pick all that apply.",
    type: "multi",
    max: 10,
    options: [
      { value: "microsoft_office", label: "Microsoft Office", sub: "Word, Excel, PowerPoint" },
      { value: "public_speaking", label: "Public speaking", sub: "Presentations, debates" },
      { value: "writing", label: "Writing", sub: "Essays, reports, content" },
      { value: "python", label: "Python", sub: "Programming language" },
      { value: "data_analysis", label: "Data analysis", sub: "Excel, SPSS, R" },
      { value: "graphic_design", label: "Graphic design", sub: "Canva, Photoshop" },
      { value: "social_media", label: "Social media", sub: "Content creation, management" },
      { value: "research", label: "Research", sub: "Academic or market research" },
      { value: "coding", label: "Web development", sub: "HTML, CSS, JavaScript" },
      { value: "video_editing", label: "Video editing", sub: "Premiere, CapCut" },
      { value: "none", label: "None yet", sub: "Starting from scratch" },
    ],
  },
  {
    id: "careerGoal",
    tag: "Your goal",
    question: "What's your biggest career goal right now?",
    sub: "Be honest — there's no wrong answer.",
    type: "single",
    options: [
      { value: "explore", label: "I'm still exploring", sub: "Help me figure out what suits me" },
      { value: "skill", label: "Build specific skills", sub: "I know what I want to learn" },
      { value: "job", label: "Get a job or internship", sub: "I'm actively looking" },
      { value: "abroad", label: "Study or work abroad", sub: "Scholarships, programs, relocation" },
    ],
  },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const step = steps[currentStep];
  const total = steps.length;
  const progress = ((currentStep + 1) / total) * 100;

  function selectOption(value) {
    if (step.type === "single") {
      setAnswers((prev) => ({ ...prev, [step.id]: value }));
    } else {
      const current = answers[step.id] || [];
      if (current.includes(value)) {
        setAnswers((prev) => ({
          ...prev,
          [step.id]: current.filter((v) => v !== value),
        }));
      } else if (current.length < (step.max || 99)) {
        setAnswers((prev) => ({
          ...prev,
          [step.id]: [...current, value],
        }));
      }
    }
  }

  function isSelected(value) {
    const answer = answers[step.id];
    if (step.type === "single") return answer === value;
    return Array.isArray(answer) && answer.includes(value);
  }

  function canContinue() {
    const answer = answers[step.id];
    if (!answer) return false;
    if (step.type === "multi") return answer.length > 0;
    return true;
  }

async function handleNext() {
  if (!canContinue()) return;

  let nextStep = currentStep + 1;

  // Skip field step if user is secondary school or applicant
  if (steps[nextStep]?.id === "field" && 
      (answers.stage === "secondary" || answers.stage === "applicant")) {
    nextStep = nextStep + 1;
  }

  if (nextStep < total) {
    setCurrentStep(nextStep);
  } else {
    await handleFinish();
  }
}

async function handleFinish() {
  if (!user) return;
  setSaving(true);
  try {
    await updateDoc(doc(db, "users", user.uid), {
      language: answers.language || "en",
      stage: answers.stage || "",
      country: answers.country || "",
      interests: answers.interests || [],
      field: answers.field || "",
      skills: answers.skills || [],
      careerGoal: answers.careerGoal || "",
      onboardingComplete: true,
    });

    // Route based on stage
    if (answers.stage === "graduate") {
      window.location.href = "/opportunities";
    } else {
      window.location.href = "/roadmap";
    }
  } catch (err) {
    console.error(err);
    setSaving(false);
  }
}

  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#7F77DD] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M4 14 L9 4 L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10.5 L12 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white font-medium text-sm">PathForge</span>
          </div>
          <span className="text-[#444441] text-xs">Step {currentStep + 1} of {total}</span>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-[#1a1c23] rounded-full mb-12">
          <div
            className="h-0.5 bg-[#7F77DD] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <div className="mb-8">
          <p className="text-[#7F77DD] text-xs font-medium tracking-widest uppercase mb-2">{step.tag}</p>
          <h2 className="text-white text-2xl font-medium leading-snug mb-2">{step.question}</h2>
          <p className="text-[#888780] text-sm">{step.sub}</p>
        </div>

        {/* Options */}
        <div className={`grid ${step.options.length > 4 ? "grid-cols-2" : "grid-cols-2"} gap-3 mb-10`}>
          {step.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => selectOption(opt.value)}
              className={`text-left rounded-xl border p-4 transition-all duration-150 ${
                isSelected(opt.value)
                  ? "border-[#7F77DD] bg-[#1a1830]"
                  : "border-[#2C2C2A] bg-[#0f1117] hover:border-[#444441]"
              }`}
            >
              <p className={`text-sm font-medium mb-0.5 ${
                isSelected(opt.value) ? "text-[#AFA9EC]" : "text-white"
              }`}>
                {opt.label}
              </p>
              <p className="text-[11px] text-[#888780]">{opt.sub}</p>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
  onClick={() => {
    let prevStep = currentStep - 1;
    if (steps[prevStep]?.id === "field" &&
        (answers.stage === "secondary" || answers.stage === "applicant")) {
      prevStep = prevStep - 1;
    }
    setCurrentStep(Math.max(0, prevStep));
  }}
  disabled={currentStep === 0}
  className="border border-[#2C2C2A] text-[#888780] rounded-lg px-5 py-2.5 text-sm disabled:opacity-30 hover:border-[#444441] transition"
>
  Back
</button>
          <button
            onClick={handleNext}
            disabled={!canContinue() || saving}
            className="bg-[#534AB7] hover:bg-[#4840a0] text-white rounded-lg px-6 py-2.5 text-sm font-medium transition disabled:opacity-40"
          >
            {saving
              ? "Saving..."
              : currentStep === total - 1
              ? "Build my path →"
              : "Continue →"}
          </button>
        </div>

      </div>
    </div>
  );
}