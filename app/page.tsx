"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Local mini-app · state in this browser
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </header>
        {children}
        <footer className="mt-10 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
          Data is stored in localStorage on this origin only. Portfolio demo — not a multi-user product.
        </footer>
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 " +
    className;
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
      : variant === "secondary"
        ? "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700"
        : variant === "danger"
          ? "bg-red-600 text-white hover:bg-red-500"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, ready]);
  return [value, setValue, ready] as const;
}

function uid() {
  return crypto.randomUUID();
}

type Milestone = { id: string; text: string; done: boolean };
type Goal = { id: string; title: string; milestones: Milestone[]; archived: boolean };

function progress(g: Goal) {
  if (!g.milestones.length) return 0;
  return Math.round((g.milestones.filter((m) => m.done).length / g.milestones.length) * 100);
}

export default function Home() {
  const [goals, setGoals] = useLocalStorage<Goal[]>("goal-tracker-v1", [
    {
      id: "1",
      title: "Ship portfolio utilities",
      archived: false,
      milestones: [
        { id: "a", text: "Base64 + hash tools", done: true },
        { id: "b", text: "Mini-apps batch", done: false },
        { id: "c", text: "Deploy demos", done: false },
      ],
    },
  ]);
  const [title, setTitle] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const visible = goals.filter((g) => (showArchived ? true : !g.archived));

  return (
    <Shell title="Goal Tracker" subtitle="Break goals into milestones and watch progress fill up as you check them off.">
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className={`${inputClass} max-w-md`}
          placeholder="New goal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button
          onClick={() => {
            if (!title.trim()) return;
            setGoals((prev) => [
              {
                id: uid(),
                title: title.trim(),
                archived: false,
                milestones: [{ id: uid(), text: "First milestone", done: false }],
              },
              ...prev,
            ]);
            setTitle("");
          }}
        >
          Add goal
        </Button>
        <Button variant="secondary" onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? "Hide archived" : "Show archived"}
        </Button>
      </div>

      <div className="space-y-4">
        {visible.map((g) => {
          const pct = progress(g);
          return (
            <article
              key={g.id}
              className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 ${
                g.archived ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-medium">{g.title}</h2>
                  <p className="text-sm text-zinc-500">{pct}% complete</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setGoals((prev) =>
                        prev.map((x) => (x.id === g.id ? { ...x, archived: !x.archived } : x))
                      )
                    }
                  >
                    {g.archived ? "Unarchive" : "Archive"}
                  </Button>
                  <Button variant="ghost" onClick={() => setGoals((prev) => prev.filter((x) => x.id !== g.id))}>
                    Delete
                  </Button>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <ul className="mt-4 space-y-2">
                {g.milestones.map((m) => (
                  <li key={m.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={m.done}
                      onChange={() =>
                        setGoals((prev) =>
                          prev.map((x) =>
                            x.id === g.id
                              ? {
                                  ...x,
                                  milestones: x.milestones.map((mm) =>
                                    mm.id === m.id ? { ...mm, done: !mm.done } : mm
                                  ),
                                }
                              : x
                          )
                        )
                      }
                    />
                    <input
                      className="flex-1 bg-transparent text-sm outline-none"
                      value={m.text}
                      onChange={(e) =>
                        setGoals((prev) =>
                          prev.map((x) =>
                            x.id === g.id
                              ? {
                                  ...x,
                                  milestones: x.milestones.map((mm) =>
                                    mm.id === m.id ? { ...mm, text: e.target.value } : mm
                                  ),
                                }
                              : x
                          )
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setGoals((prev) =>
                      prev.map((x) =>
                        x.id === g.id
                          ? {
                              ...x,
                              milestones: [...x.milestones, { id: uid(), text: "New milestone", done: false }],
                            }
                          : x
                      )
                    )
                  }
                >
                  + Milestone
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </Shell>
  );
}
