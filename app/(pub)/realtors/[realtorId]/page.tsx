import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import RealtorContactForm from "@/components/RealtorContactForm";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ realtorId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { realtorId } = await params;
  const realtor = await prisma.user.findUnique({
    where: { id: realtorId },
    select: { name: true },
  });

  if (!realtor) {
    return {
      title: "Realtor not found | Regal PDC Realtor",
    };
  }

  return {
    title: `${realtor.name ?? "Realtor"} | Regal PDC Realtor`,
    description: `View the profile, contact details, and experience summary for ${
      realtor.name ?? "this Realtor"
    }.`,
  };
}

export default async function RealtorProfilePage({ params }: Props) {
  const { realtorId } = await params;
  const realtor = await prisma.user.findUnique({
    where: { id: realtorId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      city: true,
      state: true,
      country: true,
      phone: true,
      whatsapp: true,
      createdAt: true,
      role: true,
    },
  });

  if (!realtor || realtor.role !== "REALTOR") {
    notFound();
  }

  const location = [realtor.city, realtor.state, realtor.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at top, rgba(56,189,248,0.15), transparent 38%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-widest text-sky-700 uppercase dark:text-sky-400">
                Realtor Profile
              </p>
              <h1
                className="mt-4 text-4xl font-semibold sm:text-5xl capitalize"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {realtor.name ?? "Registered Realtor"}
              </h1>
              {/* <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                Learn more about this Realtor’s experience, availability, and
                how to get in touch.
              </p> */}
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <Link
                href="/realtors"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Back to directory
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="relative h-44 w-full overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 sm:h-56 sm:w-56">
                    {realtor.image ? (
                      <Image
                        src={realtor.image}
                        alt={realtor.name ?? "Realtor profile"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 26rem"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-200 text-5xl font-bold uppercase text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                        {realtor.name
                          ? realtor.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()
                          : "RE"}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Location
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {location || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        Realtor since
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {new Date(realtor.createdAt).getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Send a Message to <span>{realtor.name}</span>
                  </p>

                  <div className="mt-6">
                    <RealtorContactForm
                      realtorEmail={realtor.email}
                      realtorName={realtor.name ?? "Realtor"}
                    />
                  </div>
                </div>
                {realtor.whatsapp && (
                  <Link
                    href={`https://wa.me/${realtor.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex gap-1 w-full items-center text-white hover:text-white transition-colors justify-center rounded-3xl bg-green-600 px-5 py-3 text-sm font-semibold hover:bg-green-700 dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400"
                  >
                    <span className="block font-semibold">
                      Contact on WhatsApp
                    </span>
                  </Link>
                )}
              </aside>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
