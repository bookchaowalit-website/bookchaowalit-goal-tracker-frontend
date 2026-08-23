"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Milestone = { id: string; text: string; done: boolean };
type Goal = { id: string; title: string; milestones: Milestone[]; archived: boolean };
const INITIAL: Goal[] = [{ id: "mission-01", title: "Ship portfolio utilities", archived: false, milestones: [{ id: "a", text: "Base64 + hash tools", done: true }, { id: "b", text: "Mini-apps batch", done: false }, { id: "c", text: "Deploy demos", done: false }] }];

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => { try { const raw = window.localStorage.getItem(key); if (raw) setValue(JSON.parse(raw) as T); } catch { /* local-only recovery */ } setReady(true); }, 0); return () => window.clearTimeout(timer); }, [key]);
  useEffect(() => { if (ready) window.localStorage.setItem(key, JSON.stringify(value)); }, [key, value, ready]);
  return [value, setValue] as const;
}

function progress(goal: Goal) { return goal.milestones.length ? Math.round(goal.milestones.filter((item) => item.done).length / goal.milestones.length * 100) : 0; }

export default function Home() {
  const [goals, setGoals] = useLocalStorage<Goal[]>("goal-tracker-v2", INITIAL);
  const [title, setTitle] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [notice, setNotice] = useState("Toggle a waypoint to update the route.");
  const visible = useMemo(() => goals.filter((goal) => showArchived || !goal.archived), [goals, showArchived]);
  const active = goals.filter((goal) => !goal.archived);
  const totalProgress = active.length ? Math.round(active.reduce((sum, goal) => sum + progress(goal), 0) / active.length) : 0;

  const addGoal = () => {
    if (!title.trim()) { setNotice("Name the mission before opening its route."); return; }
    setGoals((items) => [{ id: crypto.randomUUID(), title: title.trim(), archived: false, milestones: [{ id: crypto.randomUUID(), text: "First waypoint", done: false }] }, ...items]);
    setTitle(""); setNotice("Mission opened with its first waypoint.");
  };

  return <main className="gt-page">
    <header className="gt-topbar"><Link className="gt-mark" href="/">MISSION / CONTROL</Link><span>ROUTE BOARD · LOCAL STATE</span><span className="gt-clock">ACTIVE {String(active.length).padStart(2, "0")}</span></header>
    <section className="gt-hero"><div><p className="gt-stamp">WAYPOINT SYSTEM / PERSONAL NAVIGATION</p><h1>Make progress<br /><span>visible.</span></h1><p className="gt-intro">A goal becomes easier to steer when every milestone has a place on the route. Check one waypoint, edit its name, or archive the mission when the flight is over.</p></div><aside className="gt-readout"><span>FLEET READOUT</span><strong>{totalProgress}%</strong><div className="gt-readout-line"><i style={{ width: `${totalProgress}%` }} /><b>AVERAGE ACTIVE ROUTE</b></div><p role="status">{notice}</p></aside></section>
    <section className="gt-command" aria-labelledby="command-title"><div className="gt-rule"><span>01 / OPEN A ROUTE</span><span>NO SYNC / THIS BROWSER</span></div><div className="gt-command-row"><h2 id="command-title">New mission.</h2><div className="gt-new-form"><input aria-label="New goal title" placeholder="Name the next destination" value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addGoal(); }} /><button type="button" onClick={addGoal}>OPEN ROUTE <span>↗</span></button></div><button className="gt-archive-toggle" type="button" onClick={() => setShowArchived((value) => !value)}>{showArchived ? "Hide archived" : "Show archived"}</button></div></section>
    <section className="gt-missions" aria-labelledby="missions-title"><div className="gt-missions-head"><div><span>02 / ROUTE BOARD</span><h2 id="missions-title">Active missions.</h2></div><span>{visible.length} displayed</span></div><div className="gt-list">{visible.length === 0 ? <p className="gt-empty">No missions in this view. Open a route above.</p> : visible.map((goal, goalIndex) => { const pct = progress(goal); return <article className={`gt-mission ${goal.archived ? "is-archived" : ""}`} key={goal.id}><header className="gt-mission-head"><div><span className="gt-mission-code">MISSION {String(goalIndex + 1).padStart(2, "0")}</span><h3>{goal.title}</h3></div><div className="gt-mission-actions"><strong>{pct}%</strong><button type="button" onClick={() => setGoals((items) => items.map((item) => item.id === goal.id ? { ...item, archived: !item.archived } : item))}>{goal.archived ? "Restore" : "Archive"}</button><button type="button" onClick={() => setGoals((items) => items.filter((item) => item.id !== goal.id))}>Delete</button></div></header><div className="gt-route" style={{ "--route-progress": `${pct}%` } as React.CSSProperties}><div className="gt-route-line" /><ol>{goal.milestones.map((milestone, index) => <li className={milestone.done ? "is-done" : ""} key={milestone.id}><label><input type="checkbox" checked={milestone.done} onChange={() => { setGoals((items) => items.map((item) => item.id === goal.id ? { ...item, milestones: item.milestones.map((point) => point.id === milestone.id ? { ...point, done: !point.done } : point) } : item)); setNotice(`${milestone.done ? "Waypoint reopened" : "Waypoint cleared"}: ${milestone.text}`); }} /><span className="gt-node">{milestone.done ? "✓" : String(index + 1).padStart(2, "0")}</span><input className="gt-waypoint" aria-label={`Waypoint ${index + 1}`} value={milestone.text} onChange={(event) => setGoals((items) => items.map((item) => item.id === goal.id ? { ...item, milestones: item.milestones.map((point) => point.id === milestone.id ? { ...point, text: event.target.value } : point) } : item))} /></label></li>)}</ol></div></article>; })}</div></section>
    <footer className="gt-footer"><strong>NO TEAM SYNC / LOCAL ROUTES</strong><span>Goal Tracker · Bookchaowalit · localStorage only</span></footer>
  </main>;
}
