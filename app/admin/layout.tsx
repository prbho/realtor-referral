import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Admin Dashboard | Regal PDC Realtor",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-white dark:bg-[#0d1117] transition-colors duration-300">
      <Header />
      <main className="min-h-full flex flex-col mx-auto max-w-6xl px-0 md:px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
