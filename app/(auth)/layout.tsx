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
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 transition-colors duration-200">
      <main className="min-h-full flex flex-col justify-center items-center h-screen">
        <div className="mb-6">
          <Link href="/" className="transition-colors duration-200">
            <Image
              width={180}
              height={200}
              alt="Regal PDC Realtors"
              src="/regal-pdc-auth-logo.png"
              className="*:w-24 *:h-auto"
            />
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
