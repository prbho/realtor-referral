"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Realtor } from "@/types/user";

const DEFAULT_PAGE_SIZE = 20;

type RealtorResponse = {
  items: Realtor[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export default function RealtorDirectory() {
  const [realtors, setRealtors] = useState<Realtor[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stateFilter, setStateFilter] = useState("");
  const [activeState, setActiveState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchRealtors = useCallback(
    async (nextPage: number, state = activeState) => {
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams({
          page: String(nextPage),
          pageSize: String(DEFAULT_PAGE_SIZE),
        });

        if (state) {
          query.set("state", state);
        }

        const response = await fetch(`/api/realtors?${query.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load Realtors. Please try again.");
        }

        const data: RealtorResponse = await response.json();

        // Deduplicate items by id to prevent React key errors
        setRealtors((current) => {
          const combined =
            nextPage === 1 ? data.items : [...current, ...data.items];
          const uniqueMap = new Map<string, Realtor>();
          combined.forEach((item) => {
            if (!uniqueMap.has(item.id)) {
              uniqueMap.set(item.id, item);
            }
          });
          return Array.from(uniqueMap.values());
        });

        setHasMore(data.hasMore);
        setPage(data.page);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error ? fetchError.message : String(fetchError)
        );
      } finally {
        setLoading(false);
      }
    },
    [activeState]
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchRealtors(1, activeState);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeState, fetchRealtors]);

  useEffect(() => {
    if (!observerRef.current || !hasMore || loading) return;

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !loading) {
          fetchRealtors(page + 1);
        }
      },
      { rootMargin: "200px" }
    );

    intersectionObserver.observe(observerRef.current);

    return () => {
      intersectionObserver.disconnect();
    };
  }, [fetchRealtors, hasMore, loading, page]);

  const realtorCount = useMemo(() => realtors.length, [realtors]);

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveState(stateFilter.trim());
  };

  const clearFilter = () => {
    setStateFilter("");
    setActiveState("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Filter Realtors
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search the directory by state to find Realtors near you.
          </p>
        </div>

        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <label className="sr-only" htmlFor="stateFilter">
            State
          </label>
          <input
            id="stateFilter"
            type="text"
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value)}
            placeholder="Enter state"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:w-64"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            Apply
          </button>
          {activeState ? (
            <button
              type="button"
              onClick={clearFilter}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          ) : null}
        </form>
      </div>

      {activeState ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Showing Realtors in{" "}
          <span className="font-semibold">{activeState}</span>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {realtors.map((realtor) => {
          const initials = realtor.name
            ? realtor.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            : "RE";

          const location = [realtor.city, realtor.state, realtor.country]
            .filter(Boolean)
            .join(", ");

          return (
            <article
              key={realtor.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <Link href={`/realtors/${realtor.id}`}>
                <div className="relative h-44 bg-slate-100 dark:bg-slate-800">
                  {realtor.image ? (
                    <Image
                      src={realtor.image}
                      alt={realtor.name ?? "Realtor profile"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-200 text-4xl font-bold uppercase text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg capitalize font-semibold text-slate-900 dark:text-white">
                        {realtor.name ?? "Registered Realtor"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {location || "Location not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    {/* Optional extra info */}
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Loading more Realtors…
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm dark:border-red-800 dark:bg-red-950/50">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {!hasMore && realtorCount > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            You’ve reached the end of the Realtor directory.
          </p>
        </div>
      )}

      <div ref={observerRef} className="h-2" aria-hidden="true" />
    </div>
  );
}
