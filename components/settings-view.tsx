"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WardrobeProfile } from "@/lib/types";

export function SettingsView({ profile }: { profile: WardrobeProfile }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [photosName, setPhotosName] = useState(profile.photosName);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault(); setPending(true); setMessage("");
    try {
      const response = await fetch("/api/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, photosName }) });
      if (!response.ok) throw new Error("Settings could not be saved. Check the name and try again.");
      setMessage("Profile saved on this computer."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Settings could not be saved."); }
    finally { setPending(false); }
  }
  return <>
    <section className="page-heading"><div className="page-heading-copy"><p className="eyebrow">Workspace</p><h1>Make the catalogue yours.</h1><p>Your profile stays in this project's private local data directory.</p></div></section>
    <section className="panel" style={{ maxWidth: 820 }}><form className="panel-body" onSubmit={save}><div className="settings-section"><h2>Your profile</h2><div className="form-grid"><div className="field"><label htmlFor="profile-name">Display name</label><input id="profile-name" className="input" value={name} maxLength={80} required onChange={(event) => setName(event.target.value)} /></div><div className="field"><label htmlFor="photos-name">Photos search name</label><input id="photos-name" className="input" value={photosName} maxLength={120} onChange={(event) => setPhotosName(event.target.value)} /><span className="field-help">A local Apple Photos search can match names, captions or other metadata. Review its results before identifying clothes.</span></div></div></div>
    <div className="settings-section"><h2>Photos and optional image generation</h2><p>Photos discovery is optional and must be enabled locally. Imports queue evidence for review; they do not automatically identify clothing.</p><p>Browsing needs no API key. If you configure a key in .env.local, an explicit image-generation request sends the item's text description to OpenAI and may incur a charge. This app does not automatically send source photos or redact faces.</p></div>
    <button className="button button-primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button><p role="status">{message}</p></form></section>
  </>;
}
