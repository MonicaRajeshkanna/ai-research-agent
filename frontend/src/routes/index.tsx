import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  ExternalLink,
  FileSearch,
  Github,
  Lightbulb,
  LoaderCircle,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Research Agent" },
      {
        name: "description",
        content: "Type a topic and get a structured research report with key findings and sources.",
      },
      { property: "og:title", content: "AI Research Agent" },
      {
        property: "og:description",
        content: "Type a topic and get a structured research report with key findings and sources.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const DEFAULT_API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/research";

type Source = {
  title?: string;
  url?: string;
  content?: string;
  source?: string;
  score?: number;
};

type Report = {
  title: string;
  summary: string;
  key_findings: string[];
  conclusion: string;
  sources: Source[];
};

const DEMO_REPORT: Report = {
  title: "Sample Report: The State of Small Modular Reactors",
  summary:
    "This is a demo report rendered locally so you can preview the layout and styling without a running backend. Small modular reactors (SMRs) are compact fission plants built in factories and shipped to site, promising faster deployment than conventional gigawatt-scale reactors.",
  key_findings: [
    "SMR designs target 50–300 MWe per unit, enabling incremental capacity additions.",
    "Factory fabrication is expected to cut on-site construction time substantially.",
    "Regulatory approval timelines remain the dominant schedule risk in most markets.",
    "First-of-a-kind costs are high; economics depend on building many identical units.",
  ],
  conclusion:
    "SMRs are technically credible and moving through licensing in several countries, but their commercial case rests on serial production and predictable regulation rather than on any single reactor design.",
  sources: [
    {
      title: "Small Modular Reactors Explained",
      url: "https://www.iaea.org/",
      source: "iaea.org",
      score: 0.95,
      content:
        "An overview of SMR technology, deployment status, and the safety characteristics that distinguish them from large light-water reactors.",
    },
    {
      title: "Advanced Nuclear Cost Outlook",
      url: "https://www.energy.gov/",
      source: "energy.gov",
      score: 0.88,
      content:
        "Analysis of capital cost projections and the learning-rate assumptions behind them.",
    },
  ],
};

function domainOf(s: Source): string {
  if (s.source) return s.source;
  try {
    return new URL(s.url ?? "").hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function Index() {
  const [topic, setTopic] = useState("");
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    const t = topic.trim();
    if (!t || loading) return;
    setLoading(true);
    setError(null);
    setNetworkError(false);
    setReport(null);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      if (!res.ok) {
        throw new Error(`The server responded with ${res.status} ${res.statusText}.`);
      }
      const data = (await res.json()) as Report;
      setReport({
        title: data.title ?? t,
        summary: data.summary ?? "",
        key_findings: Array.isArray(data.key_findings) ? data.key_findings : [],
        conclusion: data.conclusion ?? "",
        sources: Array.isArray(data.sources) ? data.sources : [],
      });
    } catch (e) {
      const isNetwork = e instanceof TypeError;
      setNetworkError(isNetwork);
      setError(
        isNetwork
          ? "Couldn't reach the research service."
          : e instanceof Error
            ? e.message
            : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  function reportText(currentReport: Report) {
    const findings = currentReport.key_findings.map((finding) => `• ${finding}`).join("\n");
    const sources = currentReport.sources
      .map((source) => `• ${source.title || source.url || "Untitled source"}${source.url ? ` — ${source.url}` : ""}`)
      .join("\n");

    return `${currentReport.title}\n\nEXECUTIVE SUMMARY\n${currentReport.summary}\n\nKEY FINDINGS\n${findings}\n\nCONCLUSION\n${currentReport.conclusion}\n\nSOURCES\n${sources}`;
  }

  async function copyReport() {
    if (!report) return;
    await navigator.clipboard.writeText(reportText(report));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadReport() {
    if (!report) return;
    const file = new Blob([reportText(report)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "research-report"}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="relative z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:h-18 sm:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-3" aria-label="AI Research Agent home">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" />
            </span>
            <span className="truncate text-sm font-semibold sm:text-base">AI Research Agent</span>
          </a>
          <nav className="flex shrink-0 items-center gap-1" aria-label="Main navigation">
            <a href="#research" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              Research
            </a>
            <Button asChild variant="ghost" size="icon" aria-label="View project on GitHub" title="GitHub">
              <a href="https://github.com/" target="_blank" rel="noreferrer noopener">
                <Github />
              </a>
            </Button>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="research-grid relative border-b border-border/60 px-5 pb-28 pt-16 sm:px-8 sm:pb-32 sm:pt-22">
          <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 mx-auto h-full max-w-5xl" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="size-3.5" />
              AI-POWERED RESEARCH
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] sm:text-6xl lg:text-7xl">
              AI Research <span className="text-gradient">Agent</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Turn any topic into a structured, source-backed research report.
            </p>
          </div>
        </section>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-20 sm:px-8 sm:pb-28">
          <section id="research" className="-mt-17 rounded-xl border border-border/80 bg-card p-5 shadow-elevated sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Search className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold">What would you like to research?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Ask a focused question for the clearest report.</p>
              </div>
            </div>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generate();
                }
              }}
              placeholder="Enter a research topic, question, or idea..."
              className="min-h-32 resize-none rounded-lg border-border bg-background p-4 text-base leading-7 shadow-none transition-shadow focus-visible:ring-2 sm:min-h-36"
            />
            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowSettings((v) => !v)} className="self-start text-muted-foreground">
                <Settings2 />
                {showSettings ? "Hide settings" : "Connection settings"}
              </Button>
              <Button onClick={generate} disabled={loading || topic.trim().length === 0} size="lg" className="gradient-button h-12 w-full px-6 shadow-brand transition-transform hover:-translate-y-0.5 sm:w-auto">
                {loading ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
                {loading ? "Researching…" : "Generate Report"}
                {!loading && <ArrowUpRight />}
              </Button>
            </div>

            {showSettings && (
              <div className="mt-5 border-t border-border pt-5">
                <label htmlFor="api" className="text-xs font-semibold text-muted-foreground">API endpoint</label>
                <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <Input
                  id="api"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                    className="min-w-0 font-mono text-xs"
                />
                  <Button type="button" variant="outline" onClick={() => setApiUrl(DEFAULT_API_URL)}>
                    <RotateCcw />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                </div>
              </div>
            )}
          </section>

          {loading && (
            <section className="mt-8 animate-enter rounded-xl border border-border bg-card p-6 shadow-soft sm:p-8" aria-live="polite">
              <div className="flex items-center gap-4">
                <span className="relative grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <LoaderCircle className="size-6 animate-spin" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold">Researching your topic...</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Searching sources and analyzing information</p>
                </div>
              </div>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
                <span className="loading-bar block h-full w-1/3 rounded-full bg-primary" />
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">This usually takes 10–30 seconds. Keep this page open while the report is prepared.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["Summary", "Key findings", "Sources"].map((label) => (
                  <div key={label} className="rounded-lg border border-border p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    <div className="mt-4 h-2 w-full animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-2 w-3/4 animate-pulse rounded bg-muted" />
                    <span className="sr-only">Preparing {label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {error && !loading && (
            <section className="mt-8 animate-enter rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-soft" role="alert">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive">
                  <TriangleAlert className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-semibold">Something went wrong</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{error} We couldn't generate your research report. Please try again.</p>
                </div>
              </div>
              {networkError && (
                <div className="mt-5 rounded-lg border border-border/80 bg-card/70 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Connection checklist</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />Check that your local server is running at <span className="break-all font-mono text-xs text-foreground">{apiUrl}</span></li>
                    <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />Confirm CORS headers allow this page, including the OPTIONS preflight.</li>
                    <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />Browsers may block plain http:// calls from an https:// page.</li>
                  </ul>
                </div>
              )}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button type="button" onClick={generate}><RotateCcw />Try again</Button>
                <Button type="button" variant="outline" onClick={() => { setError(null); setNetworkError(false); setReport(DEMO_REPORT); }}>
                  <FileSearch />Load sample report
                </Button>
              </div>
            </section>
          )}

          {report && !loading ? (
            <article className="mt-12 animate-enter" aria-label="Research report">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-7 sm:flex sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="mb-2 text-xs font-semibold uppercase text-primary">Research Report</p>
                  <h2 className="font-display text-2xl font-semibold leading-tight sm:text-4xl">{report.title}</h2>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={copyReport} title="Copy report">
                    {copied ? <Check /> : <Clipboard />}
                    <span className="hidden md:inline">{copied ? "Copied" : "Copy Report"}</span>
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={downloadReport} title="Download report">
                    <Download />
                    <span className="hidden md:inline">Download Report</span>
                  </Button>
                </div>
              </div>

              <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)] lg:items-start">
                <div className="space-y-5">
                  {report.summary && (
                    <section className="report-card border-l-primary">
                      <div className="mb-4 flex items-center gap-3"><span className="section-icon"><FileSearch /></span><h3 className="font-display text-lg font-semibold">Executive Summary</h3></div>
                      <p className="text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">{report.summary}</p>
                    </section>
                  )}
                  {report.key_findings.length > 0 && (
                    <section className="report-card border-l-accent-strong">
                      <div className="mb-5 flex items-center gap-3"><span className="section-icon text-accent-strong"><Lightbulb /></span><h3 className="font-display text-lg font-semibold">Key Findings</h3></div>
                      <ul className="space-y-4">
                        {report.key_findings.map((finding, index) => (
                          <li key={index} className="flex gap-3 text-[15px] leading-7 text-muted-foreground">
                            <span className="mt-1.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Check className="size-3" /></span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {report.conclusion && (
                    <section className="report-card border-l-highlight">
                      <div className="mb-4 flex items-center gap-3"><span className="section-icon text-highlight"><CheckCircle2 /></span><h3 className="font-display text-lg font-semibold">Conclusion</h3></div>
                      <p className="text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">{report.conclusion}</p>
                    </section>
                  )}
                </div>

                {report.sources.length > 0 && (
                  <section className="rounded-lg border border-border bg-card p-5 shadow-soft lg:sticky lg:top-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-display text-lg font-semibold">Sources</h3>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{report.sources.length}</span>
                    </div>
                    <ul className="space-y-3">
                      {report.sources.map((source, index) => (
                        <li key={index} className="group rounded-lg border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft">
                          <div className="flex items-start gap-3">
                            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground"><ExternalLink className="size-3.5" /></span>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-semibold leading-5">{source.title || source.url || "Untitled source"}</p>
                              <p className="mt-1 truncate text-xs text-muted-foreground">{domainOf(source)}{typeof source.score === "number" ? ` · ${Math.round(source.score * 100)}% match` : ""}</p>
                            </div>
                          </div>
                          {source.url && (
                            <a href={source.url} target="_blank" rel="noreferrer noopener" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                              View Source <ArrowUpRight className="size-3.5" />
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </article>
          ) : !loading && !error ? (
            <section className="py-18 text-center sm:py-24">
              <span className="mx-auto grid size-16 place-items-center rounded-xl border border-border bg-card text-primary shadow-soft">
                <FileSearch className="size-7" />
              </span>
              <h2 className="mt-5 font-display text-lg font-semibold">Your research report will appear here</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Enter a topic above to create a structured report with key findings and source links.</p>
            </section>
          ) : null}
        </div>
      </main>
      <footer className="border-t border-border bg-card/50 px-5 py-7 text-center text-xs text-muted-foreground">
        Built for clear thinking and better research.
      </footer>
    </div>
  );
}
