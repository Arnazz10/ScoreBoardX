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

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";
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

const sidebarItems = [
  { id: "dashboard", icon: Home, label: "Dashboard" },
  { id: "sharing", icon: Share2, label: "Sharing" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "integrations", icon: Link2, label: "Integrations" },
  { id: "global", icon: Globe, label: "Global" },
  { id: "academy", icon: BookOpen, label: "Academy" },
  { id: "rocket", icon: Rocket, label: "Quiz System" },
  { id: "support", icon: CircleHelp, label: "Support" }
];

export default function App() {
  const [activeSidebar, setActiveSidebar] = useState("rocket");
  const [activeTab, setActiveTab] = useState("Organization");
  const [regNo, setRegNo] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [progress, setProgress] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [isLoading, setIsLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => {
    const events = new EventSource(`${API_BASE}/progress`);
    events.addEventListener("progress", (evt) => setProgress(Number(evt.data)));
    return () => events.close();
  }, []);

  async function runQuiz() {
    if (!regNo.trim()) return;
    setIsLoading(true);
    setStatus("Running polls...");
    setSubmitResult(null);
    try {
      const res = await fetch(`${API_BASE}/run?regNo=${encodeURIComponent(regNo)}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard ?? []);
      setTotalScore(data.totalScore ?? 0);
      setStatus("Run completed");
    } catch (err) {
      setStatus("Error running quiz");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitQuiz() {
    if (!regNo.trim() || leaderboard.length === 0) return;
    setIsLoading(true);
    setStatus("Submitting...");
    try {
      const res = await fetch(`${API_BASE}/submit?regNo=${encodeURIComponent(regNo)}`, { method: "POST" });
      const data = await res.json();
      setSubmitResult(data);
      setStatus("Submission completed");
    } catch (err) {
      setStatus("Error submitting");
    } finally {
      setIsLoading(false);
    }
  }

  const dedupCount = useMemo(() => leaderboard.length, [leaderboard]);

  const renderContent = () => {
    switch (activeSidebar) {
      case "rocket":
      case "dashboard":
        return (
          <>
            <div className="mb-4 flex gap-4">
              <MetricCard title="Poll Progress" value={progress} sub={`${progress}/10 Polls`} badge={`${progress * 10}%`} />
              <MetricCard title="Total Participants" value={dedupCount} sub="Unique entries" badge="Live" active />
              <div className="flex-1 rounded-3xl bg-[#111] p-5 text-white shadow-soft relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-4xl font-semibold leading-tight">System Status: <span className={isLoading ? "text-lime animate-pulse" : "text-white"}>{status}</span></p>
                  <button className="mt-4 rounded-full bg-white px-6 py-2 text-sm text-[#111] font-bold hover:bg-lime transition-colors">Documentation</button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Rocket size={120} />
                </div>
              </div>
            </div>

            <div className="mb-4 rounded-3xl bg-white p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <input
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="Enter Registration Number"
                    className="w-full rounded-full border border-[#e6e6e6] px-5 py-3 text-sm outline-none focus:border-ink transition-colors"
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={runQuiz}
                  disabled={isLoading || !regNo.trim()}
                  className={`rounded-full px-6 py-3 text-sm font-bold transition-all ${isLoading || !regNo.trim() ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-ink text-white hover:scale-105 active:scale-95"
                    }`}
                >
                  {isLoading && status.includes("polls") ? "Polling..." : "Run Quiz"}
                </button>
                <button
                  onClick={submitQuiz}
                  disabled={isLoading || !regNo.trim() || leaderboard.length === 0}
                  className={`rounded-full px-6 py-3 text-sm font-bold transition-all ${isLoading || !regNo.trim() || leaderboard.length === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-lime text-ink hover:scale-105 active:scale-95"
                    }`}
                >
                  {isLoading && status.includes("Submitting") ? "Submitting..." : "Submit Results"}
                </button>
              </div>

              {isLoading && status.includes("polls") && (
                <div className="w-full bg-gray-100 h-2 rounded-full mb-4 overflow-hidden">
                  <div
                    className="bg-lime h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress * 10}%` }}
                  />
                </div>
              )}

              <LeaderboardTable leaderboard={leaderboard} totalScore={totalScore} />
            </div>

            {submitResult && (
              <div className={`mt-4 rounded-3xl p-6 text-sm shadow-soft animate-in fade-in slide-in-from-bottom-4 duration-500 ${submitResult.isCorrect ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
                }`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-full ${submitResult.isCorrect ? "bg-green-500" : "bg-red-500"} text-white`}>
                    <Trophy size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-ink">Submission Result</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/50 p-3 rounded-2xl">
                    <p className="text-gray-500 mb-1">Status</p>
                    <p className={`font-bold ${submitResult.isCorrect ? "text-green-600" : "text-red-600"}`}>
                      {submitResult.isCorrect ? "Correct" : "Incorrect"}
                    </p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-2xl">
                    <p className="text-gray-500 mb-1">Idempotent</p>
                    <p className="font-bold text-ink">{submitResult.isIdempotent ? "Yes" : "No"}</p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-2xl">
                    <p className="text-gray-500 mb-1">Your Total</p>
                    <p className="font-bold text-ink text-xl">{submitResult.submittedTotal}</p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-2xl">
                    <p className="text-gray-500 mb-1">Expected</p>
                    <p className="font-bold text-ink text-xl">{submitResult.expectedTotal}</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 bg-white/30 p-3 rounded-xl italic">"{submitResult.message}"</p>
              </div>
            )}
          </>
        );
      case "sharing":
        return <PlaceholderPage title="Sharing & Collaboration" icon={Share2} />;
      case "notifications":
        return <PlaceholderPage title="System Notifications" icon={Bell} />;
      case "integrations":
        return <PlaceholderPage title="App Integrations" icon={Link2} />;
      case "global":
        return <PlaceholderPage title="Global Settings" icon={Globe} />;
      case "academy":
        return <PlaceholderPage title="Learning Academy" icon={BookOpen} />;
      case "support":
        return <PlaceholderPage title="Support & Help" icon={CircleHelp} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-sage p-3">
      <div className="mx-auto flex max-w-[1600px] gap-3 rounded-[24px] bg-[#eef1ec] p-3">
        <aside className="flex w-[60px] flex-col items-center rounded-[22px] bg-[#16181d] py-3 text-white shadow-soft">
          <div className="mb-4 rounded-xl bg-[#0f1116] p-2 cursor-pointer hover:scale-110 transition-transform">
            <Trophy size={18} className="text-lime" />
          </div>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSidebar(item.id)}
              title={item.label}
              className={`mb-3 rounded-xl p-2 transition-all relative group ${activeSidebar === item.id ? "bg-[#343840] text-lime" : "text-gray-400 hover:bg-[#242831] hover:text-white"
                }`}
            >
              <item.icon size={16} />
              <span className="absolute left-full ml-2 px-2 py-1 bg-[#111] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </span>
            </button>
          ))}
          <div className="mt-auto h-9 w-9 overflow-hidden rounded-full bg-lime border-2 border-white/20 cursor-pointer hover:border-lime transition-all" />
        </aside>

        <main className="flex-1 rounded-[20px] bg-panel p-6 shadow-soft overflow-hidden min-h-[85vh]">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-[2.2rem] font-extrabold leading-tight text-ink">
              ScoreBoard<span className="text-lime">X</span>
              <span className="ml-4 text-sm font-normal text-gray-400 uppercase tracking-widest">{activeSidebar}</span>
            </h1>
            <button className="rounded-full bg-[#111722] px-6 py-3 text-sm font-medium text-white hover:bg-black hover:shadow-lg transition-all active:scale-95">
              + New Session
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {topTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2.5 text-[0.85rem] font-medium transition-all whitespace-nowrap ${activeTab === tab ? "bg-[#111] text-white shadow-md" : "bg-white text-[#666] hover:bg-gray-50"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="animate-in fade-in duration-500">
            {renderContent()}
          </div>
        </main>

        <section className="w-[280px] rounded-[20px] bg-panel p-4 shadow-soft hidden xl:block">
          <div className="mb-4 flex justify-between items-center px-2">
            <h3 className="font-bold text-ink">Resources</h3>
            <button className="rounded-full bg-white p-2 hover:bg-gray-100 transition-colors shadow-sm"><Settings size={15} /></button>
          </div>
          <div className="grid gap-3">
            {rightLinks.map((link) => (
              <div key={link} className="rounded-3xl bg-white p-4 shadow-soft hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-lime/30">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-base font-semibold text-ink group-hover:text-lime transition-colors">{link}</span>
                  <span className="text-[#888] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
                </div>
                <p className="text-xs text-[#949494]">Access documentation and tutorials for {link.toLowerCase()}...</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl bg-lime p-5 shadow-soft">
            <h4 className="font-bold text-ink mb-2">Pro Feature</h4>
            <p className="text-xs text-ink/70 mb-4">Unlock advanced analytics and real-time team collaboration.</p>
            <button className="w-full py-3 bg-ink text-white rounded-2xl text-xs font-bold hover:opacity-90 transition-opacity">Upgrade Now</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function PlaceholderPage({ title, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-10 bg-white rounded-[32px] shadow-soft border border-dashed border-gray-200">
      <div className="w-20 h-20 bg-lime/10 rounded-full flex items-center justify-center mb-6 text-lime animate-pulse">
        <Icon size={40} />
      </div>
      <h2 className="text-3xl font-bold text-ink mb-3">{title}</h2>
      <p className="text-gray-500 max-w-md">
        This page is currently under development. Soon you'll be able to manage all your {title.toLowerCase()} right here in the ScoreBoardX dashboard.
      </p>
      <button className="mt-8 px-8 py-3 bg-ink text-white rounded-full font-bold hover:scale-105 transition-transform active:scale-95">
        Go Back to Home
      </button>
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
