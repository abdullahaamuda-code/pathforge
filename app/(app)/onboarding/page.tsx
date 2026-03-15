"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { t, interpolate } from "@/lib/i18n";

export default function OnboardingPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  const lang = answers.language || "en";

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
      tag: t(lang, "onboarding.stage"),
      question: t(lang, "onboarding.stageQuestion"),
      sub: t(lang, "onboarding.stageSub"),
      type: "single",
      options: [
        { value: "secondary", label: t(lang, "onboarding.secondary"), sub: t(lang, "onboarding.secondarySub") },
        { value: "applicant", label: t(lang, "onboarding.applicant"), sub: t(lang, "onboarding.applicantSub") },
        { value: "undergraduate", label: t(lang, "onboarding.undergraduate"), sub: t(lang, "onboarding.undergraduateSub") },
        { value: "graduate", label: t(lang, "onboarding.graduate"), sub: t(lang, "onboarding.graduateSub") },
      ],
    },
    {
      id: "country",
      tag: t(lang, "onboarding.country"),
      question: t(lang, "onboarding.countryQuestion"),
      sub: t(lang, "onboarding.countrySub"),
      type: "single",
      options: [
        { value: "Nigeria", label: "Nigeria", sub: "West Africa" },
        { value: "Senegal", label: "Senegal", sub: "West Africa" },
        { value: "Ghana", label: "Ghana", sub: "West Africa" },
        { value: "Kenya", label: "Kenya", sub: "East Africa" },
        { value: "South Africa", label: "South Africa", sub: "Southern Africa" },
        { value: "Côte d'Ivoire", label: "Côte d'Ivoire", sub: "West Africa" },
        { value: "United Kingdom", label: "United Kingdom", sub: "Europe" },
        { value: "Other", label: lang === "fr" ? "Autre pays" : "Other country", sub: lang === "fr" ? "Reste du monde" : "Rest of the world" },
      ],
    },
    {
      id: "interests",
      tag: t(lang, "onboarding.interests"),
      question: t(lang, "onboarding.interestsQuestion"),
      sub: t(lang, "onboarding.interestsSub"),
      type: "multi",
      max: 3,
      options: [
        { value: "technology", label: lang === "fr" ? "Technologie" : "Technology", sub: lang === "fr" ? "Logiciels, IA, ingénierie" : "Software, AI, engineering" },
        { value: "business", label: lang === "fr" ? "Commerce" : "Business", sub: lang === "fr" ? "Finance, marketing, stratégie" : "Finance, marketing, strategy" },
        { value: "health", label: lang === "fr" ? "Santé et médecine" : "Health & medicine", sub: lang === "fr" ? "Médecine, pharmacie, soins" : "Medicine, pharmacy, nursing" },
        { value: "creative", label: lang === "fr" ? "Arts créatifs" : "Creative arts", sub: lang === "fr" ? "Design, médias, contenu" : "Design, media, content" },
        { value: "law", label: lang === "fr" ? "Droit et politique" : "Law & policy", sub: lang === "fr" ? "Droit, gouvernance, diplomatie" : "Legal, governance, diplomacy" },
        { value: "science", label: lang === "fr" ? "Sciences et recherche" : "Science & research", sub: lang === "fr" ? "Biologie, chimie, physique" : "Biology, chemistry, physics" },
        { value: "education", label: lang === "fr" ? "Éducation" : "Education", sub: lang === "fr" ? "Enseignement, formation" : "Teaching, curriculum, training" },
        { value: "social", label: lang === "fr" ? "Impact social" : "Social impact", sub: lang === "fr" ? "ONG, développement, communauté" : "NGOs, development, community" },
      ],
    },
    {
      id: "field",
      tag: t(lang, "onboarding.field"),
      question: t(lang, "onboarding.fieldQuestion"),
      sub: t(lang, "onboarding.fieldSub"),
      type: "single",
      options: [
        { value: "engineering", label: lang === "fr" ? "Ingénierie et technologie" : "Engineering & technology", sub: lang === "fr" ? "Informatique, électronique etc" : "Computer science, electrical etc" },
        { value: "medicine", label: lang === "fr" ? "Médecine et sciences de la santé" : "Medicine & health sciences", sub: lang === "fr" ? "Médecine, pharmacie, soins" : "Medicine, pharmacy, nursing" },
        { value: "business", label: lang === "fr" ? "Commerce et économie" : "Business & economics", sub: lang === "fr" ? "Comptabilité, finance, gestion" : "Accounting, finance, management" },
        { value: "law", label: lang === "fr" ? "Droit" : "Law", sub: lang === "fr" ? "Études juridiques" : "LLB, legal studies" },
        { value: "arts", label: lang === "fr" ? "Arts et lettres" : "Arts & humanities", sub: lang === "fr" ? "Littérature, histoire, philosophie" : "English, history, philosophy" },
        { value: "sciences", label: lang === "fr" ? "Sciences pures" : "Pure sciences", sub: lang === "fr" ? "Biologie, chimie, physique" : "Biology, chemistry, physics" },
        { value: "social_sciences", label: lang === "fr" ? "Sciences sociales" : "Social sciences", sub: lang === "fr" ? "Sociologie, sciences politiques" : "Sociology, political science" },
        { value: "education", label: lang === "fr" ? "Éducation" : "Education", sub: lang === "fr" ? "Enseignement, formation" : "Teaching, curriculum" },
      ],
    },
    {
      id: "skills",
      tag: t(lang, "onboarding.skills"),
      question: t(lang, "onboarding.skillsQuestion"),
      sub: t(lang, "onboarding.skillsSub"),
      type: "multi",
      max: 10,
      options: [
        { value: "microsoft_office", label: "Microsoft Office", sub: "Word, Excel, PowerPoint" },
        { value: "public_speaking", label: lang === "fr" ? "Prise de parole en public" : "Public speaking", sub: lang === "fr" ? "Présentations, débats" : "Presentations, debates" },
        { value: "writing", label: lang === "fr" ? "Rédaction" : "Writing", sub: lang === "fr" ? "Essais, rapports, contenu" : "Essays, reports, content" },
        { value: "python", label: "Python", sub: lang === "fr" ? "Langage de programmation" : "Programming language" },
        { value: "data_analysis", label: lang === "fr" ? "Analyse de données" : "Data analysis", sub: "Excel, SPSS, R" },
        { value: "graphic_design", label: lang === "fr" ? "Design graphique" : "Graphic design", sub: "Canva, Photoshop" },
        { value: "social_media", label: lang === "fr" ? "Réseaux sociaux" : "Social media", sub: lang === "fr" ? "Création de contenu" : "Content creation, management" },
        { value: "research", label: lang === "fr" ? "Recherche" : "Research", sub: lang === "fr" ? "Recherche académique ou marché" : "Academic or market research" },
        { value: "coding", label: lang === "fr" ? "Développement web" : "Web development", sub: "HTML, CSS, JavaScript" },
        { value: "video_editing", label: lang === "fr" ? "Montage vidéo" : "Video editing", sub: "Premiere, CapCut" },
        { value: "none", label: lang === "fr" ? "Aucune pour l'instant" : "None yet", sub: lang === "fr" ? "Je commence de zéro" : "Starting from scratch" },
      ],
    },
    {
      id: "careerGoal",
      tag: t(lang, "onboarding.goal"),
      question: t(lang, "onboarding.goalQuestion"),
      sub: t(lang, "onboarding.goalSub"),
      type: "single",
      options: [
        { value: "explore", label: lang === "fr" ? "J'explore encore" : "I'm still exploring", sub: lang === "fr" ? "Aidez-moi à trouver ce qui me convient" : "Help me figure out what suits me" },
        { value: "skill", label: lang === "fr" ? "Développer des compétences" : "Build specific skills", sub: lang === "fr" ? "Je sais ce que je veux apprendre" : "I know what I want to learn" },
        { value: "job", label: lang === "fr" ? "Trouver un emploi ou stage" : "Get a job or internship", sub: lang === "fr" ? "Je cherche activement" : "I'm actively looking" },
        { value: "abroad", label: lang === "fr" ? "Étudier ou travailler à l'étranger" : "Study or work abroad", sub: lang === "fr" ? "Bourses, programmes, relocation" : "Scholarships, programs, relocation" },
      ],
    },
  ];

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
          <span className="text-[#444441] text-xs">
            {interpolate(t(lang, "onboarding.stepOf"), { current: currentStep + 1, total })}
          </span>
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
        <div className="grid grid-cols-2 gap-3 mb-10">
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
            {t(lang, "onboarding.back")}
          </button>
          <button
            onClick={handleNext}
            disabled={!canContinue() || saving}
            className="bg-[#534AB7] hover:bg-[#4840a0] text-white rounded-lg px-6 py-2.5 text-sm font-medium transition disabled:opacity-40"
          >
            {saving
              ? t(lang, "onboarding.saving")
              : currentStep === total - 1
              ? t(lang, "onboarding.buildMyPath")
              : t(lang, "onboarding.continue")}
          </button>
        </div>

      </div>
    </div>
  );
}
