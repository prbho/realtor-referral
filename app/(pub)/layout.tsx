import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-white dark:bg-[#0d1117] transition-colors duration-300">
      <Header />
      <main className="min-h-full flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
