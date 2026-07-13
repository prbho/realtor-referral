import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account",
  description: "%s | Regal PDC Realtor",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50py-20 bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <main className="min-h-full flex flex-col justify-center items-center h-screen">
        <div className="mb-6">
          <Link href="/" className="transition-colors duration-200">
            <Image
              width={180}
              height={155}
              alt="Regal PDC Realtors"
              src="/regal-pdc-auth-logo.webp"
              loading="eager"
              priority
            />
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
