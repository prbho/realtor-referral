import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Award,
  TrendingUp,
  Clock,
  Shield,
  Sparkles,
  FileEditIcon,
  UserPenIcon,
  Wallet2,
} from "lucide-react";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Image from "next/image";
import HomeMilestone from "@/components/HomeMilestoneCard";

export const metadata = {
  title: "Welcome | Regal PDC Realtor",
  description:
    "Join a fast-growing community of real estate professionals. Start building a flexible, rewarding career today.",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-24">
      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/realtors.webp"
            quality={80}
            alt="Real Estate"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60 dark:bg-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#0b3264] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Join Our Growing Team!
              </div>

              <h1
                style={{ fontFamily: "var(--font-fraunces)" }}
                className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white leading-[1.1]"
              >
                Build Your Future in{" "}
                <span className="italic text-sky-300 relative">
                  Real Estate
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-emerald-200/50 rounded-full" />
                </span>
                .
              </h1>

              <p className="mt-6 text-lg text-white/80 max-w-lg leading-relaxed">
                Join a fast-growing community of real estate professionals and
                start building a flexible, rewarding career with access to
                training, mentorship, and unlimited earning potential.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-[#0b3264] px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-all dark:bg-white dark:text-[#0b3264] dark:hover:bg-gray-100"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-medium border-2 border-white/30 text-white hover:border-white hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 flex items-center gap-6 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-300" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-300" />
                  <span>100+ Active Agents</span>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: TrendingUp,
                  label: "Unlimited Income",
                  desc: "Earn from every successful transaction",
                  color: "emerald",
                },
                {
                  icon: Award,
                  label: "Top Training",
                  desc: "Mentorship from industry experts",
                  color: "blue",
                },
                {
                  icon: Users,
                  label: "Community",
                  desc: "Supportive network of professionals",
                  color: "purple",
                },
                {
                  icon: Clock,
                  label: "Flexible Schedule",
                  desc: "Work on your own terms",
                  color: "amber",
                },
              ].map((item, index) => {
                const colorMap = {
                  emerald:
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-sky-300",
                  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
                  purple:
                    "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300",
                  amber:
                    "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300",
                };
                return (
                  <div
                    key={index}
                    className="bg-white/80 dark:bg-[#161b22]/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-shadow"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        colorMap[item.color as keyof typeof colorMap]
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {item.label}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold tracking-widest text-sky-700 uppercase mb-4 dark:text-sky-400">
            Simple Process
          </p>
          <h2
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white"
          >
            Get Started in{" "}
            <span className="italic text-sky-700 dark:text-sky-500">
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
              icon: FileEditIcon,
            },
            {
              step: "02",
              title: "Complete Your Profile",
              description:
                "Add your details and get your unique referral link.",
              icon: UserPenIcon,
            },
            {
              step: "03",
              title: "Start Earning",
              description:
                "Share your link and earn from successful referrals.",
              icon: Wallet2,
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700/50 p-8 hover:shadow-md transition-shadow"
              >
                <span className="text-4xl font-bold text-emerald-600/20 font-serif block mb-4 dark:text-emerald-400/20">
                  {item.step}
                </span>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                  <Icon className="h-6 w-6" />
                </div>
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
            );
          })}
        </div>
      </section>

      {/* ─── Recruitment Milestones & Benefits ────────────────────── */}
      <section className="bg-linear-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <HomeMilestone />
        </div>
      </section>

      {/* ─── Testimonial ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold tracking-widest text-sky-700 uppercase mb-4 dark:text-emerald-400">
                Why Join Us
              </p>
              <h2
                style={{ fontFamily: "var(--font-fraunces)" }}
                className="text-3xl md:text-4xl font-medium text-slate-900 mb-6 dark:text-white"
              >
                More Than Just a{" "}
                <span className="italic text-sky-700 dark:text-sky-500">
                  Career
                </span>
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed dark:text-slate-300">
                As a member of our network, you get access to exclusive
                training, marketing materials, and a community of like-minded
                professionals who support each other&apos;s growth.
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
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full dark:bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-sky-300 rounded-2xl p-8 text-slate-900 relative dark:bg-linear-to-br dark:from-[#0b3264] dark:to-slate-800">
              <blockquote>
                <p className="text-xl leading-relaxed font-light">
                  &quot;Joining Regal PDC was the best career decision I&apos;ve
                  made. The training and support helped me close my first deal
                  within a month.&quot;
                </p>
                <footer className="mt-6">
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-sm text-slate-900 dark:text-slate-950">
                    Top Performer, May 2026
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-2xl p-12 text-white text-center">
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
            className="inline-flex items-center gap-2 bg-white text-[#0b3264] px-8 py-4 rounded-lg font-semibold hover:bg-slate-100 transition-all dark:bg-white dark:text-[#0b3264] dark:hover:bg-slate-100"
          >
            Create Your Account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-sm text-blue-100/60 dark:text-blue-200/60">
            ⚡ Free to join • No commitment required
          </p>
        </div>
      </section>
    </div>
  );
}
