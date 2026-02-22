"use client"

import Header from "@/components/Header"
import Link from "next/link"

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Terms & Conditions" />

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-amber-950/80 border border-amber-700/50 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2 text-center">Terms & Conditions</h1>
          <p className="text-amber-300/60 text-sm text-center mb-8">Effective Date: February 22, 2026</p>

          <div className="space-y-6 text-amber-100/80 text-sm leading-relaxed">
            <p>
              Welcome to YsUp Campus Network ("YsUp," "we," "us," or "our"). These Terms and Conditions ("Terms") govern your access to and use of the YsUp Campus platform ("Platform"), available at YsUpCampus.com. By creating an account or using the Platform, you agree to be bound by these Terms.
            </p>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">1. Eligibility</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must be at least 13 years of age to use the Platform.</li>
                <li>You must be a current or prospective student, faculty member, or staff member of an HBCU (Historically Black College or University) or affiliated institution.</li>
                <li>By creating an account, you represent that all registration information you provide is truthful and accurate.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">2. Account Registration</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must provide a valid phone number, a unique username, and a password to create an account.</li>
                <li>Multiple accounts may share the same phone number, but each account must have a unique username.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You are responsible for all activity that occurs under your account.</li>
                <li>You must verify your phone number via SMS to complete registration.</li>
                <li>You agree to notify us immediately of any unauthorized use of your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">3. Acceptable Use</h2>
              <p className="mb-2">When using the Platform, you agree to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Comply with all applicable laws and regulations.</li>
                <li>Respect the rights and dignity of other users.</li>
                <li>Use the Platform for lawful, educational, and community-building purposes.</li>
                <li>Abide by the YsUp Honor Code presented during onboarding.</li>
              </ul>
              <p className="mb-2">You agree NOT to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Platform to harass, bully, threaten, or intimidate others.</li>
                <li>Post or share content that is defamatory, obscene, hateful, or discriminatory.</li>
                <li>Upload or distribute copyrighted material without authorization.</li>
                <li>Attempt to hack, exploit, or compromise the Platform's security.</li>
                <li>Impersonate another person or misrepresent your identity.</li>
                <li>Use automated tools (bots, scrapers) to access the Platform without permission.</li>
                <li>Use AI features to engage in academic dishonesty.</li>
                <li>Engage in spam, unsolicited advertising, or commercial solicitation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">4. User Content</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You retain ownership of content you create and post on the Platform (posts, files, notes, images).</li>
                <li>By posting content, you grant YsUp a non-exclusive, royalty-free, worldwide license to display, distribute, and store your content as necessary to operate the Platform.</li>
                <li>You are solely responsible for the content you post and its compliance with applicable laws.</li>
                <li>We reserve the right to remove content that violates these Terms, the Honor Code, or applicable law.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">5. YBucks Virtual Currency</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>YBucks are a virtual, non-transferable, non-redeemable reward currency within the Platform.</li>
                <li>YBucks have no monetary value and cannot be exchanged for real currency, goods, or services outside the Platform.</li>
                <li>YBucks are earned through engagement activities (posting, responding, co-signing).</li>
                <li>We reserve the right to modify, reset, or discontinue the YBucks system at any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">6. AI-Powered Features</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Platform uses AI (powered by OpenAI) for academic search summaries, topic overviews, and coaching features.</li>
                <li>AI-generated content is provided for educational and informational purposes only.</li>
                <li>AI responses may not always be accurate, complete, or current. Users should verify information independently.</li>
                <li>YsUp is not liable for decisions made based on AI-generated content.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">7. Third-Party Integrations</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Platform integrates with third-party services including Google Workspace, Twilio, Amazon, and others.</li>
                <li>Your use of third-party services through the Platform is subject to those services' own terms and policies.</li>
                <li>We are not responsible for the availability, accuracy, or conduct of third-party services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">8. Intellectual Property</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>The YsUp name, logo, design, and all original content on the Platform are the intellectual property of YsUp Campus Network.</li>
                <li>You may not copy, reproduce, distribute, or create derivative works from Platform content without our written permission.</li>
                <li>Third-party trademarks and content displayed on the Platform belong to their respective owners.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">9. Termination</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>We may suspend or terminate your account at any time for violation of these Terms or the Honor Code.</li>
                <li>You may request account deletion by contacting us.</li>
                <li>Upon termination, your right to use the Platform ceases immediately.</li>
                <li>Provisions that by their nature should survive termination (including intellectual property, liability limitations, and indemnification) will survive.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">10. Disclaimers</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Platform is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied.</li>
                <li>We do not guarantee the Platform will be uninterrupted, error-free, or free of harmful components.</li>
                <li>We do not guarantee the accuracy of search results, AI content, or third-party data displayed on the Platform.</li>
                <li>We are not responsible for any academic consequences arising from your use of the Platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">11. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, YsUp Campus Network and its operators, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loss of data, loss of profits, or academic harm.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">12. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless YsUp Campus Network and its operators from any claims, damages, losses, or expenses (including attorney fees) arising from your use of the Platform, your content, or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the District of Columbia, United States, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">14. Changes to These Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated effective date. Your continued use of the Platform after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">15. Contact Us</h2>
              <p>
                If you have questions about these Terms, please contact us at:
              </p>
              <p className="mt-2 text-amber-200">
                YsUp Campus Network<br />
                Email: legal@ysupcampus.com
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-amber-700/30 text-center">
            <Link href="/login" className="text-amber-400 hover:text-amber-300 text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
