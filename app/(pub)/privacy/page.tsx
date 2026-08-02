import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Regal PDC Realtor",
  description:
    "Read the privacy policy for Regal PDC Realtor, including how user data, referral information, and security are handled.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white dark:bg-[#0d1117] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-sm font-semibold dark:bg-sky-950/30 dark:text-sky-300">
              <Shield className="h-4 w-4" /> Privacy Policy
            </p>
            <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
              Privacy and Data Protection
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 max-w-3xl">
              Regal PDC Realtor is committed to protecting your privacy and
              using your personal information responsibly.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <h2 className="text-xl font-semibold">Information We Collect</h2>
            </div>
            <div className="mt-6 space-y-4 text-slate-600 dark:text-slate-300 leading-7">
              <p>
                We collect information required to support your account,
                referral activity, and payout verification. This includes
                profile details, contact information, referral codes, NIN
                verification data, bank details, and usage data.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Account information such as name, email, phone, and profile
                  image.
                </li>
                <li>
                  Verification details such as NIN, bank name, account number,
                  and referral payout records.
                </li>
                <li>
                  Referral activity including referred users, referral counts,
                  and commission totals.
                </li>
                <li>
                  Usage and device data to secure the platform and improve user
                  experience.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <h2 className="text-xl font-semibold">How We Use Your Data</h2>
            </div>
            <div className="mt-6 space-y-4 text-slate-600 dark:text-slate-300 leading-7">
              <p>
                Your information is used to provide the platform services,
                manage referrals, verify identities, process commissions, and
                keep your account secure.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Account setup, login, and profile management.</li>
                <li>
                  Referral tracking, commission calculation, and payout support.
                </li>
                <li>
                  Identity and NIN verification for compliance and fraud
                  prevention.
                </li>
                <li>
                  Platform improvements, analytics, and security monitoring.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <h2 className="text-xl font-semibold">
                Data Sharing and Security
              </h2>
            </div>
            <div className="mt-6 space-y-4 text-slate-600 dark:text-slate-300 leading-7">
              <p>
                We do not sell your personal information. We only share data
                when necessary to provide the service, maintain security, or
                comply with legal obligations.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Service providers who support hosting, authentication,
                  analytics, email, and storage.
                </li>
                <li>
                  Legal requests, law enforcement, or regulatory requirements.
                </li>
                <li>Fraud detection and abuse prevention efforts.</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 text-slate-900 dark:text-white">
              <h2 className="text-xl font-semibold">Your Rights</h2>
            </div>
            <div className="mt-6 space-y-4 text-slate-600 dark:text-slate-300 leading-7">
              <p>
                You may request access to your account information, correct
                inaccurate details, or delete your account. Reach out through
                the platform support channels to exercise these rights.
              </p>
              <p>
                If you have questions about this privacy policy, contact us
                through the app or admin support channels.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
