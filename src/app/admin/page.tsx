"use client";

import { useState, useEffect, useCallback } from "react";
import { toCSV, downloadCSV } from "@/lib/csv";

interface Stats {
  total_analyses: number;
  total_leads: number;
  analyses_this_week: number;
  analyses_this_month: number;
  leads_this_week: number;
  industries: Record<string, number>;
  locales: Record<string, number>;
}

interface AnalysisRow {
  id: string;
  created_at: string;
  user_url: string;
  competitor_urls: string[];
  industry: string | null;
  locale: string;
  leads: { email: string }[];
}

interface LeadRow {
  id: number;
  created_at: string;
  email: string;
  analysis_id: string;
  source: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [analysesTotal, setAnalysesTotal] = useState(0);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"analyses" | "leads">("analyses");

  // Filters
  const [industryFilter, setIndustryFilter] = useState("");
  const [localeFilter, setLocaleFilter] = useState("");
  const [analysesPage, setAnalysesPage] = useState(0);
  const [leadsPage, setLeadsPage] = useState(0);
  const PAGE_SIZE = 25;

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_token");
    if (stored) setToken(stored);
  }, []);

  const authHeaders = useCallback(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats", { headers: authHeaders() });
    if (res.ok) setStats(await res.json());
  }, [authHeaders]);

  const fetchAnalyses = useCallback(async () => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(analysesPage * PAGE_SIZE),
    });
    if (industryFilter) params.set("industry", industryFilter);
    if (localeFilter) params.set("locale", localeFilter);

    const res = await fetch(`/api/admin/analyses?${params}`, { headers: authHeaders() });
    if (res.ok) {
      const json = await res.json();
      setAnalyses(json.data);
      setAnalysesTotal(json.total);
    }
  }, [authHeaders, analysesPage, industryFilter, localeFilter]);

  const fetchLeads = useCallback(async () => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(leadsPage * PAGE_SIZE),
    });

    const res = await fetch(`/api/admin/leads?${params}`, { headers: authHeaders() });
    if (res.ok) {
      const json = await res.json();
      setLeads(json.data);
      setLeadsTotal(json.total);
    }
  }, [authHeaders, leadsPage]);

  useEffect(() => {
    if (!token) return;
    fetchStats();
  }, [token, fetchStats]);

  useEffect(() => {
    if (!token) return;
    fetchAnalyses();
  }, [token, fetchAnalyses]);

  useEffect(() => {
    if (!token) return;
    fetchLeads();
  }, [token, fetchLeads]);

  const exportAnalysesCSV = async () => {
    const res = await fetch("/api/admin/analyses?limit=10000", { headers: authHeaders() });
    if (!res.ok) return;
    const json = await res.json();
    const csv = toCSV(
      json.data.map((a: AnalysisRow) => ({
        id: a.id,
        created_at: a.created_at,
        user_url: a.user_url,
        industry: a.industry || "",
        email: a.leads?.[0]?.email || "",
        locale: a.locale,
        competitor_count: a.competitor_urls?.length || 0,
        competitor_urls: a.competitor_urls,
      })),
      ["id", "created_at", "user_url", "industry", "email", "locale", "competitor_count", "competitor_urls"]
    );
    downloadCSV(csv, `analyses-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const exportLeadsCSV = async () => {
    const res = await fetch("/api/admin/leads?limit=10000", { headers: authHeaders() });
    if (!res.ok) return;
    const json = await res.json();
    const csv = toCSV(json.data, ["id", "created_at", "email", "source", "analysis_id"]);
    downloadCSV(csv, `leads-${new Date().toISOString().split("T")[0]}.csv`);
  };

  if (!token) {
    return <LoginForm onLogin={(t) => { sessionStorage.setItem("admin_token", t); setToken(t); }} />;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-zinc-900">Positioning Radar — Admin</h1>
          <button
            onClick={() => { sessionStorage.removeItem("admin_token"); setToken(null); }}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard label="Total Analyses" value={stats.total_analyses} />
            <StatCard label="Total Leads" value={stats.total_leads} />
            <StatCard label="Analyses (7d)" value={stats.analyses_this_week} />
            <StatCard label="Analyses (30d)" value={stats.analyses_this_month} />
            <StatCard label="Leads (7d)" value={stats.leads_this_week} />
          </div>
        )}

        {/* Industry Breakdown */}
        {stats && Object.keys(stats.industries).length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900">Industries</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.industries)
                .sort(([, a], [, b]) => b - a)
                .map(([industry, count]) => (
                  <span
                    key={industry}
                    className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700"
                  >
                    {industry} <span className="font-semibold">{count}</span>
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
          <button
            onClick={() => setActiveTab("analyses")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === "analyses" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Analyses ({analysesTotal})
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === "leads" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Leads ({leadsTotal})
          </button>
        </div>

        {/* Analyses Tab */}
        {activeTab === "analyses" && (
          <div className="space-y-4">
            {/* Filters + Export */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={industryFilter}
                onChange={(e) => { setIndustryFilter(e.target.value); setAnalysesPage(0); }}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700"
              >
                <option value="">All industries</option>
                {stats && Object.keys(stats.industries).sort().map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              <select
                value={localeFilter}
                onChange={(e) => { setLocaleFilter(e.target.value); setAnalysesPage(0); }}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700"
              >
                <option value="">All locales</option>
                {stats && Object.keys(stats.locales).sort().map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <div className="flex-1" />
              <button
                onClick={exportAnalysesCSV}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Export CSV
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium text-zinc-500">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">URL</th>
                    <th className="px-4 py-3">Industry</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Locale</th>
                    <th className="px-4 py-3 text-right">Competitors</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((a) => (
                    <tr key={a.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                        {new Date(a.created_at).toLocaleDateString("fi-FI")}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={a.user_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:underline"
                        >
                          {a.user_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                        <a
                          href={`/en/results/${a.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-xs text-zinc-400 hover:text-zinc-600"
                        >
                          [result]
                        </a>
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{a.industry || "—"}</td>
                      <td className="px-4 py-3 text-zinc-600">
                        {a.leads?.[0]?.email || <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{a.locale}</td>
                      <td className="px-4 py-3 text-right text-zinc-500">
                        {a.competitor_urls?.length || 0}
                      </td>
                    </tr>
                  ))}
                  {analyses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                        No analyses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              page={analysesPage}
              pageSize={PAGE_SIZE}
              total={analysesTotal}
              onPageChange={setAnalysesPage}
            />
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <button
                onClick={exportLeadsCSV}
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium text-zinc-500">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                        {new Date(l.created_at).toLocaleDateString("fi-FI")}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900">{l.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                          {l.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/en/results/${l.analysis_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:underline text-xs"
                        >
                          {l.analysis_id}
                        </a>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">
                        No leads found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={leadsPage}
              pageSize={PAGE_SIZE}
              total={leadsTotal}
              onPageChange={setLeadsPage}
            />
          </div>
        )}

        {/* HubSpot Placeholder */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">HubSpot Integration</h2>
              <p className="text-sm text-zinc-500">Sync leads and analyses to HubSpot CRM</p>
            </div>
            <button
              disabled
              className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed"
            >
              Sync to HubSpot
              <span className="ml-2 rounded bg-zinc-300 px-1.5 py-0.5 text-xs text-zinc-500">
                Coming Soon
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* --- Sub-components --- */

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(false);

    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${input}` },
      });
      if (res.ok) {
        onLogin(input);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-center text-lg font-semibold text-zinc-900">Admin Dashboard</h1>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Admin password"
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          autoFocus
        />
        {error && <p className="text-sm text-red-600">Invalid password</p>}
        <button
          type="submit"
          disabled={checking || !input}
          className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {checking ? "Checking..." : "Login"}
        </button>
      </form>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between text-sm text-zinc-500">
      <span>
        {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-50 disabled:opacity-30"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-50 disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
