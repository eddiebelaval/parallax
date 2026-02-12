"use client";

/**
 * HeroPreview — a compact card in the hero section showing a mini Melt loop.
 * Raw text on the left dissolves into NVC translation on the right
 * on a 6-second CSS animation loop. Pure CSS — no Remotion needed.
 */
export function HeroPreview() {
  const rawText = "You never listen to me.";
  const nvcText =
    "When I share something important and don't feel heard, I feel invisible. I need to know my words matter to you.";

  return (
    <div className="hero-preview mt-10 max-w-xl mx-auto">
      <div className="border border-border rounded-sm overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface/50">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
            The Melt
          </span>
          <span className="ml-auto font-mono text-[9px] text-ember-700">
            looping
          </span>
        </div>

        {/* Animation area */}
        <div className="relative px-4 sm:px-6 py-5 min-h-[80px]">
          {/* Raw text — fades in, holds, fades out */}
          <div className="hero-preview-raw">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ember-600 mb-1.5">
              Raw
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              &ldquo;{rawText}&rdquo;
            </p>
          </div>

          {/* NVC translation — fades in after raw fades out */}
          <div className="hero-preview-nvc absolute inset-0 px-4 sm:px-6 py-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-temp-cool mb-1.5">
              Translated
            </p>
            <p className="text-sm text-temp-cool leading-relaxed italic">
              &ldquo;{nvcText}&rdquo;
            </p>
          </div>
        </div>

        {/* Temperature indicator */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-border">
          <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
            <div className="hero-preview-temp-bar h-full rounded-full" />
          </div>
          <span className="font-mono text-[9px] text-ember-600 hero-preview-temp-value">
            0.72
          </span>
        </div>
      </div>
    </div>
  );
}
