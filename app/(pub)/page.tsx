// app/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const metadata = {
  title: "Welcome | Regal PDC Realtor",
};

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className={fraunces.variable}>
      {/* Hero */}
      <section className="bg-linear-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
          <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase mb-4">
            Join Our Growing Team!
          </p>
          <h1
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-4xl sm:text-5xl md:text-6xl font-medium text-slate-900 leading-[1.1] max-w-3xl mx-auto"
          >
            Build Your Future in{" "}
            <span className="italic text-emerald-700">Real Estate</span>.
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-xl mx-auto">
            Join a fast-growing community of real estate professionals and start
            building a flexible, rewarding career, and gain access to training,
            mentorship, and opportunities.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-[#0b3264] text-white px-8 py-3 rounded-md font-medium hover:bg-slate-800 transition"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-slate-700 px-8 py-3 rounded-md font-medium border border-slate-300 hover:border-slate-400 transition text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Two audiences */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-8">
            <p className="text-sm font-semibold tracking-wide text-emerald-700 uppercase mb-2">
              Why Join Our Team?
            </p>
            <h2
              style={{ fontFamily: "var(--font-fraunces)" }}
              className="text-2xl font-medium text-slate-900 mb-3"
            >
              Build a Rewarding Career in Real Estate{" "}
            </h2>
            <p className="text-slate-600 mb-6">
              Whether you&apos;re new to real estate or looking for a flexible
              income opportunity, we provide the resources to help you succeed.
            </p>
            <Link
              href="/register"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Join as an agent →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-8">
            <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase mb-2">
              Earn More as You Grow
            </p>
            <h2
              style={{ fontFamily: "var(--font-fraunces)" }}
              className="text-2xl font-medium text-slate-900 mb-3"
            >
              More Than Just Selling Properties
            </h2>
            <p className="text-slate-600 mb-6">
              As a member of our network, you can earn from successful property
              transactions and expand your opportunities by referring others to
              join.
            </p>
            <Link
              href="/register"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Get your referral link
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2
          style={{ fontFamily: "var(--font-fraunces)" }}
          className="text-3xl font-medium text-slate-900 mb-4"
        >
          Get Started in Just 2 Minutes
        </h2>
        <p className="text-slate-600 mb-8 max-w-lg mx-auto">
          It takes less than two minutes to create your account, complete your
          profile, and receive your unique referral link so you can start
          inviting others to join.
        </p>
        <Link
          href="/register"
          className="inline-block bg-[#0b3264] text-white px-8 py-3 rounded-md font-medium hover:bg-slate-800 transition"
        >
          Create Your Account
        </Link>
      </section>
    </div>
  );
}
