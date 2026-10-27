"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, ExternalLink, Info, Pencil, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { WardrobeItem } from "@/lib/types";
import { ResponsiveWardrobeImage } from "@/components/responsive-wardrobe-image";
import { TransientToast } from "@/components/transient-toast";
import { formatReplacementCost, replacementCostBasisLabel, replacementCosts } from "@/lib/replacement-costs";

export function ItemDetailView({ initialItem, wardrobe, activeOwnerId = initialItem.ownerId, variant = "page" }: { initialItem: WardrobeItem; wardrobe: WardrobeItem[]; activeOwnerId?: string; variant?: "page" | "drawer" }) {
  const router = useRouter();
  const [item, setItem] = useState(initialItem);
  const [editing, setEditing] = useState(false);
  const [editorClosing, setEditorClosing] = useState(false);
  const editorCloseTimer = useRef<number | null>(null);
  const [name, setName] = useState(initialItem.name);
  const [brand, setBrand] = useState(initialItem.brand);
  const [product, setProduct] = useState(initialItem.product);
  const [color, setColor] = useState(initialItem.color);
  const [material, setMaterial] = useState(initialItem.material);
  const [pattern, setPattern] = useState(initialItem.pattern);
  const [tags, setTags] = useState(initialItem.tags.join(", "));
  const [notes, setNotes] = useState(initialItem.notes);
  const [toast, setToast] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const pairingItems = useMemo(() => item.pairings, [item.pairings]);
  const replacementCost = replacementCosts[item.id];

  useEffect(() => {
    if (activeOwnerId === initialItem.ownerId) return;
    void fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profileId: initialItem.ownerId }),
    }).then((response) => {
      if (response.ok) router.refresh();
    });
  }, [activeOwnerId, initialItem.ownerId, router]);

  useEffect(() => () => {
    if (editorCloseTimer.current !== null) window.clearTimeout(editorCloseTimer.current);
  }, []);

  function toggleEditor() {
    if (!editing) {
      setEditing(true);
      return;
    }
    closeEditor();
  }

  function closeEditor() {
    if (!editing || editorClosing) return;
    setEditorClosing(true);
    editorCloseTimer.current = window.setTimeout(() => {
      setEditing(false);
      setEditorClosing(false);
    }, 160);
  }

  async function saveChanges() {
    const response = await fetch(`/api/wardrobe/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ownerId: item.ownerId, name, brand, product, color, material, pattern, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean), notes }),
    });
    if (!response.ok) {
      setToast("The changes could not be saved. Try again.");
      return;
    }
    const updated = await response.json() as WardrobeItem;
    setItem(updated);
    closeEditor();
    setToast("Item details saved.");
  }

  async function requestRender() {
    if (!window.confirm("Send this item’s text description to OpenAI to generate an illustration? This may incur an API charge. No source photo is sent.")) return;
    setRendering(true);
    const response = await fetch(`/api/wardrobe/${item.id}/render?ownerId=${encodeURIComponent(item.ownerId)}`, { method: "POST" });
    const data = await response.json() as { item?: WardrobeItem; message?: string };
    setRendering(false);
    if (!response.ok) {
      setToast(data.message ?? "The catalogue render could not be created.");
      return;
    }
    if (data.item) setItem(data.item);
    setToast("Catalogue render created.");
  }

  return (
    <div className={`item-detail item-detail-${variant}`}>
      {variant === "page" ? <Link className="detail-back" href="/"><ArrowLeft size={16} aria-hidden="true" /> Wardrobe</Link> : null}
      <div className="detail-hero">
        <div className={`detail-image${item.aiGenerated ? "" : " source-evidence"}`}><ResponsiveWardrobeImage src={item.image} alt={item.aiGenerated ? `${item.name} catalogue render` : `${item.name} catalogue illustration`} loading="eager" fetchPriority="high" /></div>
        <div className="detail-copy">
          <p className="eyebrow">{item.category} / {item.layer}</p>
          <h1>{item.name}</h1>
          <p className="detail-brand">{item.brand} · {item.product}</p>
          <div className="detail-actions">
            <button className="button button-primary" type="button" onClick={requestRender} disabled={rendering}><Sparkles size={16} aria-hidden="true" /> {rendering ? "Creating render…" : item.aiGenerated ? "Regenerate image" : "Create catalogue image"}</button>
            <button className="button button-secondary" type="button" onClick={toggleEditor}><Pencil size={15} aria-hidden="true" />{editing ? "Close editor" : "Edit details"}</button>
          </div>

          {editing ? <div className={`panel detail-editor-panel${editorClosing ? " is-closing" : ""}`}><div className="panel-body stack">
            <div className="field"><label htmlFor="item-name">Catalogue name</label><input id="item-name" className="input" value={name} onChange={(event) => setName(event.target.value)} /></div>
            <div className="detail-editor-grid">
              <div className="field"><label htmlFor="item-brand">Brand</label><input id="item-brand" className="input" value={brand} onChange={(event) => setBrand(event.target.value)} /></div>
              <div className="field"><label htmlFor="item-product">Product</label><input id="item-product" className="input" value={product} onChange={(event) => setProduct(event.target.value)} /></div>
              <div className="field"><label htmlFor="item-colour">Colour</label><input id="item-colour" className="input" value={color} onChange={(event) => setColor(event.target.value)} /></div>
              <div className="field"><label htmlFor="item-material">Material</label><input id="item-material" className="input" value={material} onChange={(event) => setMaterial(event.target.value)} /></div>
              <div className="field"><label htmlFor="item-pattern">Pattern</label><input id="item-pattern" className="input" value={pattern} onChange={(event) => setPattern(event.target.value)} /></div>
              <div className="field"><label htmlFor="item-tags">Tags</label><input id="item-tags" className="input" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="travel, weekend, warm" /></div>
            </div>
            <div className="field"><label htmlFor="item-notes">Notes</label><textarea id="item-notes" className="input textarea" value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
            <div><button className="button button-primary" type="button" onClick={saveChanges}>Save changes</button></div>
          </div></div> : null}

          <dl className="detail-facts">
            <div className="detail-fact"><dt>Colour</dt><dd>{item.color}</dd></div>
            <div className="detail-fact"><dt>Material</dt><dd>{item.material}</dd></div>
            <div className="detail-fact"><dt>Pattern</dt><dd>{item.pattern}</dd></div>
            <div className="detail-fact"><dt>Observed wears</dt><dd>{item.wornCount}</dd></div>
            <div className="detail-fact"><dt>Last worn</dt><dd>{item.lastWorn}</dd></div>
            <div className="detail-fact"><dt>Image status</dt><dd>{item.aiGenerated ? "AI catalogue render" : "Source crop"}</dd></div>
            {replacementCost ? <div className="detail-fact detail-replacement-cost"><dt>Cost to replace</dt><dd><a href={replacementCost.sourceUrl} target="_blank" rel="noreferrer">{formatReplacementCost(replacementCost)} <ExternalLink size={12} aria-hidden="true" /></a><span>{replacementCostBasisLabel(replacementCost.basis)} · researched {replacementCost.researchedAt}</span></dd></div> : null}
          </dl>
          <div className="detail-style" aria-label="Structured garment metadata">
            <div className="detail-colours">
              <span className="detail-style-label">Palette</span>
              <span className="colour-swatch" style={{ backgroundColor: item.colors.primary.hex }} aria-label={`${item.colors.primary.name} ${item.colors.primary.hex}`} />
              <span>{item.colors.primary.name}</span>
              {item.colors.secondary ? <><span className="colour-swatch" style={{ backgroundColor: item.colors.secondary.hex }} aria-label={`${item.colors.secondary.name} ${item.colors.secondary.hex}`} /><span>{item.colors.secondary.name}</span></> : null}
            </div>
            <MetadataChips label="Season" values={item.style.seasons} />
            <MetadataChips label="Texture" values={item.style.textures} />
            <MetadataChips label="Silhouette" values={item.style.silhouettes} />
            <MetadataChips label="Style" values={[item.style.formality, item.style.weight, ...item.tags]} />
          </div>
          <div className="confidence-note"><Info size={17} aria-hidden="true" /><span>{item.notes}</span></div>
        </div>
      </div>

      <section className="detail-section" aria-labelledby="pairings-heading">
        <div className="detail-section-heading"><h2 id="pairings-heading">Pairings from the wardrobe</h2><span>{pairingItems.length} connections</span></div>
        <div className="pairing-grid">
          {pairingItems.map((pairing) => <PairingCard key={`${pairing.itemId}-${pairing.type}`} pairing={pairing} item={wardrobe.find((candidate) => candidate.id === pairing.itemId)} />)}
        </div>
      </section>

      <section className="detail-section" aria-labelledby="sources-heading">
        <div className="detail-section-heading"><h2 id="sources-heading">Source photos</h2><span>{item.sourceDates.length} observations</span></div>
        <div className="source-strip">{item.sourceImages.map((source, index) => <figure className="source-tile" key={`${source}-${index}`}><ResponsiveWardrobeImage src={source} alt={`${item.name} source crop ${index + 1}`} /><figcaption>{item.sourceDates[index] ?? item.sourceDates[0]}</figcaption></figure>)}</div>
      </section>

      <section className="detail-section" aria-labelledby="research-heading">
        <div className="detail-section-heading"><h2 id="research-heading">Research evidence</h2><span>{item.research.length ? "Saved sources" : "No exact match yet"}</span></div>
        {item.research.length ? <div className="source-links">{item.research.map((source) => <a className="source-link" href={source.url} target="_blank" rel="noreferrer" key={source.url}><span><span className="source-link-title">{source.title}</span><span className="source-link-meta">{source.sourceType} · retrieved {source.retrievedAt}</span></span><ExternalLink size={16} aria-hidden="true" /></a>)}</div> : <div className="empty-state"><h2>No defensible product match.</h2><p>Keep the descriptive identity until a label, logo, or distinctive detail appears in a future source photo.</p></div>}
      </section>

      {toast ? <TransientToast message={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  );
}

function MetadataChips({ label, values }: { label: string; values: string[] }) {
  if (!values.length) return null;
  return <div className="detail-metadata-row"><span className="detail-style-label">{label}</span><span className="detail-chip-list">{values.map((value) => <span className="chip" key={`${label}-${value}`}>{value}</span>)}</span></div>;
}

function PairingCard({ pairing, item }: { pairing: WardrobeItem["pairings"][number]; item?: WardrobeItem }) {
  const label = item?.name ?? pairing.itemId.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const content = <><ResponsiveWardrobeImage src={item?.image ?? "/garments/stone-overshirt.svg"} alt="" /><div><h3>{label}</h3><p>{pairing.rationale}</p><span className={`pairing-type${pairing.type === "suggested" ? " suggested" : ""}`}>{pairing.type === "worn" ? `${pairing.count ?? 1}× worn together` : "Suggested"}</span></div>{item ? <ChevronRight className="pairing-row-chevron" size={17} aria-hidden="true" /> : null}</>;
  return item
    ? <Link className="pairing-row pairing-row-link" href={`/wardrobe/${item.id}`} aria-label={`Open ${label}`}>{content}</Link>
    : <div className="pairing-row">{content}</div>;
}
