"use client";

import Link from "next/link";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import type { RecommendationOutcome, StyleRecommendation } from "@/lib/style-assistant-types";
import type { WardrobeItem } from "@/lib/types";

const outcomeLabels: Array<{ value: RecommendationOutcome["status"]; label: string }> = [
  { value: "saved", label: "Save" },
  { value: "tried", label: "Tried" },
  { value: "worked", label: "Worked" },
  { value: "not-for-me", label: "Not for me" },
  { value: "wrong-context", label: "Wrong context" },
];

export function RecommendationOutcomeControls({ recommendationId, initialStatus }: { recommendationId: string; initialStatus?: RecommendationOutcome["status"] }) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  function record(nextStatus: RecommendationOutcome["status"]) {
    startTransition(async () => {
      const response = await fetch("/api/style/outcomes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recommendationId, status: nextStatus }),
      });
      if (response.ok) setStatus(nextStatus);
    });
  }

  return (
    <div className="stylist-outcomes" aria-label="Record how this recommendation went">
      {outcomeLabels.map((option) => (
        <button type="button" aria-pressed={status === option.value} disabled={pending} onClick={() => record(option.value)} key={option.value}>
          {pending && status === option.value ? <LoaderCircle size={13} className="spin" aria-hidden="true" /> : status === option.value ? <Check size={13} aria-hidden="true" /> : null}
          {option.label}
        </button>
      ))}
    </div>
  );
}

const prompts = [
  "What should I wear to a casual dinner?",
  "Make an outfit less bland.",
  "Is the top purchase actually a gap?",
  "Show me how to use an expressive item more.",
];

function chooseRecommendation(question: string, recommendations: StyleRecommendation[]) {
  const value = question.toLowerCase();
  if (/buy|purchase|gap|shop/.test(value)) return recommendations.find((recommendation) => recommendation.surface === "gap");
  if (/bland|small|change|different/.test(value)) return recommendations.find((recommendation) => recommendation.briefingSlot === "small-change");
  if (/neglect|express|bold|more/.test(value)) return recommendations.find((recommendation) => recommendation.editGroup === "expressive");
  if (/coat|shoe|clinic|fix/.test(value)) return recommendations.find((recommendation) => recommendation.surface === "clinic" && recommendation.novelty === "familiar");
  return recommendations.find((recommendation) => recommendation.briefingSlot === "wear-next") ?? recommendations[0];
}

export function StyleAsk({ ownerName, recommendations, wardrobe }: { ownerName: string; recommendations: StyleRecommendation[]; wardrobe: WardrobeItem[] }) {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState("");
  const itemById = useMemo(() => new Map(wardrobe.map((item) => [item.id, item])), [wardrobe]);
  const answer = submitted ? chooseRecommendation(submitted, recommendations) : undefined;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (question.trim()) setSubmitted(question.trim());
  }

  return (
    <div className="stylist-ask-layout">
      <section className="stylist-ask-panel" aria-labelledby="ask-heading">
        <p className="stylist-kicker">Search your saved advice</p>
        <h1 id="ask-heading">Find a saved suggestion for {ownerName}.</h1>
        <form onSubmit={submit}>
          <label htmlFor="stylist-question">What do you need?</label>
          <div className="stylist-ask-input">
            <input id="stylist-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What should I wear to dinner tomorrow?" />
            <button type="submit" aria-label="Ask stylist"><ArrowRight aria-hidden="true" /></button>
          </div>
        </form>
        <div className="stylist-prompt-list" aria-label="Suggested questions">
          {prompts.map((prompt) => <button type="button" onClick={() => setQuestion(prompt)} key={prompt}>{prompt}</button>)}
        </div>
        <p className="stylist-ask-note">This is a keyword lookup of saved recommendations, not a live AI conversation. Prepare new advice with Codex.</p>
      </section>
      <aside className="stylist-answer" aria-live="polite">
        {answer ? (
          <div className="stylist-answer-content" key={submitted}>
            <p className="stylist-kicker">My answer</p>
            <h2>{answer.title}</h2>
            <p className="stylist-answer-direct">{answer.directAdvice}</p>
            <dl>
              <div><dt>Why</dt><dd>{answer.whyItMatters}</dd></div>
              <div><dt>Confidence</dt><dd>{answer.confidence} · {answer.novelty}</dd></div>
            </dl>
            <div className="stylist-answer-items">
              {answer.itemIds.slice(0, 6).flatMap((itemId) => {
                const item = itemById.get(itemId);
                return item ? [<Link href={`/wardrobe/${item.id}`} key={item.id}>{item.name}<ArrowRight size={13} aria-hidden="true" /></Link>] : [];
              })}
            </div>
            {answer.sourceObservationId ? <Link className="stylist-text-link" href={`/style?section=outfit-clinic&outfit=${encodeURIComponent(answer.sourceObservationId)}`}>Open the source outfit <ArrowRight size={14} aria-hidden="true" /></Link> : null}
          </div>
        ) : (
          <div className="stylist-answer-empty"><span>01</span><p>Ask about an occasion, an outfit, a purchase or an item you never wear.</p></div>
        )}
      </aside>
    </div>
  );
}
