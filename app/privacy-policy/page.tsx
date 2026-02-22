"use client"

import Header from "@/components/Header"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen wood-background">
      <Header currentPage="Privacy Policy" />

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-amber-950/80 border border-amber-700/50 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2 text-center">Privacy Policy</h1>
          <p className="text-amber-300/60 text-sm text-center mb-8">Effective Date: February 22, 2026</p>

          <div className="space-y-6 text-amber-100/80 text-sm leading-relaxed">
            <p>
              YsUp Campus Network ("YsUp," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the YsUp Campus platform ("Platform"), available at YsUpCampus.com. Please read this policy carefully.
            </p>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">1. Information We Collect</h2>
              <h3 className="font-semibold text-amber-200 mb-1">a. Information You Provide</h3>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Account registration details: first name, last name, username, phone number, college/university, password (stored as a secure hash)</li>
                <li>Profile information: major, academic year, bio, profile photo</li>
                <li>Content you create: posts, responses, sticky notes, uploaded files, calendar events, network messages</li>
                <li>Phone verification data: phone number for SMS verification during signup and password reset</li>
              </ul>
              <h3 className="font-semibold text-amber-200 mb-1">b. Information Collected Automatically</h3>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>Usage data: pages visited, features used, search queries</li>
                <li>Device and browser information</li>
                <li>IP address and approximate location</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
              <h3 className="font-semibold text-amber-200 mb-1">c. Information from Third Parties</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Google Workspace data (Docs, Sheets, Slides) when you connect your Google account via OAuth 2.0</li>
                <li>Search results from third-party APIs (Google Books, OpenAlex, Wikipedia, DuckDuckGo)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To create and manage your account</li>
                <li>To verify your identity via SMS phone verification</li>
                <li>To provide, maintain, and improve the Platform's features</li>
                <li>To facilitate class networks, social interactions, and academic collaboration</li>
                <li>To power AI-assisted features (topic overviews, summaries, coaching) via OpenAI</li>
                <li>To send notifications about activity, events, and YBucks rewards</li>
                <li>To process search queries across academic databases and web sources</li>
                <li>To enable calendar events, RSVP tracking, and meeting room functionality</li>
                <li>To enforce our Terms and Conditions and Honor Code</li>
                <li>To detect, prevent, and address fraud, abuse, or security issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">3. How We Share Your Information</h2>
              <p className="mb-2">We do not sell your personal information. We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-amber-200">With Other Users:</strong> Your profile information (name, username, college, major, year, bio, profile photo) is visible to other users on the Platform. Posts, responses, and network activity are visible to members of your class networks.</li>
                <li><strong className="text-amber-200">Service Providers:</strong> We use third-party services including Twilio (SMS), OpenAI (AI features), Google (Workspace integration), and cloud hosting providers to operate the Platform.</li>
                <li><strong className="text-amber-200">Legal Requirements:</strong> We may disclose information if required by law, regulation, legal process, or governmental request.</li>
                <li><strong className="text-amber-200">Safety:</strong> We may share information to protect the rights, property, or safety of YsUp, our users, or the public.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">4. Data Storage and Security</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your data is stored in secure PostgreSQL databases hosted on Replit's infrastructure.</li>
                <li>Passwords are hashed using bcrypt and never stored in plaintext.</li>
                <li>SMS verification codes are hashed and expire after 10 minutes.</li>
                <li>Google OAuth tokens are encrypted using AES-256-GCM.</li>
                <li>We implement industry-standard security measures, but no system is 100% secure. We cannot guarantee absolute security.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">5. Your Rights and Choices</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-amber-200">Access:</strong> You can view your profile information at any time through your dashboard.</li>
                <li><strong className="text-amber-200">Update:</strong> You can update your profile, bio, major, and other information.</li>
                <li><strong className="text-amber-200">Delete:</strong> You may request account deletion by contacting us. Deletion will remove your profile and personal data, though some content may remain in anonymized form.</li>
                <li><strong className="text-amber-200">Opt-Out:</strong> You can disconnect Google Workspace integration at any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">6. Children's Privacy</h2>
              <p>
                YsUp Campus is designed for college and university students. We do not knowingly collect information from individuals under the age of 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">7. Third-Party Services</h2>
              <p>
                The Platform integrates with third-party services (Google, OpenAI, Twilio, Amazon, etc.). These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">8. Cookies</h2>
              <p>
                We use cookies and local storage to maintain your session, remember preferences, and improve your experience. You may disable cookies through your browser settings, but some features may not function properly without them.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify users of material changes by posting the new policy on this page and updating the effective date. Continued use of the Platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-yellow-400 mb-2">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or your personal data, please contact us at:
              </p>
              <p className="mt-2 text-amber-200">
                YsUp Campus Network<br />
                Email: privacy@ysupcampus.com
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
