import type { Metadata } from "next";
import { Syne, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const display = Syne({ variable: "--font-display", subsets: ["latin"] });
const mono = Roboto_Mono({ weight: ["400", "500"], variable: "--font-mono", subsets: ["latin"] });
export const metadata: Metadata = { title: "Mission Control — Goal Tracker", description: "Track goals as local milestone routes.", metadataBase: new URL("https://goal-tracker.bookchaowalit.com") };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${display.variable} ${mono.variable}`}>
  {/* THESIS: Progress is easier to steer when a goal reads as a route with named waypoints, not a generic progress card. OWN-WORLD: deep cobalt command surface, mint route lines, orange launch controls, and a geometric display face with mission labels. STORY: open a mission, clear waypoints, and archive the route when it is complete; all state stays local. FIRST VIEWPORT: the average route readout sits beside the mission-control thesis, followed immediately by OPEN ROUTE. FORM: mission-control route board / candidate 7 / seed ed4a5cb3. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance */}
  <Analytics /><SpeedInsights />{children}
</body></html>; }
