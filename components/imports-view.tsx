"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock3, Images, LockKeyhole, RefreshCw } from "lucide-react";
import { useState } from "react";

import { TransientToast } from "@/components/transient-toast";
import type { ImportRun, WardrobeProfile } from "@/lib/types";

export function ImportsView({ initialImports, profile }: { initialImports: ImportRun[]; profile: WardrobeProfile }) {
  const [imports, setImports] = useState(initialImports);
  const [starting, setStarting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function startImport(days = 30) {
    setStarting(true);
    const response = await fetch("/api/imports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ days }) });
    const data = await response.json() as { import?: ImportRun; message?: string };
    setStarting(false);
    if (!response.ok || !data.import) { setToast(data.message ?? "The import could not start."); return; }
    setImports((current) => [data.import!, ...current]);
    setToast(data.import.message);
  }

  return <>
    <section className="page-heading"><div className="page-heading-copy"><p className="eyebrow">From Apple Photos</p><h1>Bring in {profile.name}&apos;s photos.</h1><p>Searches for <strong>{profile.photosName || "the name you set in Settings"}</strong> and records results for review. Clothing identification and catalogue updates are managed with Codex.</p></div><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="button button-secondary" type="button" onClick={() => startImport(30)} disabled={starting}>Last 30 days</button><button className="button button-primary" type="button" onClick={() => startImport(366)} disabled={starting}><Images size={16} aria-hidden="true" /> {starting ? "Checking Photos…" : "Available year"}</button></div></section>
    <div className="stat-strip" aria-label="Import summary"><div className="stat"><span className="stat-value">{Math.max(0, ...imports.map((run) => run.found))}</span><span className="stat-label">Photos found</span></div><div className="stat"><span className="stat-value">{Math.max(0, ...imports.map((run) => run.observations))}</span><span className="stat-label">Garment observations</span></div><div className="stat"><span className="stat-value">{imports.length}</span><span className="stat-label">Import sessions</span></div></div>
    <div className="split-layout"><section className="panel" aria-labelledby="import-history-heading"><div className="panel-header"><div><h2 id="import-history-heading">Import history</h2><p>Runs are safe to repeat. Existing Photos identifiers are skipped.</p></div><RefreshCw size={18} color="var(--muted)" aria-hidden="true" /></div><div className="review-list">{imports.map((run) => <div className="review-row" key={run.id}><div className="review-row-image" style={{ display: "grid", placeItems: "center", background: "var(--primary-soft)", color: "var(--primary)" }}>{run.status === "complete" ? <CheckCircle2 size={24} /> : <Clock3 size={24} />}</div><div><h3>{run.windowLabel}</h3><p>{run.startedAt} · {run.found} found · {run.observations} observations{typeof run.skipped === "number" ? ` · ${run.skipped} skipped` : ""}{typeof run.exported === "number" ? ` · ${run.exported} copied locally` : ""}</p><span className="pairing-type" style={{ marginTop: 8 }}>{run.status === "ready_for_review" ? "Ready to process" : run.status.replaceAll("_", " ")}</span></div><ChevronRight size={17} aria-hidden="true" /></div>)}</div></section><section className="panel"><div className="panel-body"><div className="privacy-callout"><LockKeyhole size={19} aria-hidden="true" /><p><strong>Local by default.</strong> Photos exports stay in the app&apos;s private data directory. This importer does not send photos to an AI service or modify the Photos library. Review images locally before choosing any external analysis.</p></div><div className="settings-section" style={{ marginTop: 28 }}><h2>What happens next</h2><p>The importer uses a configured local inventory or an optional Apple Photos text search, then filters the date window. Text search is not an exact person match; review the results. Extraction and catalogue updates are then managed directly through Codex.</p><Link className="button button-secondary" href="/settings">Privacy settings <ChevronRight size={15} aria-hidden="true" /></Link></div></div></section></div>
    {toast ? <TransientToast message={toast} onDismiss={() => setToast(null)} /> : null}
  </>;
}
