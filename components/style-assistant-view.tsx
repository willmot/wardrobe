import { ArrowRight, ArrowUpRight, CheckCircle2, Clock3, Info, Sparkles } from "lucide-react";
import Link from "next/link";

import { RecommendationOutcomeControls, StyleAsk } from "@/components/style-assistant-client";
import { ResponsiveWardrobeImage } from "@/components/responsive-wardrobe-image";
import type { RecommendationOutcome, StyleProfileEdition, StyleRecommendation, StyleSignal, WeeklyStyleEdition } from "@/lib/style-assistant-types";
import type { OutfitObservation, WardrobeItem } from "@/lib/types";

export type StyleSection = "briefing" | "weekly" | "your-style" | "outfit-clinic" | "wardrobe-edit" | "gaps" | "ask";

const sections: Array<{ id: StyleSection; label: string }> = [
  { id: "briefing", label: "Briefing" },
  { id: "weekly", label: "Weekly review" },
  { id: "your-style", label: "Your style" },
  { id: "outfit-clinic", label: "Outfit clinic" },
  { id: "wardrobe-edit", label: "Wardrobe edit" },
  { id: "gaps", label: "Gaps" },
  { id: "ask", label: "Ask" },
];

type Props = {
  ownerName: string;
  section: StyleSection;
  edition: StyleProfileEdition;
  recommendations: StyleRecommendation[];
  observations: OutfitObservation[];
  wardrobe: WardrobeItem[];
  allWardrobe: WardrobeItem[];
  outcomes: RecommendationOutcome[];
  legacyEditions: Array<{ id: string; label: string; date: string; href: string }>;
  weeklyEdition?: WeeklyStyleEdition;
  requestedOutfit?: string;
};

function outcomeFor(outcomes: RecommendationOutcome[], recommendationId: string) {
  return outcomes.find((outcome) => outcome.recommendationId === recommendationId)?.status;
}

function SectionNavigation({ active }: { active: StyleSection }) {
  return (
    <nav className="stylist-subnav" aria-label="Style assistant">
      {sections.map((section) => <Link href={`/style?section=${section.id}`} aria-current={active === section.id ? "page" : undefined} key={section.id}>{section.label}</Link>)}
    </nav>
  );
}

function ProvenanceBadge({ value }: { value: "observed" | "inferred" | "stated" }) {
  return <span className={`stylist-provenance is-${value}`}>{value}</span>;
}

function EvidenceLinks({ evidence, itemById }: { evidence: StyleRecommendation["evidence"]; itemById: Map<string, WardrobeItem> }) {
  return (
    <ul className="stylist-evidence-list">
      {evidence.map((entry, index) => (
        <li key={`${entry.outfitObservationId ?? entry.itemId}-${index}`}>
          <ProvenanceBadge value={entry.provenance} />
          <span>{entry.claim}</span>
          {entry.itemId && itemById.has(entry.itemId) ? <Link href={`/wardrobe/${entry.itemId}`} aria-label={`Open ${itemById.get(entry.itemId)?.name}`}><ArrowRight size={13} aria-hidden="true" /></Link> : null}
        </li>
      ))}
    </ul>
  );
}

function SourcePhoto({ observation, priority = false, annotation }: { observation: OutfitObservation; priority?: boolean; annotation?: string }) {
  const photo = observation.evidencePhotos[0];
  if (!photo) return null;
  return (
    <figure className="stylist-source-card">
      <a href={photo.url} target="_blank" rel="noreferrer" aria-label="Open full source photograph">
        <ResponsiveWardrobeImage src={photo.url} alt={`Source outfit from ${new Date(observation.capturedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} />
      </a>
      {annotation ? <span className="stylist-annotation">{annotation}</span> : null}
      <figcaption>
        <span>Source outfit · {observation.context.label ?? observation.context.occasion}</span>
        <time dateTime={observation.capturedAt}>{new Date(observation.capturedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time>
      </figcaption>
    </figure>
  );
}

function GarmentStrip({ itemIds, itemById, label = "Owned items" }: { itemIds: string[]; itemById: Map<string, WardrobeItem>; label?: string }) {
  const unique = [...new Set(itemIds)].flatMap((id) => itemById.has(id) ? [itemById.get(id)!] : []);
  return (
    <div className="stylist-garment-strip" aria-label={label}>
      {unique.map((item) => (
        <Link href={`/wardrobe/${item.id}`} key={item.id}>
          <span><ResponsiveWardrobeImage src={item.image} alt="" /></span>
          <strong>{item.name}</strong>
        </Link>
      ))}
    </div>
  );
}

function RecommendationMeta({ recommendation }: { recommendation: StyleRecommendation }) {
  return <p className="stylist-rec-meta"><span>{recommendation.confidence} confidence</span><span>{recommendation.novelty}</span><span>{recommendation.kind}</span></p>;
}

function GeneratedRecommendationVisual({ recommendation, priority = false, compact = false }: { recommendation: StyleRecommendation; priority?: boolean; compact?: boolean }) {
  const visual = recommendation.generatedVisual;
  if (!visual) return null;
  return (
    <figure className={`stylist-generated-visual${compact ? " is-compact" : ""}`}>
      <div>
        <span className="stylist-generated-label"><Sparkles size={13} aria-hidden="true" />Generated preview</span>
        <ResponsiveWardrobeImage src={visual.src} alt={`${visual.label}. Generated illustration of ${recommendation.title}.`} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} optimized={false} />
      </div>
      <figcaption><strong>{visual.label}</strong><span>Illustration · {visual.version}</span></figcaption>
    </figure>
  );
}

function Briefing({ ownerName, edition, recommendations, observations, itemById, outcomes, legacyEditions }: Omit<Props, "section" | "wardrobe" | "allWardrobe" | "requestedOutfit"> & { itemById: Map<string, WardrobeItem> }) {
  const briefing = recommendations.filter((recommendation) => recommendation.surface === "briefing");
  const hero = briefing.find((recommendation) => recommendation.briefingSlot === "wear-next") ?? briefing[0];
  const heroObservations = (hero?.evidence ?? []).flatMap((entry) => entry.outfitObservationId ? [observations.find((observation) => observation.id === entry.outfitObservationId)] : []).filter(Boolean) as OutfitObservation[];
  return (
    <div className="stylist-briefing">
      <aside className="stylist-profile-rail">
        <p className="stylist-kicker">Your style now</p>
        <div className="stylist-word-stack">
          {edition.styleWords.map((word) => <div key={word.word}><span>{word.word}</span><CheckCircle2 size={18} aria-label={word.status} /></div>)}
        </div>
        <div className="stylist-coverage">
          <p className="stylist-kicker">Evidence coverage</p>
          <strong>{edition.coverage.years.length ? edition.coverage.years.join("–") : "No observations yet"}</strong>
          <span>{edition.coverage.observations} outfit sessions</span>
          <span>{edition.coverage.completeOutfits} complete enough for formulas</span>
          <div className="stylist-coverage-bar" aria-label={`${edition.coverage.completeOutfits} complete outfits from ${edition.coverage.observations} observations`}><span style={{ width: `${edition.coverage.observations ? edition.coverage.completeOutfits / edition.coverage.observations * 100 : 0}%` }} /></div>
        </div>
        <div className="stylist-legend"><span><i className="is-observed" />Observed</span><span><i className="is-inferred" />Inferred</span><span><i className="is-stated" />Stated</span></div>
        <div className="stylist-history-rail">
          <p className="stylist-kicker">Version history</p>
          <div><i /><p><strong>Current</strong><span>{edition.createdAt}</span></p></div>
          {legacyEditions.map((legacy) => <Link href={legacy.href} key={legacy.id}><i /><p><strong>{legacy.label}</strong><span>{legacy.date}</span></p></Link>)}
        </div>
      </aside>

      <section className="stylist-memo">
        <p className="stylist-kicker">Stylist memo</p>
        <h1>{ownerName}, {edition.title.toLowerCase()}</h1>
        <p className="stylist-memo-lede">{edition.thesis}</p>
        {hero ? <GeneratedRecommendationVisual recommendation={hero} priority /> : <p>No briefing has been prepared yet.</p>}
        <div className="stylist-source-pair">
          {heroObservations.slice(0, 2).map((observation, index) => <SourcePhoto observation={observation} priority={index === 0} annotation={index === 0 ? "This is the evidence, not a moodboard." : "The pattern repeats across contexts."} key={observation.id} />)}
        </div>
        <div className="stylist-briefing-actions">
          {briefing.map((recommendation, index) => (
            <article key={recommendation.id}>
              <span className="stylist-action-number">{index + 1}</span>
              <div><p className="stylist-kicker">{recommendation.briefingSlot?.replaceAll("-", " ")}</p><h2>{recommendation.title}</h2><p>{recommendation.directAdvice}</p><RecommendationMeta recommendation={recommendation} /></div>
              <Link href={recommendation.briefingSlot === "small-change" ? "/style?section=outfit-clinic" : recommendation.briefingSlot === "wardrobe-decision" ? "/style?section=wardrobe-edit" : "/style?section=briefing"} aria-label={`Open ${recommendation.title}`}><ArrowRight aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <aside className="stylist-recommendation-rail">
        <p className="stylist-kicker">My recommendation</p>
        <span className="stylist-rec-mode">{hero.novelty}</span>
        <h2>{hero.title}</h2>
        <p className="stylist-recommendation-direct">{hero.directAdvice}</p>
        <p className="stylist-kicker">Owned items that work</p>
        <GarmentStrip itemIds={hero.itemIds} itemById={itemById} />
        <div className="stylist-confidence"><span>Confidence</span><strong>{hero.confidence}</strong><i><b style={{ width: hero.confidence === "high" ? "88%" : hero.confidence === "medium" ? "68%" : "42%" }} /></i></div>
        <p className="stylist-kicker">Why it works</p>
        <p>{hero.whyItMatters}</p>
        <RecommendationOutcomeControls recommendationId={hero.id} initialStatus={outcomeFor(outcomes, hero.id)} />
        <Link className="stylist-primary-action" href="/style?section=outfit-clinic">Open outfit clinic <ArrowRight aria-hidden="true" /></Link>
      </aside>
    </div>
  );
}

function SignalCard({ signal, itemById }: { signal: StyleSignal; itemById: Map<string, WardrobeItem> }) {
  return <article className="stylist-signal-card"><p className="stylist-kicker">{signal.confidence}</p><h3>{signal.title}</h3><p>{signal.summary}</p><EvidenceLinks evidence={signal.evidence} itemById={itemById} /></article>;
}

function YourStyle({ edition, recommendations, itemById, legacyEditions }: { edition: StyleProfileEdition; recommendations: StyleRecommendation[]; itemById: Map<string, WardrobeItem>; legacyEditions: Props["legacyEditions"] }) {
  const visualThesis = [recommendations.find((recommendation) => recommendation.surface === "briefing" && recommendation.generatedVisual), recommendations.find((recommendation) => recommendation.surface === "edit" && recommendation.generatedVisual)].filter(Boolean) as StyleRecommendation[];
  return (
    <div className="stylist-editorial-page">
      <header className="stylist-editorial-hero">
        <div><p className="stylist-kicker">Style DNA · current edition</p><h1>{edition.title}</h1></div>
        <div><p>{edition.thesis}</p><blockquote>{edition.creativeTension}</blockquote></div>
      </header>
      <section className="stylist-visual-thesis" aria-label="Generated visual thesis">
        {visualThesis.map((recommendation) => <GeneratedRecommendationVisual recommendation={recommendation} key={recommendation.id} />)}
        <p><Sparkles size={14} aria-hidden="true" /><span>These previews visualize validated advice. Source photographs—not generated scenes—remain the evidence behind the profile.</span></p>
      </section>
      <section className="stylist-style-words" aria-labelledby="words-heading"><div><p className="stylist-kicker">Candidate three words</p><h2 id="words-heading">Memorable, but not a cage.</h2></div>{edition.styleWords.map((word) => <article key={word.word}><span>{word.word}</span><p>{word.explanation}</p><small>{word.status}</small></article>)}</section>
      <section className="stylist-section-block"><header><p className="stylist-kicker">Signature codes</p><h2>What actually makes the outfits yours</h2></header><div className="stylist-signal-grid">{edition.signatureCodes.map((signal) => <SignalCard signal={signal} itemById={itemById} key={signal.title} />)}</div></section>
      <section className="stylist-section-block"><header><p className="stylist-kicker">Default formulas</p><h2>The structures worth repeating</h2></header><div className="stylist-signal-grid is-two">{edition.defaultFormulas.map((signal) => <SignalCard signal={signal} itemById={itemById} key={signal.title} />)}</div></section>
      <section className="stylist-section-block"><header><p className="stylist-kicker">Construction</p><h2>Line, colour and texture</h2></header><div className="stylist-signal-grid">{[edition.silhouette, edition.colourBehaviour, edition.patternAndTexture].map((signal) => <SignalCard signal={signal} itemById={itemById} key={signal.title} />)}</div></section>
      <section className="stylist-section-block"><header><p className="stylist-kicker">Trajectory</p><h2>What changed—and what the camera may be biasing</h2></header><div className="stylist-timeline">{edition.trajectory.map((entry) => <article key={entry.year}><time>{entry.year}</time><div><p>{entry.summary}</p><EvidenceLinks evidence={entry.evidence} itemById={itemById} /></div></article>)}</div></section>
      <section className="stylist-edition-diff"><div><p className="stylist-kicker">Why this edition changed</p><h2>Evidence, not a taste reset.</h2></div><ul>{edition.changedBecause.map((change) => <li key={change}>{change}</li>)}</ul><div className="stylist-archive-links">{legacyEditions.map((legacy) => <Link href={legacy.href} key={legacy.id}>{legacy.label}<span>{legacy.date}</span><ArrowRight size={15} aria-hidden="true" /></Link>)}</div></section>
    </div>
  );
}

function WeeklyReview({ ownerName, ownerId, weeklyEdition, recommendations, observations, itemById, outcomes }: {
  ownerName: string;
  ownerId: string;
  weeklyEdition?: WeeklyStyleEdition;
  recommendations: StyleRecommendation[];
  observations: OutfitObservation[];
  itemById: Map<string, WardrobeItem>;
  outcomes: RecommendationOutcome[];
}) {
  const weekly = recommendations.filter((recommendation) => recommendation.surface === "weekly" && recommendation.createdAt === weeklyEdition?.createdAt);
  if (!weeklyEdition || !weeklyEdition.weeklyReview[ownerId] || weekly.length === 0) return <div className="stylist-weekly"><p>No weekly style review is available yet.</p></div>;
  const review = weeklyEdition.weeklyReview[ownerId];
  return (
    <div className="stylist-weekly">
      <header className="stylist-weekly-hero">
        <div>
          <p className="stylist-kicker">Weekly field notes · {new Date(`${weeklyEdition.createdAt}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          <h1>{ownerName}&apos;s week, edited.</h1>
        </div>
        <p>{weeklyEdition.direction[ownerId]}</p>
      </header>
      <section className="stylist-weekly-summary" aria-label="Weekly review summary">
        <article><span>{review.outfitsReviewed}</span><p>outfits reviewed</p></article>
        <article><p className="stylist-kicker">Strongest</p><strong>{review.strongest}</strong></article>
        <article><p className="stylist-kicker">Missed opportunity</p><strong>{review.missedOpportunity}</strong></article>
        <article><p className="stylist-kicker">Smallest effective edit</p><strong>{review.smallestEdit}</strong></article>
      </section>
      <div className="stylist-weekly-list">
        {weekly.map((recommendation, index) => {
          const sourceId = recommendation.evidence.find((entry) => entry.outfitObservationId)?.outfitObservationId;
          const observation = observations.find((candidate) => candidate.id === sourceId);
          return (
            <article key={recommendation.id}>
              <header><p className="stylist-kicker">0{index + 1} · This week&apos;s edit</p><h2>{recommendation.title}</h2><RecommendationMeta recommendation={recommendation} /></header>
              <div className="stylist-weekly-evidence">
                {observation ? <SourcePhoto observation={observation} priority={index === 0} annotation="The observed outfit." /> : null}
                <GeneratedRecommendationVisual recommendation={recommendation} priority={index === 0} />
              </div>
              <div className="stylist-weekly-advice">
                <div><p className="stylist-kicker">What I see</p><p>{recommendation.whatISee}</p></div>
                <div><p className="stylist-kicker">Do this</p><p>{recommendation.directAdvice}</p></div>
                <div><p className="stylist-kicker">Why it works</p><p>{recommendation.whyItMatters}</p></div>
              </div>
              <GarmentStrip itemIds={recommendation.itemIds} itemById={itemById} label="Owned items in this recommendation" />
              <EvidenceLinks evidence={recommendation.evidence} itemById={itemById} />
              <RecommendationOutcomeControls recommendationId={recommendation.id} initialStatus={outcomeFor(outcomes, recommendation.id)} />
            </article>
          );
        })}
      </div>
      <section className="stylist-weekly-changes"><p className="stylist-kicker">What changed this edition</p><ul>{weeklyEdition.changes.map((change) => <li key={change}>{change}</li>)}</ul></section>
    </div>
  );
}

function OutfitClinic({ recommendations, observations, itemById, outcomes, requestedOutfit }: { recommendations: StyleRecommendation[]; observations: OutfitObservation[]; itemById: Map<string, WardrobeItem>; outcomes: RecommendationOutcome[]; requestedOutfit?: string }) {
  const clinic = recommendations.filter((recommendation) => recommendation.surface === "clinic");
  const fallback = clinic.find((recommendation) => recommendation.novelty === "familiar")?.sourceObservationId;
  const observation = observations.find((candidate) => candidate.id === requestedOutfit) ?? observations.find((candidate) => candidate.id === fallback);
  if (!observation) return <p>No outfit clinic evidence is available.</p>;
  return (
    <div className="stylist-clinic">
      <header className="stylist-page-heading"><div><p className="stylist-kicker">Outfit clinic</p><h1>One real outfit. The smallest useful change first.</h1></div><p>Nothing outside the visible frame is critiqued. Generated imagery is not evidence.</p></header>
      <div className="stylist-clinic-grid">
        <div><SourcePhoto observation={observation} priority annotation="Source-led diagnosis." /><div className="stylist-verified-items"><p className="stylist-kicker">Verified in frame</p><GarmentStrip itemIds={observation.observedItems.map((entry) => entry.itemId)} itemById={itemById} /></div></div>
        <div className="stylist-clinic-analysis">
          <p className="stylist-kicker">What works</p>
          <h2>{clinic[0]?.whatISee.split(".")[0]}.</h2>
          <p>{clinic[0]?.principle}</p>
          <div className="stylist-clinic-versions">
            {clinic.map((recommendation) => (
              <article key={recommendation.id}>
                <GeneratedRecommendationVisual recommendation={recommendation} compact />
                <header><span>{recommendation.novelty}</span><strong>{recommendation.confidence}</strong></header>
                <h3>{recommendation.title}</h3><p>{recommendation.directAdvice}</p>
                <dl><div><dt>Do this</dt><dd>{recommendation.action}</dd></div><div><dt>What changes</dt><dd>{recommendation.expectedEffect}</dd></div></dl>
                <GarmentStrip itemIds={recommendation.itemIds} itemById={itemById} label={`${recommendation.novelty} outfit items`} />
                <RecommendationOutcomeControls recommendationId={recommendation.id} initialStatus={outcomeFor(outcomes, recommendation.id)} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const editLabels: Record<NonNullable<StyleRecommendation["editGroup"]>, string> = { workhorse: "Workhorses to repeat", expressive: "Expressive pieces to use", restyle: "Re-style", "alter-repair": "Alter or repair", uncertain: "Needs your input", "move-on": "Move on" };

function WardrobeEdit({ recommendations, itemById, outcomes }: { recommendations: StyleRecommendation[]; itemById: Map<string, WardrobeItem>; outcomes: RecommendationOutcome[] }) {
  const edit = recommendations.filter((recommendation) => recommendation.surface === "edit");
  return (
    <div className="stylist-edit-page">
      <header className="stylist-page-heading"><div><p className="stylist-kicker">Wardrobe edit</p><h1>Use more. Test honestly. Retire nothing on a weak case.</h1></div><p>Low photo frequency is a question, not a verdict. Comfort, fit, condition and role still matter.</p></header>
      <div className="stylist-edit-list">
        {edit.map((recommendation) => <article key={recommendation.id}><header><p className="stylist-kicker">{editLabels[recommendation.editGroup!]}</p><h2>{recommendation.title}</h2><RecommendationMeta recommendation={recommendation} /></header><div><GeneratedRecommendationVisual recommendation={recommendation} /><p className="stylist-rec-lede">{recommendation.directAdvice}</p><GarmentStrip itemIds={recommendation.itemIds} itemById={itemById} /><details><summary>Evidence and alternatives</summary><EvidenceLinks evidence={recommendation.evidence} itemById={itemById} /><ul>{recommendation.alternatives.map((alternative) => <li key={alternative}>{alternative}</li>)}</ul></details><RecommendationOutcomeControls recommendationId={recommendation.id} initialStatus={outcomeFor(outcomes, recommendation.id)} /></div></article>)}
      </div>
    </div>
  );
}

function Gaps({ recommendations, itemById, outcomes }: { recommendations: StyleRecommendation[]; itemById: Map<string, WardrobeItem>; outcomes: RecommendationOutcome[] }) {
  const gaps = recommendations.filter((recommendation) => recommendation.surface === "gap");
  return (
    <div className="stylist-gaps-page">
      <header className="stylist-page-heading"><div><p className="stylist-kicker">Strategic gaps</p><h1>Buy the bridge, not another version of what you own.</h1></div><p>Every proposal must unlock three named outfits, survive a cheaper test and carry a dated euro price.</p></header>
      <div className="stylist-gap-list">
        {gaps.map((recommendation, index) => <article key={recommendation.id}><div className="stylist-gap-visual"><span className="stylist-generated-label"><Sparkles size={13} aria-hidden="true" />Generated preview</span>{recommendation.purchase?.generatedImage ? <ResponsiveWardrobeImage src={recommendation.purchase.generatedImage} alt={`${recommendation.title} generated product preview`} /> : null}</div><div className="stylist-gap-content"><p className="stylist-kicker">0{index + 1} · {recommendation.novelty}</p><h2>{recommendation.title}</h2><p className="stylist-gap-direct">{recommendation.directAdvice}</p><div className="stylist-price"><span>Target</span><strong>€{recommendation.purchase?.targetPriceEur.min}–€{recommendation.purchase?.targetPriceEur.max}</strong><small>Research dates are recorded with each source</small></div><p className="stylist-kicker">Exact specification</p><p>{recommendation.purchase?.specification}</p><p className="stylist-kicker">Three owned-item looks it unlocks</p><div className="stylist-unlocked-looks">{recommendation.purchase?.unlockedLooks.map((look) => <div key={look.title}><strong>{look.title}</strong><GarmentStrip itemIds={look.itemIds} itemById={itemById} label={look.title} /></div>)}</div><details><summary>Research examples and lower-cost test</summary><div className="stylist-research-links">{recommendation.purchase?.examples.map((example) => <a href={example.url} target="_blank" rel="noreferrer" key={example.url}><span>{example.label}<small>{example.match.replaceAll("-", " ")}</small></span><strong>{example.price}</strong><ArrowUpRight size={14} aria-hidden="true" /></a>)}</div></details><RecommendationOutcomeControls recommendationId={recommendation.id} initialStatus={outcomeFor(outcomes, recommendation.id)} /></div></article>)}
      </div>
    </div>
  );
}

export function StyleAssistantView(props: Props) {
  const itemById = new Map(props.allWardrobe.map((item) => [item.id, item]));
  return (
    <div className="style-assistant">
      <SectionNavigation active={props.section} />
      {props.section === "briefing" ? <Briefing {...props} itemById={itemById} /> : null}
      {props.section === "weekly" ? <WeeklyReview ownerName={props.ownerName} ownerId={props.edition.ownerId} weeklyEdition={props.weeklyEdition} recommendations={props.recommendations} observations={props.observations} itemById={itemById} outcomes={props.outcomes} /> : null}
      {props.section === "your-style" ? <YourStyle edition={props.edition} recommendations={props.recommendations} itemById={itemById} legacyEditions={props.legacyEditions} /> : null}
      {props.section === "outfit-clinic" ? <OutfitClinic recommendations={props.recommendations} observations={props.observations} itemById={itemById} outcomes={props.outcomes} requestedOutfit={props.requestedOutfit} /> : null}
      {props.section === "wardrobe-edit" ? <WardrobeEdit recommendations={props.recommendations} itemById={itemById} outcomes={props.outcomes} /> : null}
      {props.section === "gaps" ? <Gaps recommendations={props.recommendations} itemById={itemById} outcomes={props.outcomes} /> : null}
      {props.section === "ask" ? <StyleAsk ownerName={props.ownerName} recommendations={props.recommendations} wardrobe={props.wardrobe} /> : null}
      <footer className="stylist-method-note"><Info size={15} aria-hidden="true" /><p>Observed source photographs support history. Inference is labelled. Generated previews illustrate validated recommendations and never feed back into wear counts or Style DNA. <Link href="/style?section=your-style">Read the evidence model</Link>.</p><span><Clock3 size={13} aria-hidden="true" />Edition {props.edition.createdAt}</span></footer>
    </div>
  );
}
