"use client"

import React, { useState, useRef, useEffect } from "react"
import Header from "@/components/Header"
import {
  GraduationCap, BookOpen, Newspaper, Users, MapPin, Calendar, FlaskConical,
  Award, ChevronRight, ExternalLink, Star, Globe, Heart, Building2, Lightbulb
} from "lucide-react"

type SectionKey = "home" | "news" | "academics" | "admissions" | "campus" | "events" | "research" | "legacy"

interface PageContent {
  key: SectionKey
  title: string
}

const navItems: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "home", label: "Home", icon: <Building2 className="w-3.5 h-3.5" /> },
  { key: "news", label: "News", icon: <Newspaper className="w-3.5 h-3.5" /> },
  { key: "academics", label: "Academics", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { key: "admissions", label: "Admissions", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { key: "campus", label: "Campus Life", icon: <MapPin className="w-3.5 h-3.5" /> },
  { key: "events", label: "Events", icon: <Calendar className="w-3.5 h-3.5" /> },
  { key: "research", label: "Research", icon: <FlaskConical className="w-3.5 h-3.5" /> },
  { key: "legacy", label: "Legacy", icon: <Award className="w-3.5 h-3.5" /> },
]

function HomeSection({ onNavigate }: { onNavigate: (key: SectionKey) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-lg p-6 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">HOWARD</h1>
          <h2 className="text-lg md:text-xl font-light tracking-widest mb-3">UNIVERSITY</h2>
          <div className="w-16 h-0.5 bg-red-500 mx-auto mb-3" />
          <p className="text-blue-200 text-sm leading-relaxed max-w-xs mx-auto">
            Howard&apos;s talented student body includes scholars, student researchers, premier athletes, emerging artists, and entrepreneurs.
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={() => onNavigate("admissions")} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-xs font-bold transition-colors">
              Apply Now
            </button>
            <button onClick={() => onNavigate("academics")} className="border border-white/50 hover:bg-white/10 text-white px-4 py-1.5 rounded text-xs font-bold transition-colors">
              Explore Programs
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
            <Star className="w-4 h-4 text-blue-700" /> #1 HBCU in America
          </h3>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          LinkedIn and Forbes have named Howard University as the Nation&apos;s #1 HBCU. Excellence in Truth and Service is reflected in all that we do.
        </p>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-sm mb-3">We Are Howard</h3>
        <div className="space-y-2.5">
          {[
            { title: "Legacy: Mathematics", desc: "Howard's mathematicians help lay the foundations of A.I. and more.", color: "bg-blue-50 border-blue-200" },
            { title: "Legacy: Civic Leadership", desc: "Legendary trailblazers have shaped public policy around the world.", color: "bg-red-50 border-red-200" },
            { title: "Legacy: Health & Medicine", desc: "Faculty and researchers have saved countless lives around the globe.", color: "bg-green-50 border-green-200" },
          ].map((item, i) => (
            <div key={i} className={`${item.color} border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`} onClick={() => onNavigate("legacy")}>
              <h4 className="font-bold text-gray-800 text-xs">{item.title}</h4>
              <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-xs text-gray-500 italic">&ldquo;Veritas et Utilitas&rdquo;</p>
        <p className="text-xs text-gray-700 font-medium mt-1">Excellence in Truth and Service</p>
      </div>
    </div>
  )
}

function NewsSection() {
  const articles = [
    { date: "Feb 20, 2026", title: "HU-MasterCard Inclusive Growth Thought Leadership Lecture Series Kicks Off Howard's 2026 Data Week", category: "Campus" },
    { date: "Feb 20, 2026", title: "National Black Movie Day: Two Howard Shorts You Should Watch This Weekend", category: "Arts" },
    { date: "Feb 20, 2026", title: "'Full of Strength': Dr. Jelani Cobb's Howard Origins", category: "Faculty" },
    { date: "Feb 17, 2026", title: "For Howard University, Jesse Louis Jackson Sr. Was A Bridge Between Generations", category: "Community" },
  ]

  return (
    <div className="space-y-5">
      <div className="border-b-2 border-blue-800 pb-2">
        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <Newspaper className="w-5 h-5" /> The Dig - Howard News
        </h2>
      </div>

      <div className="bg-blue-900 text-white rounded-lg p-4">
        <span className="text-xs bg-red-600 px-2 py-0.5 rounded font-bold">FEATURED</span>
        <h3 className="font-bold mt-2 text-sm leading-snug">For Howard University, Jesse Louis Jackson Sr. Was A Bridge Between Generations</h3>
        <p className="text-xs text-blue-200 mt-2 leading-relaxed">
          Jesse Jackson lived a life of truth and service on an international scale and was a treasured part of the Howard community.
        </p>
        <div className="flex items-center gap-1 mt-3 text-blue-300 text-xs">
          <Calendar className="w-3 h-3" /> Feb 17, 2026
        </div>
      </div>

      <div className="space-y-3">
        {articles.map((article, i) => (
          <div key={i} className="border-b border-gray-200 pb-3 last:border-0 hover:bg-gray-50 transition-colors rounded p-2 -mx-2 cursor-pointer">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-blue-600 font-bold">{article.category}</span>
                  <span className="text-xs text-gray-400">{article.date}</span>
                </div>
                <h4 className="text-xs font-semibold text-gray-800 leading-snug">{article.title}</h4>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      <a href="https://thedig.howard.edu/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-bold">
        View All News at The Dig <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}

function AcademicsSection({ onNavigate }: { onNavigate: (key: SectionKey) => void }) {
  const programs = [
    { level: "Undergraduate", desc: "Howard is one of the world's most prestigious destinations for undergraduate education in a wide range of studies.", color: "bg-blue-600" },
    { level: "Graduate", desc: "Offering a diverse suite of degrees and programs, our Graduate School prepares students to seek truth and knowledge.", color: "bg-blue-700" },
    { level: "Professional", desc: "Howard's professional programs are academically rich and provide experiences that propel students to succeed.", color: "bg-blue-800" },
    { level: "Doctoral", desc: "Ranging from humanities to scientific disciplines, Howard offers programs leveraging interdisciplinary strengths.", color: "bg-blue-900" },
  ]

  return (
    <div className="space-y-5">
      <div className="border-b-2 border-blue-800 pb-2">
        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Academics
        </h2>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        Apply to more than <span className="font-bold text-blue-800">130 areas of study</span> across <span className="font-bold text-blue-800">14 schools and colleges</span>.
      </p>

      <div className="space-y-2.5">
        {programs.map((prog, i) => (
          <div key={i} className="rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("admissions")}>
            <div className={`${prog.color} text-white px-4 py-2`}>
              <h4 className="font-bold text-sm">{prog.level}</h4>
            </div>
            <div className="bg-gray-50 px-4 py-3 border border-t-0 border-gray-200 rounded-b-lg">
              <p className="text-xs text-gray-600 leading-relaxed">{prog.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <Lightbulb className="w-6 h-6 text-blue-600 mx-auto mb-2" />
        <h4 className="font-bold text-sm text-blue-900">Fields of Study</h4>
        <p className="text-xs text-blue-700 mt-1">Explore all programs and find your path at Howard University.</p>
        <a href="https://howard.edu/fields-of-study" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-700 hover:text-blue-900">
          Explore All Programs <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

function AdmissionsSection() {
  return (
    <div className="space-y-5">
      <div className="border-b-2 border-red-700 pb-2">
        <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5" /> Admissions
        </h2>
      </div>

      <div className="bg-gradient-to-br from-red-700 to-red-900 text-white rounded-lg p-5 text-center">
        <h3 className="text-xl font-bold mb-2">Take Your Next Step</h3>
        <p className="text-red-200 text-xs mb-4">Join a community of scholars, leaders, and innovators.</p>
        <div className="space-y-2">
          <a href="https://admission.howard.edu/" target="_blank" rel="noopener noreferrer" className="block bg-white text-red-800 font-bold text-sm py-2 rounded hover:bg-red-50 transition-colors">
            Apply Now
          </a>
          <a href="https://admission.howard.edu/mailing-list" target="_blank" rel="noopener noreferrer" className="block border border-white/50 text-white font-bold text-sm py-2 rounded hover:bg-white/10 transition-colors">
            Request Information
          </a>
          <a href="https://admission.howard.edu/visit" target="_blank" rel="noopener noreferrer" className="block border border-white/50 text-white font-bold text-sm py-2 rounded hover:bg-white/10 transition-colors">
            Schedule a Visit
          </a>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-sm mb-3">Howard at a Glance</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Areas of Study", value: "130+" },
            { label: "Schools & Colleges", value: "14" },
            { label: "Student-Faculty Ratio", value: "11:1" },
            { label: "Founded", value: "1867" },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-800">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-bold text-sm text-blue-900 mb-2 flex items-center gap-1">
          <Globe className="w-4 h-4" /> Virtual Tour
        </h4>
        <p className="text-xs text-gray-600 mb-2">Experience Howard&apos;s campus from anywhere in the world.</p>
        <a href="https://admission.howard.edu/virtual-tour" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900">
          Take a Virtual Tour <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}

function CampusSection() {
  return (
    <div className="space-y-5">
      <div className="border-b-2 border-blue-800 pb-2">
        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <MapPin className="w-5 h-5" /> Campus Life
        </h2>
      </div>

      <blockquote className="border-l-4 border-blue-600 pl-3 py-1 italic text-xs text-gray-600 leading-relaxed">
        &ldquo;We are committed to building a student-centered community that supports the achievement of students&apos; academic, career and personal goals, while promoting civility, respect and equity.&rdquo;
      </blockquote>

      <div>
        <h3 className="font-bold text-gray-800 text-sm mb-3">Our Campus</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-gray-700 leading-relaxed">
            Howard&apos;s main campus is home to <span className="font-bold">256 acres</span> of land across the District of Columbia and Maryland. 
            With the Main Campus in northwest DC, the School of Law, School of Divinity, and research facility each have dedicated campuses nearby.
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-sm mb-3">Our City</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-xs text-gray-700 leading-relaxed">
            Our urban location in <span className="font-bold">Washington, D.C.</span> places us at the center of one of the world&apos;s most powerful hubs of influence — government, health, technology, economies, the arts, and more.
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-sm mb-3">Student Life</h3>
        <div className="space-y-2">
          {[
            { title: "Student Organizations", desc: "200+ clubs and organizations to join" },
            { title: "Greek Life", desc: "Rich tradition of Divine Nine fraternities and sororities" },
            { title: "Athletics", desc: "Bison compete in 19 NCAA Division I sports" },
            { title: "Arts & Culture", desc: "Theater, music, fine arts, and cultural programming" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EventsSection() {
  const events = [
    { date: "Feb 21", title: "Howard University Women's Bowling at MEAC #2/NSU", type: "Athletics" },
    { date: "Feb 21", title: "Howard University Women's Golf at Arcis HBCU Championship", type: "Athletics" },
    { date: "Feb 21", title: "HU African Indigenous Knowledge and Languages Conference 2026", type: "Academic" },
    { date: "Feb 21", title: "Research Month Call for Abstracts", type: "Research" },
    { date: "Feb 21", title: "Howard University Volunteer Income Tax Assistance Program", type: "Community" },
    { date: "Feb 21", title: "BisonHacks 26: Presented by Ticketmaster", type: "Technology" },
    { date: "Feb 21", title: "Howard University Women's Tennis at VCU", type: "Athletics" },
    { date: "Feb 21", title: "Howard University Men's Basketball vs North Carolina Central", type: "Athletics" },
  ]

  return (
    <div className="space-y-5">
      <div className="border-b-2 border-blue-800 pb-2">
        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Upcoming Events
        </h2>
      </div>

      <div className="space-y-2">
        {events.map((event, i) => (
          <div key={i} className="flex gap-3 p-2.5 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer hover:border-blue-300">
            <div className="bg-blue-800 text-white rounded-lg p-2 text-center min-w-[50px] flex-shrink-0">
              <div className="text-xs font-bold">{event.date.split(" ")[0]}</div>
              <div className="text-lg font-bold leading-tight">{event.date.split(" ")[1]}</div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-blue-600 font-bold">{event.type}</span>
              <h4 className="text-xs font-semibold text-gray-800 leading-snug mt-0.5">{event.title}</h4>
            </div>
          </div>
        ))}
      </div>

      <a href="https://events.howard.edu/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-bold">
        View All Events <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}

function ResearchSection() {
  return (
    <div className="space-y-5">
      <div className="border-b-2 border-blue-800 pb-2">
        <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <FlaskConical className="w-5 h-5" /> Research, Centers & Institutes
        </h2>
      </div>

      <blockquote className="border-l-4 border-blue-600 pl-3 py-1 italic text-xs text-gray-600 leading-relaxed">
        Howard researchers and thought leaders are tackling the most pressing challenges facing humanity, including health and medical issues, economic disparities, cybersecurity, nanotechnology, artificial intelligence, and more.
      </blockquote>

      <div>
        <h3 className="font-bold text-gray-800 text-sm mb-3">Research Areas</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Health & Medicine", "Cybersecurity", "Nanotechnology", "AI & Machine Learning",
            "Economic Policy", "Journalism & Democracy", "Energy Systems", "Women's Leadership"
          ].map((area, i) => (
            <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-center">
              <span className="text-xs font-medium text-blue-800">{area}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-lg p-4">
        <h4 className="font-bold text-sm mb-2">Howard's Impact</h4>
        <p className="text-xs text-blue-200 leading-relaxed">
          Howard University faculty laid the foundation for artificial intelligence, launched the first HBCU Ph.D. program in mathematics, and are today pioneers on the frontier of quantum computing and data science.
        </p>
      </div>

      <a href="https://howard.edu/centers-institutes" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-bold">
        Learn More About Centers & Institutes <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}

function LegacySection() {
  const alumni = [
    { name: "Patricia Bath", year: "Class of 1968", title: "Ophthalmologist, Inventor, Health Advocate" },
    { name: "Beth Brown", year: "Class of 1991", title: "Astrophysicist & Educator" },
    { name: "Elijah Cummings", year: "Class of 1973", title: "House Representative, Civil Rights Leader" },
    { name: "David Dinkins", year: "Class of 1950", title: "Former Mayor of New York City" },
    { name: "Kamala Harris", year: "Class of 1986", title: "Vice President of the United States" },
    { name: "Taraji P. Henson", year: "Class of 1995", title: "Actress, Producer, Mental Health Advocate" },
    { name: "Zora Neale Hurston", year: "Class of 1920", title: "Author, Anthropologist" },
    { name: "Kwame Ture", year: "Class of 1964", title: "Pan-African Activist & Organizer" },
  ]

  return (
    <div className="space-y-5">
      <div className="border-b-2 border-red-700 pb-2">
        <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
          <Award className="w-5 h-5" /> Our Legacy
        </h2>
      </div>

      <div className="text-center py-2">
        <h3 className="font-bold text-gray-800">A Promise of Excellence</h3>
        <p className="text-xs text-gray-500 italic mt-1">Since 1867</p>
      </div>

      <div className="space-y-2">
        {alumni.map((person, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer hover:border-blue-300">
            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
              {person.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-800">{person.name}</h4>
              <p className="text-xs text-blue-600 font-medium">{person.year}</p>
              <p className="text-xs text-gray-500 truncate">{person.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderSection(key: SectionKey, onNavigate: (key: SectionKey) => void) {
  switch (key) {
    case "home": return <HomeSection onNavigate={onNavigate} />
    case "news": return <NewsSection />
    case "academics": return <AcademicsSection onNavigate={onNavigate} />
    case "admissions": return <AdmissionsSection />
    case "campus": return <CampusSection />
    case "events": return <EventsSection />
    case "research": return <ResearchSection />
    case "legacy": return <LegacySection />
  }
}

export default function BisonWebPage() {
  const [pageReady, setPageReady] = useState(false)
  const [rightPage, setRightPage] = useState<PageContent>({ key: "home", title: "Home" })
  const [leftPage, setLeftPage] = useState<PageContent | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const rightPageRef = useRef<HTMLDivElement>(null)

  const handleNavigate = (key: SectionKey) => {
    if (key === rightPage.key) return

    setIsTransitioning(true)
    setTimeout(() => {
      setLeftPage({ ...rightPage })
      const navItem = navItems.find(n => n.key === key)
      setRightPage({ key, title: navItem?.label || key })

      if (rightPageRef.current) {
        rightPageRef.current.scrollTop = 0
      }

      setIsTransitioning(false)
    }, 300)
  }

  useEffect(() => {
    setPageReady(true)
  }, [])

  if (!pageReady) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(145deg, #3e2723 0%, #5d4037 30%, #4e342e 50%, #3e2723 70%, #2c1a12 100%)",
      }}
    >
      <Header currentPage="Homepage" />

      <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative w-full max-w-6xl flex flex-col flex-1 min-h-0">
          <nav aria-label="Magazine sections" className="flex items-center justify-center gap-1 md:gap-2 mb-3 md:mb-4 flex-wrap">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                aria-current={rightPage.key === item.key ? "page" : undefined}
                aria-label={`Go to ${item.label}`}
                className={`flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  rightPage.key === item.key
                    ? "bg-amber-100 text-amber-900 shadow-md border border-amber-300"
                    : "text-amber-200/80 hover:text-white hover:bg-white/10 border border-transparent"
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1 flex items-stretch min-h-0 relative">
            <div className="absolute -left-3 -right-3 -top-2 -bottom-2 rounded-xl opacity-30 pointer-events-none"
              style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)" }}
            />

            <div className="flex flex-col md:flex-row w-full relative z-10 rounded-xl overflow-hidden" style={{ minHeight: "500px" }}>
              <div className="flex flex-1 relative order-2 md:order-1"
                style={{
                  background: "linear-gradient(135deg, #faf8f5 0%, #f5f0e8 40%, #ede6da 100%)",
                  boxShadow: "inset -8px 0 20px -10px rgba(0,0,0,0.15), inset 0 0 30px rgba(0,0,0,0.03)",
                }}
              >
                <div className="hidden md:block absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-amber-200/50 to-transparent" />
                <div className="hidden md:block absolute top-0 bottom-0 right-1 w-px bg-gradient-to-b from-transparent via-amber-300/30 to-transparent" />

                <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar magazine-page-content" aria-label="Previous page">
                  {leftPage ? (
                    <div className={`transition-all duration-500 ${isTransitioning ? "opacity-0 translate-x-[-20px]" : "opacity-100 translate-x-0"}`}>
                      <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">{leftPage.title}</div>
                      {renderSection(leftPage.key, handleNavigate)}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-300">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium opacity-40">Howard University</p>
                        <p className="text-xs opacity-30 mt-1">Navigate to view previous pages here</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 text-xs text-gray-300 italic hidden md:block">
                  {leftPage ? `— ${leftPage.title}` : ""}
                </div>
              </div>

              <div className="hidden md:block w-3 md:w-4 relative flex-shrink-0 z-20 order-2"
                style={{
                  background: "linear-gradient(90deg, #d4c5a9 0%, #c4b494 20%, #b5a584 40%, #c4b494 60%, #d4c5a9 80%, #e0d4be 100%)",
                  boxShadow: "inset 0 0 8px rgba(0,0,0,0.3), 2px 0 8px rgba(0,0,0,0.1), -2px 0 8px rgba(0,0,0,0.1)",
                }}
              >
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.05) 8px, rgba(0,0,0,0.05) 9px)`,
                  }}
                />
              </div>

              <div className="flex-1 relative order-1 md:order-3"
                style={{
                  background: "linear-gradient(225deg, #faf8f5 0%, #f5f0e8 40%, #ede6da 100%)",
                  boxShadow: "inset 8px 0 20px -10px rgba(0,0,0,0.15), inset 0 0 30px rgba(0,0,0,0.03)",
                }}
              >
                <div className="hidden md:block absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-amber-200/50 to-transparent" />
                <div className="hidden md:block absolute top-0 bottom-0 left-1 w-px bg-gradient-to-b from-transparent via-amber-300/30 to-transparent" />

                <div ref={rightPageRef} className="flex-1 overflow-y-auto p-4 md:p-6 h-full custom-scrollbar magazine-page-content" aria-label="Current page">
                  <div className={`transition-all duration-500 ${isTransitioning ? "opacity-0 translate-x-[20px]" : "opacity-100 translate-x-0"}`}>
                    <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">{rightPage.title}</div>
                    {renderSection(rightPage.key, handleNavigate)}
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 text-xs text-gray-300 italic hidden md:block">
                  howard.edu
                </div>
              </div>

              <div className="md:hidden w-full h-1 relative flex-shrink-0 z-20 order-2"
                style={{
                  background: "linear-gradient(180deg, #d4c5a9 0%, #c4b494 40%, #d4c5a9 100%)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              />
            </div>
          </div>

          <div className="text-center mt-3">
            <p className="text-amber-400/40 text-xs">Howard University &bull; 2400 Sixth Street NW, Washington, DC 20059</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(180, 160, 120, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(180, 160, 120, 0.5);
        }
      `}</style>
    </div>
  )
}
