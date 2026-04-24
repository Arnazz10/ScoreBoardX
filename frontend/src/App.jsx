import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  CircleHelp,
  Globe,
  Home,
  Link2,
  Rocket,
  Settings,
  Share2,
  Trophy
} from "lucide-react";

const API_BASE = "http://localhost:8080/api";
const topTabs = [
  "Organization",
  "Teams",
  "Users",
  "Subscription",
  "Payment",
  "Installed Apps",
  "Variables",
  "Scenario Properties"
];

const rightLinks = ["Community", "Academy", "Help Center", "Partner Directory", "Blog", "Use Cases"];
const actionTabs = ["Run Quiz", "Results", "Submit"];

export default function App() {
  const [activeTab, setActiveTab] = useState("Organization");
  const [regNo, setRegNo] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [progress, setProgress] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => {
    const events = new EventSource(`${API_BASE}/progress`);
    events.addEventListener("progress", (evt) => setProgress(Number(evt.data)));
    return () => events.close();
  }, []);

  async function runQuiz() {
    if (!regNo.trim()) return;
    setStatus("Running polls...");
    setSubmitResult(null);
    const res = await fetch(`${API_BASE}/run?regNo=${encodeURIComponent(regNo)}`);
    const data = await res.json();
    setLeaderboard(data.leaderboard ?? []);
    setTotalScore(data.totalScore ?? 0);
    setStatus("Run completed");
  }

  async function submitQuiz() {
    if (!regNo.trim()) return;
    setStatus("Submitting...");
    const res = await fetch(`${API_BASE}/submit?regNo=${encodeURIComponent(regNo)}`, { method: "POST" });
    const data = await res.json();
    setSubmitResult(data);
    setStatus("Submission completed");
  }

  const dedupCount = useMemo(() => leaderboard.length, [leaderboard]);

  return (
    <div className="min-h-screen bg-sage p-3">
      <div className="mx-auto flex max-w-[1600px] gap-3 rounded-[24px] bg-[#eef1ec] p-3">
        <aside className="flex w-[60px] flex-col items-center rounded-[22px] bg-[#16181d] py-3 text-white shadow-soft">
          <div className="mb-4 rounded-xl bg-[#0f1116] p-2"><Trophy size={18} /></div>
          {[Home, Share2, Bell, Link2, Globe, BookOpen, Rocket, CircleHelp].map((Icon, i) => (
            <button key={i} className={`mb-3 rounded-xl p-2 ${i === 2 ? "bg-[#343840]" : "hover:bg-[#242831]"}`}>
              <Icon size={16} />
            </button>
          ))}
          <div className="mt-auto h-9 w-9 overflow-hidden rounded-full bg-lime" />
        </aside>

        <main className="flex-1 rounded-[20px] bg-panel p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-[2.2rem] font-extrabold leading-tight text-ink">
              Quiz <span className="mx-1">⚙️</span> Leaderboard <span className="mx-1">🏆</span> System
            </h1>
            <button className="rounded-full bg-[#111722] px-6 py-3 text-sm font-medium text-white">
              + Create a New Scenario
            </button>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {topTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-[0.85rem] ${
                  activeTab === tab ? "bg-[#111] text-white" : "bg-white text-[#666]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mb-4 flex gap-2">
            {actionTabs.map((tab, idx) => (
              <button key={tab} className={`rounded-full px-4 py-2 text-sm ${idx === 0 ? "bg-[#111] text-white" : "bg-white text-[#666]"}`}>{tab}</button>
            ))}
          </div>

          <div className="mb-4 flex gap-4">
            <MetricCard title="Polls" value={progress} sub={`${progress}/10`} badge={`${progress * 10}%`} />
            <MetricCard title="Dedup Events" value={dedupCount} sub="Unique participants" badge="100%" active />
            <div className="flex-1 rounded-3xl bg-[#111] p-5 text-white shadow-soft">
              <p className="text-4xl font-semibold leading-tight">Take your automation to the next level</p>
              <button className="mt-4 rounded-full bg-white px-6 py-2 text-sm text-[#111]">Upgrade</button>
            </div>
          </div>

          <div className="mb-4 rounded-3xl bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-3">
              <input
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="Enter regNo"
                className="rounded-full border border-[#e6e6e6] px-4 py-2 text-sm outline-none"
              />
              <button onClick={runQuiz} className="rounded-full bg-[#111] px-4 py-2 text-sm text-white">Run Quiz</button>
              <button onClick={submitQuiz} className="rounded-full bg-lime px-4 py-2 text-sm text-[#111]">Submit</button>
              <span className="text-sm text-[#666]">{status}</span>
            </div>
            <LeaderboardTable leaderboard={leaderboard} totalScore={totalScore} />
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-semibold">Statistics</h2>
              <span className="rounded-xl bg-[#f3f5f2] px-3 py-2 text-sm">2025</span>
            </div>
            <div className="grid grid-cols-8 gap-4">
              {(leaderboard.length ? leaderboard.slice(0, 8) : Array.from({ length: 8 }, (_, i) => ({ totalScore: 30 + i * 8 }))).map(
                (entry, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="h-36 w-9 rounded-full bg-[#111] p-1">
                      <div className="relative h-full w-full rounded-full bg-[#111]">
                        <div className="absolute bottom-0 left-0 right-0 rounded-full bg-lime" style={{ height: `${Math.max(20, Math.min(90, entry.totalScore))}%` }} />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-[#777]">{i + 1} Jul</p>
                  </div>
                )
              )}
            </div>
          </div>
          {submitResult && (
            <div className="mt-4 rounded-2xl bg-white p-4 text-sm shadow-soft">
              <p><b>isCorrect:</b> {String(submitResult.isCorrect)}</p>
              <p><b>isIdempotent:</b> {String(submitResult.isIdempotent)}</p>
              <p><b>submittedTotal:</b> {submitResult.submittedTotal}</p>
              <p><b>expectedTotal:</b> {submitResult.expectedTotal}</p>
              <p><b>message:</b> {submitResult.message}</p>
            </div>
          )}
        </main>

        <section className="w-[280px] rounded-[20px] bg-panel p-4 shadow-soft">
          <div className="mb-3 flex justify-end"><button className="rounded-full bg-white p-2"><Settings size={15} /></button></div>
          <div className="grid gap-3">
            {rightLinks.map((link) => (
              <div key={link} className="rounded-3xl bg-[#f2f4ef] p-4 shadow-soft">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-base font-medium">{link}</span>
                  <span className="text-[#888]">↗</span>
                </div>
                <p className="text-xs text-[#949494]">Explore detailed resources and guides...</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, badge, active }) {
  return (
    <div className={`w-[280px] rounded-3xl p-5 shadow-soft ${active ? "bg-lime" : "bg-white"}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <span className="rounded-full bg-[#111] px-2 py-1 text-xs text-white">{badge}</span>
      </div>
      <p className="text-7xl font-bold leading-[1] text-[#111]">{value}</p>
      <p className="mt-1 text-xs text-[#8b8b8b]">{sub}</p>
    </div>
  );
}

function LeaderboardTable({ leaderboard, totalScore }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#ececec]">
      <table className="w-full border-collapse text-left">
        <thead className="bg-[#f7f8f5]">
          <tr>
            <th className="px-4 py-3 text-sm">Participant</th>
            <th className="px-4 py-3 text-sm">Total Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length === 0 ? (
            <tr>
              <td colSpan="2" className="px-4 py-6 text-sm text-[#888]">No data yet. Run quiz to populate leaderboard.</td>
            </tr>
          ) : (
            leaderboard.map((row) => (
              <tr key={row.participant} className="border-t border-[#efefef]">
                <td className="px-4 py-3 text-sm">{row.participant}</td>
                <td className="px-4 py-3 text-sm font-semibold">{row.totalScore}</td>
              </tr>
            ))
          )}
          <tr className="border-t border-[#efefef] bg-[#fafcf8]">
            <td className="px-4 py-3 text-sm font-bold">Total</td>
            <td className="px-4 py-3 text-sm font-bold">{totalScore}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
