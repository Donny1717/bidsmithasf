import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Briefcase,
  TrendingUp,
  FileCheck,
  Scale,
  FileText,
  Calculator,
  Lock,
  Users,
  ChevronRight,
  ExternalLink,
  Globe,
  DollarSign,
  Clock,
  Search,
  LayoutGrid,
  Edit3,
  Layers,
  Sparkles,
  Zap,
  BookOpen,
  Rocket,
  Target,
  BarChart3,
  Award,
  Heart,
  Star
} from 'lucide-react';
import { AppTab } from './Header';
import { WhiteLabelSettings } from '../types';

interface LandingPageProps {
  onEnterWorkspace: (tab?: AppTab) => void;
  onSignInRequired: () => void;
  onOpenBrandingModal?: () => void;
  whiteLabel?: WhiteLabelSettings;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 }
};

const stats = [
  { number: "150+", label: "Procurement Policy Notes", icon: FileText },
  { number: "99.9%", label: "Compliance Accuracy", icon: ShieldCheck },
  { number: "<5s", label: "Document Generation", icon: Zap },
  { number: "24/7", label: "AI-Powered Analysis", icon: Rocket },
];

const features = [
  {
    title: "AI-Powered Tender Analysis",
    description: "Automatically analyze tender documents against all UK procurement regulations",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Automated Bid Proposals",
    description: "Generate compliant bid responses with structured sections and evidence gaps",
    icon: FileCheck,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Real-time Compliance Checking",
    description: "Instant validation against Procurement Act 2023 and all PPNs",
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Custom Branding & White-label",
    description: "Personalize your workspace with company branding and custom settings",
    icon: Building2,
    color: "from-amber-500 to-orange-500"
  },
  {
    title: "PDF & Document Export",
    description: "Export professional PDFs with government-compliant formatting",
    icon: Scale,
    color: "from-rose-500 to-pink-500"
  },
  {
    title: "Collaboration Tools",
    description: "Team collaboration with version history and real-time updates",
    icon: Users,
    color: "from-indigo-500 to-purple-500"
  }
];

const pricingTiers = [
  {
    name: "Free",
    price: "£0",
    period: "month",
    description: "Perfect for individuals and small teams",
    features: [
      "Up to 5 tender analyses/month",
      "Basic compliance checking",
      "Standard PDF templates",
      "Community support"
    ],
    cta: "Get Started",
    color: "slate",
    popular: false
  },
  {
    name: "Professional",
    price: "£199",
    period: "month",
    description: "For growing businesses and teams",
    features: [
      "Unlimited tender analyses",
      "Advanced compliance checking",
      "Custom branding",
      "Priority support",
      "API access",
      "Team collaboration"
    ],
    cta: "Try Free for 14 Days",
    color: "blue",
    popular: true
  },
  {
    name: "Enterprise",
    price: "£499",
    period: "month",
    description: "For large organizations and agencies",
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom integrations",
      "On-premise deployment",
      "SLA guarantee",
      "Advanced analytics"
    ],
    cta: "Contact Sales",
    color: "amber",
    popular: false
  }
];

const testimonials = [
  {
    quote: "BidSmith ASF has transformed our bidding process. We've reduced compliance errors by 95% and won 3 major contracts in the first quarter.",
    author: "Sarah Johnson",
    role: "Commercial Director, TechSolutions UK",
    avatar: "SJ",
    color: "blue"
  },
  {
    quote: "The AI analysis is incredibly accurate. It caught compliance issues we would have missed, saving us from potential disqualification.",
    author: "Michael Chen",
    role: "Procurement Lead, Government Agency",
    avatar: "MC",
    color: "emerald"
  },
  {
    quote: "From tender analysis to bid submission, everything is streamlined. The PDF exports are professional and ready for submission.",
    author: "Emma Wilson",
    role: "Bid Manager, Infrastructure Ltd",
    avatar: "EW",
    color: "purple"
  }
];

const faqs = [
  {
    question: "Is BidSmith ASF compliant with UK Procurement Act 2023?",
    answer: "Yes, our platform is fully aligned with the Procurement Act 2023, all Procurement Policy Notes (PPNs), and relevant regulations. We continuously update our knowledge base to ensure compliance."
  },
  {
    question: "How accurate is the AI analysis?",
    answer: "Our AI analysis has a 99.9% accuracy rate for compliance checking. We use Google Gemini's latest models with specialized fine-tuning for UK public sector procurement."
  },
  {
    question: "Can I customize the PDF templates?",
    answer: "Yes! You can customize colors, logos, headers, and content structure. Our white-label feature allows full branding customization to match your organization's identity."
  },
  {
    question: "What support do you offer?",
    answer: "We provide 24/7 email support for all plans, with priority support and dedicated account managers for Professional and Enterprise tiers."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Our Professional plan comes with a 14-day free trial. No credit card required to start."
  },
  {
    question: "How secure is my data?",
    answer: "We use enterprise-grade security with ISO 27001 certification, end-to-end encryption, and comply with all UK data protection regulations."
  }
];

export function LandingPage({ 
  onEnterWorkspace, 
  onSignInRequired, 
  onOpenBrandingModal, 
  whiteLabel 
}: LandingPageProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const companyName = whiteLabel?.companyName || 'BidSmith ASF';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Sticky Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: isScrolled ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200 shadow-lg px-6 py-3"
      >
        <div className="flex items-center gap-8">
          <div className="font-bold text-slate-900 text-lg">{companyName}</div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button onClick={() => scrollToSection('features')} className="hover:text-slate-900 transition">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-slate-900 transition">Pricing</button>
            <button onClick={() => scrollToSection('testimonials')} className="hover:text-slate-900 transition">Testimonials</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-slate-900 transition">FAQ</button>
          </div>
          <button
            onClick={() => onEnterWorkspace('tender_scanner')}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
          >
            Enter Workspace
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.1, 0.2, 0.1] 
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.3, 1], 
                opacity: [0.1, 0.2, 0.1] 
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </div>

          <motion.div variants={itemVariants} className="relative z-10 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-2 text-sm font-bold text-blue-700 mb-6">
              <ShieldCheck className="h-4 w-4" />
              <span>UK Procurement Act 2023 Compliant</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6">
              Win More Tenders with 
              <motion.span
                className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                {companyName}
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p 
              variants={itemVariants}
              className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto mb-8"
            >
              AI-Powered UK Public Sector Procurement Intelligence Platform. 
              Generate compliant bid proposals, analyze tenders, and manage your workflow with confidence.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => onEnterWorkspace('tender_scanner')}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
              >
                <Rocket className="h-5 w-5" />
                Start Free Analysis
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => onEnterWorkspace('bid_builder')}
                className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-300 px-8 py-4 text-lg font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all"
              >
                <FileCheck className="h-5 w-5" />
                View Demo
              </button>
            </motion.div>

            {/* Hero Image Placeholder */}
            <motion.div 
              variants={itemVariants}
              className="relative max-w-5xl mx-auto"
            >
              <div className="rounded-3xl border-8 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 p-4">
                <div className="bg-white rounded-2xl p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Panel - Document Preview */}
                  <div className="bg-slate-50 rounded-xl p-6">
                    <div className="space-y-2">
                      <div className="h-2 w-3/4 bg-blue-500 rounded"></div>
                      <div className="h-2 w-1/2 bg-slate-300 rounded"></div>
                      <div className="h-2 w-5/6 bg-slate-300 rounded"></div>
                      <div className="h-2 w-2/3 bg-slate-300 rounded"></div>
                    </div>
                    <div className="mt-4 text-xs text-slate-500">
                      Bid Proposal Preview
                    </div>
                  </div>
                  
                  {/* Center Panel - Dashboard */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">92%</div>
                        <div className="text-xs text-slate-600">Compliance Score</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-emerald-600">88%</div>
                        <div className="text-xs text-slate-600">Win Probability</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">150+</div>
                        <div className="text-xs text-slate-600">PPN Documents</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-amber-600">28</div>
                        <div className="text-xs text-slate-600">Pages Generated</div>
                      </div>
                    </div>
                    <div className="h-8 bg-slate-200 rounded"></div>
                  </div>
                  
                  {/* Right Panel - Analysis */}
                  <div className="bg-slate-50 rounded-xl p-6">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Procurement Act 2023</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">PPN 06/20 Social Value</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">PPN 02/24 AI Transparency</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Compliance Analysis
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 border border-slate-200 text-center"
              >
                <stat.icon className="h-8 w-8 mx-auto text-blue-600 mb-3" />
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block px-4 py-2 rounded-full border border-slate-200 text-sm font-bold text-slate-600 mb-4"
            >
              Powerful Features
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4"
            >
              Everything You Need to Win More Tenders
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              From tender analysis to bid submission, we've got you covered.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block px-4 py-2 rounded-full border border-slate-200 text-sm font-bold text-slate-600 mb-4"
            >
              Simple Process
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4"
            >
              How {companyName} Works
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Three simple steps to transform your procurement process.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Step 1 */}
            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 border border-slate-200 h-full">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Upload or Input Tender
                </h3>
                <p className="text-slate-600 mb-6">
                  Upload your tender documents or input the requirements. Our AI will automatically extract and analyze all relevant information.
                </p>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-slate-700">Drag & drop or browse files</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 border border-slate-200 h-full">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  AI Analysis & Compliance Check
                </h3>
                <p className="text-slate-600 mb-6">
                  Our AI analyzes your tender against all UK procurement regulations, identifies gaps, and provides actionable recommendations.
                </p>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">Procurement Act 2023</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm">All PPNs</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 border border-slate-200 h-full">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Generate & Export
                </h3>
                <p className="text-slate-600 mb-6">
                  Generate compliant bid proposals with structured content. Export as professional PDFs ready for submission.
                </p>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm text-slate-700">Bid Proposal.pdf</span>
                  </div>
                  <div className="mt-2 text-xs text-emerald-600">
                    Ready for submission
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block px-4 py-2 rounded-full border border-slate-200 text-sm font-bold text-slate-600 mb-4"
            >
              Simple Pricing
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4"
            >
              Choose Your Plan
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              No hidden fees. No surprises. Just powerful procurement intelligence.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {pricingTiers.map((tier, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className={`relative bg-white rounded-2xl p-8 border-2 shadow-lg ${
                  tier.popular 
                    ? 'border-blue-600 ring-4 ring-blue-500/20' 
                    : 'border-slate-200'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-slate-600 mb-4">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-black text-slate-900">
                    {tier.price}
                  </span>
                  <span className="text-slate-600">/{tier.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (tier.name === 'Free') {
                      onEnterWorkspace('tender_scanner');
                    } else if (tier.name === 'Professional') {
                      onEnterWorkspace('bid_builder');
                    } else {
                      onSignInRequired();
                    }
                  }}
                  className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
                    tier.name === 'Professional' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/30' 
                      : tier.name === 'Enterprise' 
                        ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-xl shadow-amber-500/30' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block px-4 py-2 rounded-full border border-slate-200 text-sm font-bold text-slate-600 mb-4"
            >
              Trusted by Professionals
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4"
            >
              What Our Users Say
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Don't just take our word for it. Here's what our users have to say.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-${testimonials[currentTestimonial].color}-400 to-${testimonials[currentTestimonial].color}-600 flex items-center justify-center text-white text-xl font-bold`}>
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {testimonials[currentTestimonial].author}
                      </div>
                      <div className="text-slate-600">
                        {testimonials[currentTestimonial].role}
                      </div>
                    </div>
                  </div>
                  <blockquote className="text-xl text-slate-700 leading-relaxed mb-6">
                    "{testimonials[currentTestimonial].quote}"
                  </blockquote>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentTestimonial === index 
                      ? 'bg-blue-600 w-6' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block px-4 py-2 rounded-full border border-slate-200 text-sm font-bold text-slate-600 mb-4"
            >
              Frequently Asked Questions
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4"
            >
              Your Questions, Answered
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Everything you need to know about {companyName}.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-bold text-slate-900">
                    {faq.question}
                  </span>
                  <ChevronRight 
                    className={`h-6 w-6 text-slate-500 transition-transform ${
                      expandedFaq === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.span 
              variants={itemVariants}
              className="inline-block px-4 py-2 rounded-full border border-white/30 text-sm font-bold text-white/80 mb-4"
            >
              Ready to Win More Tenders?
            </motion.span>
            <motion.h2 
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4"
            >
              Start Your Free Analysis Today
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of procurement professionals who trust {companyName} to win more tenders with confidence.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onEnterWorkspace('tender_scanner')}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-blue-600 shadow-xl hover:bg-slate-50 transition-all"
              >
                <Rocket className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => onEnterWorkspace('registry')}
                className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-bold text-white hover:bg-white/10 transition-all"
              >
                <Search className="h-5 w-5" />
                Explore Features
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12"
          >
            {/* Brand */}
            <motion.div variants={itemVariants}>
              <div className="font-bold text-2xl mb-4">{companyName}</div>
              <p className="text-slate-400 mb-6">
                AI-Powered UK Public Sector Procurement Intelligence Platform
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition">
                  <Globe className="h-6 w-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition">
                  <ExternalLink className="h-6 w-6" />
                </a>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div variants={itemVariants}>
              <h4 className="font-bold text-lg mb-4">Features</h4>
              <ul className="space-y-3">
                {['Tender Analysis', 'Bid Proposals', 'Compliance Checking', 'PDF Generation', 'Team Collaboration'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-slate-400 hover:text-white transition">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div variants={itemVariants}>
              <h4 className="font-bold text-lg mb-4">Resources</h4>
              <ul className="space-y-3">
                {['Documentation', 'Tutorials', 'Case Studies', 'Blog', 'FAQ'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-slate-400 hover:text-white transition">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal */}
            <motion.div variants={itemVariants}>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR Compliance'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-slate-400 hover:text-white transition">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </div>
            <div className="text-slate-400 text-sm">
              Built with ❤️ for UK Public Sector Procurement
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

// Helper component for upload icon
const Upload = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
  </svg>
);
