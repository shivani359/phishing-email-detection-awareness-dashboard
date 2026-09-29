import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileSearch,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Loader2,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldEllipsis,
  Sparkles,
  Target,
  Upload,
  X,
} from 'lucide-react';
import {
  useCreateAnalysis,
  useGetDashboardSummary,
  useHealthCheck,
  useListAnalyses,
  useListAwarenessModules,
  useListSampleEmails,
} from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';
import {
  Route,
  Link,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

const classificationLabel: Record<string, string> = {
  SAFE: 'Safe',
  LOW_RISK: 'Low risk',
  SUSPICIOUS: 'Suspicious',
  HIGH_RISK: 'High risk',
};

const riskTone = (classification: string) => {
  if (classification === 'HIGH_RISK') return 'high';
  if (classification === 'SUSPICIOUS') return 'suspicious';
  if (classification === 'LOW_RISK') return 'low';
  return 'safe';
};

const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : '—';

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const health = useHealthCheck({ query: { queryKey: ['/api/healthz'], retry: false, refetchInterval: 60000 } });
  const navItems = [
    { href: '/', label: 'Risk overview', icon: LayoutDashboard },
    { href: '/analyze', label: 'Analyze email', icon: FileSearch },
    { href: '/history', label: 'Analysis history', icon: Inbox },
    { href: '/awareness', label: 'Awareness lab', icon: BookOpen },
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar" style={mobileOpen ? { display: 'flex', position: 'fixed', inset: 0, zIndex: 30 } : undefined}>
        <div className="flex items-center gap-3 px-2">
          <div className="brand-mark"><ShieldEllipsis /></div>
          <div><div className="brand-name">SignalDesk</div><div className="brand-sub">student soc workspace</div></div>
        </div>
        <div className="nav-section-label">Workspace</div>
        <nav className="grid gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${location === href ? 'active' : ''}`} data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMobileOpen(false)}>
              <Icon /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="nav-section-label">Reference</div>
        <div className="nav-link cursor-default"><LifeBuoy /><span>Analyst notes</span></div>
        <div className="sidebar-foot">
          <div className="health-line"><span className={`health-dot ${health.isError ? 'down' : ''}`} /><span>{health.isError ? 'Analysis API unavailable' : 'Analysis API operational'}</span></div>
          <div className="font-mono-app mt-2 text-[10px] text-[hsl(70_18%_58%)]">MODEL ROUTE / v1.4</div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button className="button-quiet mobile-menu" data-testid="button-open-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button>
          <div className="crumb">Phishing email detection / {location === '/' ? 'overview' : location.slice(1)}</div>
          <div className="topbar-actions"><div className="analyst-chip"><span className="avatar">SA</span><span>Student analyst</span><ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" /></div></div>
        </header>
        {children}
      </div>
    </div>
  );
}

function LoadingPanel({ lines = 3 }: { lines?: number }) {
  return <div className="activity-list" data-testid="status-loading">{Array.from({ length: lines }).map((_, i) => <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] py-5" key={i}><div className="skeleton h-2.5 w-2.5 rounded-full" /><div className="flex-1"><div className="skeleton h-3 w-3/5" /><div className="skeleton mt-2 h-2.5 w-2/5" /></div><div className="skeleton h-5 w-20" /></div>)}</div>;
}

function QueryError({ onRetry }: { onRetry: () => void }) {
  return <div className="error-state" data-testid="status-error"><AlertTriangle className="mx-auto mb-3 h-7 w-7 text-[hsl(var(--destructive))]" /><strong>Could not load this workspace</strong><p>The analysis service did not respond. Try again in a moment.</p><button className="button-quiet" onClick={onRetry} data-testid="button-retry"><RefreshCw /> Retry</button></div>;
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return <div className="empty-state" data-testid="status-empty"><Sparkles className="mx-auto mb-3 h-7 w-7 text-[hsl(var(--primary))]" /><strong>{title}</strong><p>{copy}</p></div>;
}

function Overview() {
  const summaryQuery = useGetDashboardSummary();
  const analysesQuery = useListAnalyses();
  const summary = summaryQuery.data;
  const analyses = analysesQuery.data ?? [];
  const breakdown = summary?.classificationBreakdown ?? [];
  const maxBreakdown = Math.max(...breakdown.map(item => item.count), 1);
  const recent = analyses.slice(0, 6);
  return <main className="main-content">
    <div className="page-intro">
      <div><div className="eyebrow">Morning brief / live workspace</div><h1 className="page-title">Know what needs<br />your attention.</h1><p className="page-description">A calm readout of the email signals your cohort is seeing, with a next step for every finding.</p></div>
      <Link href="/analyze" className="button-primary" data-testid="link-start-analysis"><FileSearch /> Analyze an email <ArrowRight /></Link>
    </div>
    {summaryQuery.isLoading ? <div className="stat-grid">{Array.from({ length: 4 }).map((_, i) => <div className="stat-card" key={i}><div className="skeleton h-3 w-24" /><div className="skeleton mt-7 h-8 w-20" /></div>)}</div> : summaryQuery.isError ? <div className="surface mb-7"><QueryError onRetry={() => summaryQuery.refetch()} /></div> : <div className="stat-grid">
      <div className="stat-card"><div className="stat-label">Emails analyzed</div><div className="stat-value" data-testid="text-total-analyzed">{summary?.totalAnalyzed ?? 0}</div><div className="stat-note">{summary?.last24hCount ?? 0} in the last 24 hours</div></div>
      <div className="stat-card"><div className="stat-label">High risk queue</div><div className="stat-value text-[hsl(var(--destructive))]" data-testid="text-high-risk-count">{summary?.highRiskCount ?? 0}</div><div className="stat-note">Needs a closer look</div></div>
      <div className="stat-card"><div className="stat-label">Suspicious signals</div><div className="stat-value" data-testid="text-suspicious-count">{summary?.suspiciousCount ?? 0}</div><div className="stat-note">Worth validating</div></div>
      <div className="stat-card"><div className="stat-label">Average risk score</div><div className="stat-value" data-testid="text-average-risk">{Math.round(summary?.averageRisk ?? 0)}<span className="text-lg">/100</span></div><div className="stat-note">Across all analyses</div></div>
    </div>}
    <div className="dashboard-grid">
      <section className="surface"><div className="surface-header"><div><div className="surface-title">Recent analysis activity</div><div className="surface-meta mt-1">Most recent signals first</div></div><Link href="/history" className="text-xs font-bold text-[hsl(var(--primary))]" data-testid="link-view-history">View all <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></div>{analysesQuery.isLoading ? <LoadingPanel /> : analysesQuery.isError ? <QueryError onRetry={() => analysesQuery.refetch()} /> : recent.length === 0 ? <EmptyState title="Your queue is clear" copy="Run your first fictional email through the analyzer to create a useful trail." /> : <div className="activity-list">{recent.map((item) => <Link href="/history" className="activity-row no-underline" key={item.id} data-testid={`row-recent-analysis-${item.id}`}><span className={`risk-pip risk-${riskTone(item.classification)}`} /><div className="activity-copy"><div className="activity-subject">{item.subject}</div><div className="activity-sender">{item.sender} · {formatDate(item.createdAt)}</div></div><span className={`classification-pill pill-${riskTone(item.classification)}`}>{classificationLabel[item.classification] ?? item.classification}</span><span className="font-mono-app text-[11px] text-[hsl(var(--muted-foreground))]">{item.riskScore}</span></Link>)}</div>}</section>
      <section className="surface"><div className="surface-header"><div><div className="surface-title">Risk distribution</div><div className="surface-meta mt-1">Classification across your workspace</div></div><Target className="h-4 w-4 text-[hsl(var(--primary))]" /></div>{summaryQuery.isLoading ? <LoadingPanel lines={4} /> : <div className="breakdown">{breakdown.length === 0 ? <EmptyState title="No distribution yet" copy="Complete an analysis to see the pattern." /> : breakdown.map(item => <div className="bar-item" key={item.classification}><div className="bar-label"><span>{classificationLabel[item.classification] ?? item.classification}</span><span>{item.count}</span></div><div className="bar-track"><div className={`bar-fill fill-${riskTone(item.classification)}`} style={{ width: `${Math.round((item.count / maxBreakdown) * 100)}%` }} /></div></div>)}<div className="insight-box"><strong>LEARNING SIGNAL</strong><p>{(summary?.highRiskCount ?? 0) > 0 ? 'High-risk messages are in the queue. Start by checking the sender path and any request for urgent action.' : 'No high-risk messages in view. Use the analyzer to practice spotting the smaller signals that often come first.'}</p></div></div>}</section>
    </div>
  </main>;
}

function Analyze() {
  const samplesQuery = useListSampleEmails();
  const createAnalysis = useCreateAnalysis();
  const [form, setForm] = useState({ sender: '', subject: '', content: '' });
  const [result, setResult] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadNote, setUploadNote] = useState('');
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const loadSample = (sample: { sender: string; subject: string; content: string }) => { setForm({ sender: sample.sender, subject: sample.subject, content: sample.content }); setResult(null); setSubmitted(false); };
  const loadFile = async (file: File) => {
    if (file.size > 1024 * 1024) {
      setUploadNote('Please choose a text sample smaller than 1 MB.');
      return;
    }
    const raw = await file.text();
    const sender = raw.match(/^From:\s*(.+)$/im)?.[1]?.trim() ?? 'uploaded-sample@local.invalid';
    const subject = raw.match(/^Subject:\s*(.+)$/im)?.[1]?.trim() ?? file.name.replace(/\.(txt|eml)$/i, '');
    const content = raw.replace(/^(From|Subject|To|Date):.*$/gim, '').trim();
    setForm({ sender, subject, content: content || raw });
    setResult(null);
    setSubmitted(false);
    setUploadNote(`${file.name} loaded locally. Nothing was uploaded or sent.`);
  };
  const submit = (event: FormEvent) => { event.preventDefault(); setSubmitted(true); if (!form.sender.trim() || !form.subject.trim() || !form.content.trim()) return; createAnalysis.mutate({ data: form }, { onSuccess: (analysis) => setResult(analysis) }); };
  return <main className="main-content">
    <div className="page-intro"><div><div className="eyebrow">Analysis console / explainable by design</div><h1 className="page-title">Put a message<br />under the lens.</h1><p className="page-description">Paste a fictional email or load a training sample. The result maps risk to observable signals, not mysterious verdicts.</p></div><div className="font-mono-app text-right text-[11px] text-[hsl(var(--muted-foreground))]">ENGINE<br /><span className="text-[hsl(var(--foreground))]">PHISHGUARD / READY</span></div></div>
    <div className="analyze-layout">
      <section className="surface form-surface">
        <form onSubmit={submit} data-testid="form-analyze-email">
          <div className="sample-strip -mx-[22px] -mt-[22px] mb-5"><div className="sample-strip-title">Start with a safe training sample</div>{samplesQuery.isLoading ? <div className="skeleton h-7 w-full" /> : samplesQuery.isError ? <div className="text-xs text-[hsl(var(--destructive))]">Samples are unavailable right now.</div> : <div className="sample-buttons">{(samplesQuery.data ?? []).map(sample => <button type="button" key={sample.id} className="sample-button" onClick={() => loadSample(sample)} data-testid={`button-load-sample-${sample.id}`}>{sample.label}</button>)}</div>}<label className="upload-button"><Upload /><span>Load .txt / .eml</span><input type="file" accept=".txt,.eml,text/plain,message/rfc822" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void loadFile(file); event.currentTarget.value = ''; }} data-testid="input-email-file" /></label>{uploadNote && <div className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">{uploadNote}</div>}</div>
          <div className="field"><label htmlFor="sender">Sender address</label><input id="sender" value={form.sender} onChange={event => update('sender', event.target.value)} placeholder="security@company.example" data-testid="input-sender" />{submitted && !form.sender.trim() && <div className="mt-2 text-xs text-[hsl(var(--destructive))]">Add a sender address to continue.</div>}</div>
          <div className="field"><label htmlFor="subject">Subject line</label><input id="subject" value={form.subject} onChange={event => update('subject', event.target.value)} placeholder="Action required: verify your account" data-testid="input-subject" />{submitted && !form.subject.trim() && <div className="mt-2 text-xs text-[hsl(var(--destructive))]">Add a subject line to continue.</div>}</div>
          <div className="field"><label htmlFor="content">Email body</label><textarea id="content" value={form.content} onChange={event => update('content', event.target.value)} placeholder="Paste the message body here..." data-testid="input-content" />{submitted && !form.content.trim() && <div className="mt-2 text-xs text-[hsl(var(--destructive))]">Add the email body to continue.</div>}</div>
          {createAnalysis.isError && <div className="mb-4 flex items-start gap-2 rounded-lg bg-[hsl(var(--destructive)/.1)] p-3 text-xs text-[hsl(var(--destructive))]" data-testid="status-analysis-error"><X className="mt-0.5 h-4 w-4 shrink-0" /> The analysis service could not process this message. You can retry without losing your draft.</div>}
          <div className="form-footer"><div className="form-hint">Fictional samples are safe to inspect.<br />Do not paste live personal data.</div><button className="button-primary" type="submit" disabled={createAnalysis.isPending} data-testid="button-run-analysis">{createAnalysis.isPending ? <><Loader2 className="animate-spin" /> Reading signals...</> : <><ShieldCheck /> Run analysis</>}</button></div>
        </form>
      </section>
      <section className="surface result-card" data-testid="panel-analysis-result">{createAnalysis.isPending ? <><div className="result-hero"><div className="result-class">Working signal map</div><div className="skeleton mt-5 h-14 w-28 bg-[hsl(70_18%_30%)]" /><div className="skeleton mt-5 h-3 w-4/5 bg-[hsl(70_18%_30%)]" /></div><LoadingPanel lines={4} /></> : result ? <AnalysisResult analysis={result} /> : <div className="empty-state min-h-[530px] flex flex-col justify-center"><div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><ShieldCheck className="h-8 w-8" /></div><strong>Result will appear here</strong><p>Run an email when you are ready. We will show the classification, evidence, and the next safe move.</p><div className="mt-2 flex items-center justify-center gap-2 font-mono-app text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]"><Check className="h-3.5 w-3.5 text-[hsl(var(--primary))]" /> explainable output</div></div>}</section>
    </div>
  </main>;
}

function AnalysisResult({ analysis }: { analysis: any }) {
  return <><div className="result-hero"><div className="result-top"><div><div className="result-class">{classificationLabel[analysis.classification] ?? analysis.classification}</div><div className="mt-2 text-sm font-semibold">{analysis.subject}</div><div className="mt-1 text-xs text-[hsl(70_18%_69%)]">{analysis.sender}</div></div><div><div className="result-score">{analysis.riskScore}</div><div className="score-label">risk / 100</div></div></div><p className="result-summary">{analysis.summary}</p></div>{analysis.indicators?.length > 0 && <div className="result-section"><div className="section-kicker">Why this was flagged</div><ul className="indicator-list">{analysis.indicators.map((indicator: string, i: number) => <li key={i}>{indicator}</li>)}</ul></div>}{analysis.urls?.length > 0 && <div className="result-section"><div className="section-kicker">Link inspection</div>{analysis.urls.map((url: any, i: number) => <div className="url-row" key={i}><div className="min-w-0 flex-1"><code>{url.url}</code><div className="url-reason">{url.reason}</div></div><span className={`classification-pill pill-${url.risk === 'MALICIOUS' ? 'high' : url.risk === 'SUSPICIOUS' ? 'suspicious' : 'safe'}`}>{url.risk}</span></div>)}</div>}{analysis.recommendations?.length > 0 && <div className="result-section"><div className="section-kicker">Recommended next steps</div><ul className="recommendation-list">{analysis.recommendations.map((recommendation: string, i: number) => <li key={i}>{recommendation}</li>)}</ul></div>}<div className="px-6 py-4 font-mono-app text-[10px] text-[hsl(var(--muted-foreground))]">MODEL / {analysis.modelUsed} · ANALYSIS ID / {analysis.id}</div></>;
}

function History() {
  const analysesQuery = useListAnalyses();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const analyses = analysesQuery.data ?? [];
  const filtered = useMemo(() => analyses.filter(item => `${item.sender} ${item.subject} ${item.classification}`.toLowerCase().includes(search.toLowerCase())), [analyses, search]);
  const selected = analyses.find(item => item.id === selectedId);
  return <main className="main-content"><div className="page-intro"><div><div className="eyebrow">Case archive / learn from the trail</div><h1 className="page-title">Analysis history.</h1><p className="page-description">Review completed email reads and open any case to see the evidence behind its classification.</p></div><div className="font-mono-app text-right text-[11px] text-[hsl(var(--muted-foreground))]">{analyses.length} CASES<br /><span className="text-[hsl(var(--foreground))]">LOCAL WORKSPACE</span></div></div><section className="surface"><div className="history-toolbar"><div className="surface-title">Completed analyses <span className="ml-2 font-mono-app text-[10px] text-[hsl(var(--muted-foreground))]">{filtered.length} shown</span></div><div className="search-wrap"><Search /><input className="search-input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search sender, subject, risk..." data-testid="input-history-search" /></div></div>{analysesQuery.isLoading ? <LoadingPanel lines={5} /> : analysesQuery.isError ? <QueryError onRetry={() => analysesQuery.refetch()} /> : filtered.length === 0 ? <EmptyState title={search ? 'No matching cases' : 'No completed analyses'} copy={search ? 'Try a sender, subject, or classification.' : 'Your completed email analyses will be collected here.'} /> : <><div className="table-wrap"><table className="analysis-table"><thead><tr><th>Message</th><th>Classification</th><th>Risk score</th><th>Analyzed</th><th /></tr></thead><tbody>{filtered.map(item => <tr className={selectedId === item.id ? 'selected' : ''} key={item.id} onClick={() => setSelectedId(selectedId === item.id ? null : item.id)} data-testid={`row-history-analysis-${item.id}`}><td><div className="font-semibold">{item.subject}</div><div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{item.sender}</div></td><td><span className={`classification-pill pill-${riskTone(item.classification)}`}>{classificationLabel[item.classification] ?? item.classification}</span></td><td><span className="font-mono-app text-[12px]">{item.riskScore}<span className="text-[hsl(var(--muted-foreground))]"> / 100</span></span></td><td className="text-[hsl(var(--muted-foreground))]">{formatDate(item.createdAt)}</td><td><ChevronDown className={`h-4 w-4 text-[hsl(var(--muted-foreground))] transition-transform ${selectedId === item.id ? 'rotate-180' : ''}`} /></td></tr>)}</tbody></table></div>{selected && <div className="history-detail" data-testid={`panel-history-detail-${selected.id}`}><div className="detail-grid"><div><h3 className="detail-heading">Analyst summary</h3><p className="detail-copy">{selected.summary}</p></div><div><h3 className="detail-heading">Observed indicators</h3>{selected.indicators?.length ? <ul className="indicator-list">{selected.indicators.map((indicator: string, i: number) => <li key={i}>{indicator}</li>)}</ul> : <p className="detail-copy">No notable indicators were recorded.</p>}</div></div><div className="mt-5 border-t border-[hsl(var(--border))] pt-4 font-mono-app text-[10px] text-[hsl(var(--muted-foreground))]">MODEL / {selected.modelUsed} · {selected.urls?.length ?? 0} URLS INSPECTED · {selected.recommendations?.length ?? 0} NEXT STEPS</div></div>}</>}</section></main>;
}

function Awareness() {
  const modulesQuery = useListAwarenessModules();
  const modules = modulesQuery.data ?? [];
  return <main className="main-content"><div className="page-intro"><div><div className="eyebrow">Awareness lab / practice with purpose</div><h1 className="page-title">Build the reflex<br />before the alert.</h1><p className="page-description">Short, practical playbooks for the moments when a suspicious message lands and your first instinct matters.</p></div><div className="grid justify-items-end gap-2"><div className="flex items-center gap-2 font-mono-app text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]"><ClipboardCheck className="h-4 w-4 text-[hsl(var(--primary))]" /> field guides</div><div className="font-mono-app text-[11px] text-[hsl(var(--foreground))]">{modules.length} MODULES READY</div></div></div>{modulesQuery.isLoading ? <div className="awareness-grid">{Array.from({ length: 4 }).map((_, i) => <div className="surface module-card" key={i}><div className="skeleton h-3 w-24" /><div className="skeleton mt-6 h-5 w-4/5" /><div className="skeleton mt-4 h-3 w-full" /><div className="skeleton mt-2 h-3 w-3/4" /></div>)}</div> : modulesQuery.isError ? <div className="surface"><QueryError onRetry={() => modulesQuery.refetch()} /></div> : modules.length === 0 ? <div className="surface"><EmptyState title="The lab is being stocked" copy="Awareness modules will appear here when the learning library is ready." /></div> : <div className="awareness-grid">{modules.map(module => <article className="surface module-card" key={module.id} data-testid={`card-awareness-module-${module.id}`}><div className="module-top"><div className="module-category">{module.category}</div><div className="level-tag">{module.level}</div></div><h2 className="module-title">{module.title}</h2><p className="module-description">{module.description}</p><ol className="steps">{module.steps.map((step, i) => <li key={i}><span className="step-number">{String(i + 1).padStart(2, '0')}</span><span>{step}</span></li>)}</ol><div className="module-tip"><strong>Field tip:</strong> {module.tip}</div></article>)}</div>}</main>;
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Shell>
        <Switch>
          <Route path="/" component={Overview} />
          <Route path="/analyze" component={Analyze} />
          <Route path="/history" component={History} />
          <Route path="/awareness" component={Awareness} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
