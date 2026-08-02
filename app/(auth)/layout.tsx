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
    <div className="bg-white dark:bg-[#0d1117] transition-colors duration-300">
      <main className="flex justify-center items-center">
        <div className="flex flex-col justify-center items-center w-full max-w-md px-4 py-12">
          <div className="mt-2">
            <Link href="/" className="transition-colors duration-200">
              <Image
                width={120}
                height={103}
                alt="Regal PDC Realtors"
                src="/regal-pdc-auth-logo.webp"
                loading="eager"
                priority
              />
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
