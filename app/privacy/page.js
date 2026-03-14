import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080a0f] text-white px-6 py-16 max-w-2xl mx-auto">
      <Link href="/" className="text-[#7F77DD] text-xs hover:underline mb-8 block">← Back to PathForge</Link>
      <h1 className="text-2xl font-medium mb-2">Privacy policy</h1>
      <p className="text-[#888780] text-xs mb-10">Last updated: January 2025</p>

      <div className="space-y-8 text-sm text-[#B4B2A9] leading-relaxed">
        <div>
          <h2 className="text-white font-medium mb-2">What we collect</h2>
          <p>We collect the information you provide during signup and onboarding — your name, email, stage, interests, skills, country, and career goals. We also collect usage data such as which opportunities you view and save.</p>
        </div>
        <div>
          <h2 className="text-white font-medium mb-2">How we use it</h2>
          <p>We use your information solely to generate your career roadmap, match you to opportunities, and personalize your experience on PathForge. We do not sell your data to third parties.</p>
        </div>
        <div>
          <h2 className="text-white font-medium mb-2">Data storage</h2>
          <p>Your data is stored securely using Google Firebase (Firestore). Authentication is handled by Firebase Auth. We use industry-standard security practices to protect your information.</p>
        </div>
        <div>
          <h2 className="text-white font-medium mb-2">AI processing</h2>
          <p>Your profile information is sent to Groq's API to generate your roadmap and match scores. This data is processed in accordance with Groq's privacy policy and is not stored by them beyond the request.</p>
        </div>
        <div>
          <h2 className="text-white font-medium mb-2">Your rights</h2>
          <p>You can request deletion of your account and all associated data at any time by contacting us at privacy@pathforge.app.</p>
        </div>
        <div>
          <h2 className="text-white font-medium mb-2">Contact</h2>
          <p>For any privacy-related questions, reach us at privacy@pathforge.app.</p>
        </div>
      </div>
    </div>
  );
}