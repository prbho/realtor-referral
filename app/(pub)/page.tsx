// app/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Fraunces, Inter } from "next/font/google";
import { authOptions } from "../api/auth/[...nextauth]/route";
import {
  ArrowRight,
  Users,
  Award,
  TrendingUp,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Welcome | Regal PDC Realtor",
  description:
    "Join a fast-growing community of real estate professionals. Start building a flexible, rewarding career today.",
};

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} font-sans dark:bg-slate-950`}
    >
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/30">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] dark:bg-grid-slate-800/20"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/5 to-transparent dark:from-emerald-500/10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
                Join Our Growing Team!
              </div>

              <h1
                style={{ fontFamily: "var(--font-fraunces)" }}
                className="text-4xl sm:text-5xl lg:text-6xl font-medium text-slate-900 leading-[1.1] dark:text-white"
              >
                Build Your Future in{" "}
                <span className="italic text-emerald-700 relative dark:text-emerald-500">
                  Real Estate
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-emerald-200/50 rounded-full dark:bg-emerald-800/50"></span>
                </span>
                .
              </h1>

              <p className="mt-6 text-lg text-slate-600 max-w-lg leading-relaxed dark:text-slate-300">
                Join a fast-growing community of real estate professionals and
                start building a flexible, rewarding career with access to
                training, mentorship, and unlimited earning potential.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 bg-[#0b3264] text-white px-8 py-4 rounded-lg font-medium hover:bg-slate-800 transition-all hover:scale-105 shadow-lg shadow-slate-200 dark:shadow-slate-900/50 dark:hover:bg-slate-700"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-medium border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/50"
                >
                  Sign In
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  <span>100+ Active Agents</span>
                </div>
              </div>
            </div>

            {/* Right Content - Stats/Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:shadow-slate-800/30">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 dark:bg-emerald-950/50">
                  <TrendingUp className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Unlimited Income
                </h3>
                <p className="text-sm text-slate-600 mt-1 dark:text-slate-400">
                  Earn from every successful transaction
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:shadow-slate-800/30">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 dark:bg-blue-950/50">
                  <Award className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Top Training
                </h3>
                <p className="text-sm text-slate-600 mt-1 dark:text-slate-400">
                  Mentorship from industry experts
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:shadow-slate-800/30">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 dark:bg-purple-950/50">
                  <Users className="w-6 h-6 text-purple-700 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Community
                </h3>
                <p className="text-sm text-slate-600 mt-1 dark:text-slate-400">
                  Supportive network of professionals
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:shadow-slate-800/30">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 dark:bg-amber-950/50">
                  <Clock className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Flexible Schedule
                </h3>
                <p className="text-sm text-slate-600 mt-1 dark:text-slate-400">
                  Work on your own terms
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase mb-4 dark:text-emerald-400">
              Simple Process
            </p>
            <h2
              style={{ fontFamily: "var(--font-fraunces)" }}
              className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white"
            >
              Get Started in{" "}
              <span className="italic text-emerald-700 dark:text-emerald-500">
                3 Easy Steps
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description:
                  "Sign up in just 2 minutes with your basic information.",
                icon: "📝",
              },
              {
                step: "02",
                title: "Complete Your Profile",
                description:
                  "Add your details and get your unique referral link.",
                icon: "👤",
              },
              {
                step: "03",
                title: "Start Earning",
                description:
                  "Share your link and earn from successful referrals.",
                icon: "💰",
              },
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="bg-slate-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-200 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:hover:border-slate-800 dark:hover:shadow-slate-800/30">
                  <span className="text-4xl font-bold text-emerald-600/20 font-serif block mb-4 dark:text-emerald-400/20">
                    {item.step}
                  </span>
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3
                    style={{ fontFamily: "var(--font-fraunces)" }}
                    className="text-xl font-medium text-slate-900 mb-2 dark:text-white"
                  >
                    {item.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 border-slate-200 dark:bg-slate-800"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial/Trust Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase mb-4 dark:text-emerald-400">
                Why Join Us
              </p>
              <h2
                style={{ fontFamily: "var(--font-fraunces)" }}
                className="text-3xl md:text-4xl font-medium text-slate-900 mb-6 dark:text-white"
              >
                More Than Just a{" "}
                <span className="italic text-emerald-700 dark:text-emerald-500">
                  Career
                </span>
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed dark:text-slate-300">
                As a member of our network, you get access to exclusive
                training, marketing materials, and a community of like-minded
                professionals who support each other's growth.
              </p>
              <ul className="space-y-3">
                {[
                  "Professional training and mentorship",
                  "Marketing tools and resources",
                  "Flexible working hours",
                  "Competitive commission structure",
                  "Supportive community network",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-slate-700 dark:text-slate-300"
                  >
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full dark:bg-emerald-500"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#0b3264] rounded-3xl p-8 text-white relative overflow-hidden dark:bg-gradient-to-br dark:from-[#0b3264] dark:to-slate-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
              <blockquote className="relative">
                <p className="text-xl leading-relaxed font-light">
                  "Joining Regal PDC was the best career decision I've made. The
                  training and support helped me close my first deal within a
                  month."
                </p>
                <footer className="mt-6">
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-sm text-emerald-300 dark:text-emerald-400">
                    Top Performer, May 2026
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-[#0b3264] to-slate-800 rounded-3xl p-12 text-white dark:from-[#0b3264] dark:to-slate-900">
            <h2
              style={{ fontFamily: "var(--font-fraunces)" }}
              className="text-3xl md:text-4xl font-medium mb-4"
            >
              Ready to Build Your Future?
            </h2>
            <p className="text-lg text-blue-100/80 max-w-2xl mx-auto mb-8 dark:text-blue-200/80">
              Join thousands of real estate professionals who started their
              journey with us. Create your account in just 2 minutes.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-[#0b3264] px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-all hover:scale-105 shadow-lg dark:bg-white dark:text-[#0b3264] dark:hover:bg-slate-100"
            >
              Create Your Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="mt-4 text-sm text-blue-100/60 dark:text-blue-200/60">
              ⚡ Free to join • No commitment required
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
