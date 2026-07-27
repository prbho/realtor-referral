import RealtorDirectory from "@/components/RealtorDirectory";

export const metadata = {
  title: "Realtors | Regal PDC Realtor",
  description:
    "Browse our public directory of Realtors and connect with experienced professionals ready to support your real estate journey.",
};

export default function RealtorsPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at top, rgba(56,189,248,0.15), transparent 38%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <p className="text-sm font-semibold tracking-widest text-sky-700 uppercase mb-4 dark:text-sky-400">
            Realtor Directory
          </p>
          <h1
            style={{ fontFamily: "var(--font-fraunces)" }}
            className="text-4xl sm:text-5xl font-semibold mb-6"
          >
            Meet our Realtors.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Explore our public directory of Realtors ready to support clients,
            build referrals, and grow their business.
          </p>
          {/* <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-sm font-semibold text-white hover:bg-slate-800 transition-colors dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
            >
              Join as a Realtor
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-4 text-sm font-semibold text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Sign In
            </Link>
          </div> */}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Realtor listings</h2>
            {/* <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Listings load in pages of 20 with infinite scrolling.
            </p> */}
          </div>
          {/* <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Scroll to load more Realtors automatically as you explore the
            directory.
          </p> */}
        </div>

        <RealtorDirectory />
      </section>
    </div>
  );
}
