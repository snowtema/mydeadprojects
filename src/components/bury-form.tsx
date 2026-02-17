"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/actions/projects";
import { type Project } from "@/lib/db/schema";
import { cn, formatDateRange } from "@/lib/utils";
import { FuneralAnimation } from "@/components/funeral-animation";

const CAUSES_OF_DEATH = [
  { label: "Lost motivation", emoji: "😴" },
  { label: "Scope creep", emoji: "🐙" },
  { label: "Already exists", emoji: "👯" },
  { label: "No users", emoji: "🦗" },
  { label: "Co-founder left", emoji: "🚪" },
  { label: "Shiny new idea", emoji: "✨" },
  { label: "Tech debt killed it", emoji: "💀" },
  { label: "Ran out of money", emoji: "💸" },
  { label: "Life happened", emoji: "🌊" },
];

const EPITAPH_EXAMPLES = [
  "This time it'll be different",
  "Gone but not version-controlled",
  "It worked on my machine",
  "404: Motivation not found",
  "Killed by a shiny new framework",
];

interface BuryFormProps {
  existingProject?: Project;
  username?: string;
}

export function BuryForm({ existingProject, username }: BuryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(existingProject?.name ?? "");
  const [startDate, setStartDate] = useState(
    existingProject?.startDate ?? ""
  );
  const [endDate, setEndDate] = useState(existingProject?.endDate ?? "");
  const [causeOfDeath, setCauseOfDeath] = useState(
    existingProject?.causeOfDeath ?? ""
  );
  const [customCause, setCustomCause] = useState("");
  const [epitaph, setEpitaph] = useState(existingProject?.epitaph ?? "");
  const [description, setDescription] = useState(
    existingProject?.description ?? ""
  );
  const [websiteUrl, setWebsiteUrl] = useState(
    existingProject?.websiteUrl ?? ""
  );
  const [repoUrl, setRepoUrl] = useState(existingProject?.repoUrl ?? "");
  const [techStackInput, setTechStackInput] = useState(
    existingProject?.techStack?.join(", ") ?? ""
  );
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showFuneral, setShowFuneral] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");

  const isCustomCause =
    causeOfDeath !== "" &&
    !CAUSES_OF_DEATH.some((c) => c.label === causeOfDeath);
  const currentYear = new Date().getFullYear().toString();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const finalCause = isCustomCause ? customCause : causeOfDeath;
    const techStack = techStackInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const input = {
      name,
      startDate,
      endDate,
      causeOfDeath: finalCause || causeOfDeath,
      epitaph,
      description: description || undefined,
      websiteUrl: websiteUrl || undefined,
      repoUrl: repoUrl || undefined,
      techStack: techStack.length > 0 ? techStack : undefined,
    };

    if (existingProject) {
      const result = await updateProject(existingProject.id, input);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      router.push("/graveyard");
    } else {
      const result = await createProject(input);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      setCreatedSlug(result.slug ?? "");
      setShowFuneral(true);
    }
  }

  if (showFuneral && username) {
    return (
      <FuneralAnimation
        projectName={name}
        username={username}
        slug={createdSlug}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
      {/* Project Name */}
      <div className="space-y-2">
        <label className="text-xs text-text-dim">Project Name *</label>
        <input
          type="text"
          placeholder="e.g., todo-app-v3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          required
          maxLength={100}
        />
      </div>

      {/* Dates */}
      <div className="space-y-2">
        <label className="text-xs text-text-dim">When did it live?</label>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Started (YYYY)"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
            required
            maxLength={7}
          />
          <input
            type="text"
            placeholder="Died (YYYY)"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
            required
            maxLength={7}
          />
        </div>
        <div className="flex gap-2">
          {["This year", "Last year", "I don't remember"].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                const year =
                  label === "This year"
                    ? currentYear
                    : label === "Last year"
                      ? (parseInt(currentYear) - 1).toString()
                      : currentYear;
                if (!startDate) setStartDate(year);
                setEndDate(year);
              }}
              className="text-[0.6rem] px-2 py-1 bg-bg-card border border-border rounded text-text-muted hover:border-border-hover hover:text-text-dim transition-colors cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cause of Death */}
      <div className="space-y-2">
        <label className="text-xs text-text-dim">Cause of Death *</label>
        <div className="grid grid-cols-3 gap-2">
          {CAUSES_OF_DEATH.map((cause) => (
            <button
              key={cause.label}
              type="button"
              onClick={() => {
                setCauseOfDeath(cause.label);
                setCustomCause("");
              }}
              className={cn(
                "px-3 py-2 text-[0.65rem] border rounded-md transition-all cursor-pointer text-left",
                causeOfDeath === cause.label
                  ? "border-accent bg-bg-subtle text-text"
                  : "border-border bg-bg-card text-text-muted hover:border-border-hover"
              )}
            >
              <span className="mr-1">{cause.emoji}</span> {cause.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Other: type your own..."
          value={isCustomCause ? causeOfDeath : customCause}
          onChange={(e) => {
            setCustomCause(e.target.value);
            setCauseOfDeath(e.target.value);
          }}
          className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          maxLength={100}
        />
      </div>

      {/* Epitaph */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-text-dim">Epitaph *</label>
          <span
            className={cn(
              "text-[0.6rem]",
              epitaph.length > 130 ? "text-red" : "text-text-muted"
            )}
          >
            {epitaph.length}/140
          </span>
        </div>
        <textarea
          placeholder="Rest in peace, dear code..."
          value={epitaph}
          onChange={(e) => setEpitaph(e.target.value)}
          className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors resize-none h-20"
          required
          maxLength={140}
        />
        <p className="text-[0.6rem] font-serif text-text-muted italic">
          e.g. &ldquo;
          {EPITAPH_EXAMPLES[Math.floor(Date.now() / 10000) % EPITAPH_EXAMPLES.length]}
          &rdquo;
        </p>
      </div>

      {/* Optional Details */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-text-muted hover:text-text-dim transition-colors cursor-pointer"
        >
          {showDetails ? "▾" : "▸"} More details (optional)
        </button>

        {showDetails && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-text-dim">Description</label>
              <textarea
                placeholder="What was this project? What did you learn?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors resize-none h-24"
                maxLength={2000}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-dim">Website URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-dim">Repo URL</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-text-dim">
                Tech Stack (comma-separated)
              </label>
              <input
                type="text"
                placeholder="React, Node.js, MongoDB"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                className="w-full py-3 px-4 bg-bg-card border border-border rounded-md text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Live Preview */}
      {name && (
        <div className="space-y-3">
          <div className="text-[0.65rem] text-text-muted uppercase tracking-widest border-t border-border pt-6">
            Preview
          </div>
          <div className="w-40 mx-auto">
            <div className="tombstone-card p-6 border border-border rounded-t-md text-center">
              <div className="tombstone-cross text-text-muted text-lg mb-3">&#10013;</div>
              <div className="text-sm font-medium text-text-dim mb-1">
                {name}
              </div>
              {startDate && endDate && (
                <div className="text-[0.6rem] text-text-muted font-light mb-2">
                  {formatDateRange(startDate, endDate)}
                </div>
              )}
              {epitaph && (
                <div className="text-sm font-serif text-text-dim italic">
                  &ldquo;{epitaph}&rdquo;
                </div>
              )}
              {causeOfDeath && (
                <div className="mt-3 inline-block text-[0.55rem] px-2 py-0.5 bg-bg border border-border rounded text-text-muted">
                  {causeOfDeath}
                </div>
              )}
            </div>
            <div className="tombstone-base mx-[10%] h-2 bg-bg border border-border border-t-0 rounded-b" />
          </div>
        </div>
      )}

      {error && <p className="text-red text-xs">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-4 bg-cta text-bg rounded-md text-sm font-medium hover:bg-cta-hover transition-colors cursor-pointer disabled:opacity-50"
      >
        {submitting
          ? "Burying..."
          : existingProject
            ? "Update Tombstone"
            : "🪦 Bury It"}
      </button>
    </form>
  );
}
