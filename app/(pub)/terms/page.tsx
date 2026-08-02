import { Shield } from "lucide-react";

export const metadata = {
  title: "Terms of Use | Regal PDC Realtor",
  description:
    "Read the terms of use for Regal PDC Realtor, covering account rules, referral activity, and platform responsibilities.",
};

export default function TermsPage() {
  return (
    <div className="bg-white dark:bg-[#0d1117] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-sm font-semibold dark:bg-sky-950/30 dark:text-sky-300">
              <Shield className="h-4 w-4" /> Terms of Use
            </p>
            <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
              Platform Terms and User Responsibilities
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 max-w-3xl">
              These terms describe how you may use Regal PDC Realtor and the
              rules that govern your account and referrals.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <h2 className="text-xl font-semibold">Acceptance of Terms</h2>
            </div>
            <div className="mt-6 space-y-4 text-slate-600 dark:text-slate-300 leading-7">
              <p>
                By accessing or using Regal PDC Realtor, you agree to follow
                these Terms of Use and any policies posted on the platform. If
                you do not agree, do not use the service.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <h2 className="text-xl font-semibold">
                Account Responsibilities
              </h2>
            </div>
            <div className="mt-6 space-y-4 text-slate-600 dark:text-slate-300 leading-7">
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for any activity that occurs under your
                account.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Provide accurate information during registration and profile
                  completion.
                </li>
                <li>
                  Keep your password secure and notify us if you suspect
                  unauthorized access.
                </li>
                <li>
                  Use referral links and codes honestly and in accordance with
                  applicable law.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <h2 className="text-xl font-semibold">
                Referral and Commission Rules
              </h2>
            </div>
            <div className="mt-6 space-y-4 text-slate-600 dark:text-slate-300 leading-7">
              <p>
                Referral credits and commission payouts depend on valid
                referrals and completed transactions. The platform may withhold
                or revoke referral counts that violate our terms.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Only valid referrals from eligible users count toward your
                  referral totals.
                </li>
                <li>
                  Fraudulent, duplicate, or otherwise invalid referral activity
                  may be rejected.
                </li>
                <li>
                  Referral commission is subject to verification and platform
                  policies.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <h2 className="text-xl font-semibold">Acceptable Use</h2>
            </div>
            <div className="mt-6 space-y-4 text-slate-600 dark:text-slate-300 leading-7">
              <p>
                You agree not to misuse the service or engage in prohibited
                behavior that harms other users or the platform.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Do not attempt to access accounts that are not yours.</li>
                <li>
                  Do not use the platform for illegal or abusive purposes.
                </li>
                <li>Do not manipulate referral metrics or payment records.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <h2 className="text-xl font-semibold">
                Platform Changes and Termination
              </h2>
            </div>
            <div className="mt-6 space-y-4 text-slate-600 dark:text-slate-300 leading-7">
              <p>
                We may update these terms at any time. Continued use of the
                platform after changes means you accept the revised terms.
              </p>
              <p>
                We may suspend or terminate accounts that violate this agreement
                or for operational reasons, including security or compliance
                concerns.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <h2 className="text-xl font-semibold">Contact and Support</h2>
            </div>
            <div className="mt-6 space-y-4 text-slate-600 dark:text-slate-300 leading-7">
              <p>
                If you have questions about these Terms of Use, please contact
                support through the platform or admin support channels.
              </p>
              <p>
                These terms are part of the overall platform agreement and work
                together with the Privacy Policy and any other published
                policies.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
