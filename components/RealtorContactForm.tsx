"use client";

import { useState } from "react";

type Props = {
  realtorEmail: string;
  realtorName: string;
};

export default function RealtorContactForm({
  realtorEmail,
  realtorName,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [feedback, setFeedback] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/realtors/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: realtorEmail,
          realtorName,
          fromName: name,
          fromEmail: email,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ?? "Unable to send message. Please try again."
        );
      }

      setStatus("success");
      setFeedback(
        "Message sent! The Realtor will receive your inquiry by email shortly."
      );
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("error");
      setFeedback(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setShowForm((current) => !current)}
        className="inline-flex w-full items-center justify-center rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
      >
        {showForm ? "Hide contact form" : "Send an Email"}
      </button>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-semibold text-slate-900 dark:text-slate-100"
              htmlFor="contactName"
            >
              Your name
            </label>
            <input
              id="contactName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              type="text"
              placeholder="Enter your name"
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-900 dark:text-slate-100"
              htmlFor="contactEmail"
            >
              Your email
            </label>
            <input
              id="contactEmail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="you@example.com"
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-900 dark:text-slate-100"
              htmlFor="contactMessage"
            >
              Message
            </label>
            <textarea
              id="contactMessage"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write your inquiry here"
              required
              rows={5}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>

          {feedback ? (
            <p
              className={
                status === "success"
                  ? "text-sm text-emerald-700 dark:text-emerald-300"
                  : "text-sm text-red-700 dark:text-red-300"
              }
            >
              {feedback}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
