import type { SoloMemory, SessionSummaryData } from '@/types/database'
import type { SoloChatMessage } from '@/hooks/useSoloChat'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/* ─── Shared Styles ─── */

const FONTS_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600&family=Source+Sans+3:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`

const SHARED_CSS = `
  ${FONTS_IMPORT}
  :root {
    --bg: #0f0b08; --surface: #1a1410; --border: #3a2e22;
    --muted: #7a6c58; --text: #c9b9a3; --heading: #ebe1d4;
    --accent: #d4a040; --cool: #6aab8e; --warm: #d4a040;
    --hot: #c45c3c; --success: #6aab8e;
  }
  @media (prefers-color-scheme: light) {
    :root {
      --bg: #f5efe6; --surface: #ebe1d4; --border: #d4c8b8;
      --muted: #8a7c68; --text: #3a2e22; --heading: #1a1410;
      --accent: #b08830; --cool: #4a8b6e; --warm: #b08830;
      --hot: #a44c2c; --success: #4a8b6e;
    }
  }
  * { box-sizing: border-box; }
  body { margin:0; padding:40px 20px; background:var(--bg); color:var(--text); font-family:'Source Sans 3',-apple-system,sans-serif; line-height:1.6; }
  .container { max-width:720px; margin:0 auto; }
  .mono { font-family:'IBM Plex Mono',monospace; }
  .serif { font-family:'Source Serif 4',Georgia,serif; }
  .label { font-family:'IBM Plex Mono',monospace; font-size:9px; text-transform:uppercase; letter-spacing:0.15em; color:var(--muted); margin:0 0 8px 0; }
  .section { margin-bottom:32px; }
  .section-title { font-family:'IBM Plex Mono',monospace; font-size:10px; text-transform:uppercase; letter-spacing:0.15em; color:var(--muted); margin:0 0 12px 0; padding-bottom:8px; border-bottom:1px solid var(--border); }
  .divider { height:1px; background:var(--border); margin:32px 0; }
  .tag { display:inline-block; font-family:'IBM Plex Mono',monospace; font-size:9px; text-transform:uppercase; letter-spacing:0.1em; padding:3px 10px; border:1px solid var(--border); color:var(--muted); margin:0 6px 6px 0; }
  .hero-quote { border-left:3px solid var(--accent); padding:16px 20px; margin-bottom:32px; background:rgba(212,160,64,0.04); }
  .hero-quote p { font-family:'Source Serif 4',Georgia,serif; font-size:18px; line-height:1.7; color:var(--heading); margin:0; }
  .person-card { padding:20px; border:1px solid var(--border); margin-bottom:16px; }
  .person-name { font-family:'IBM Plex Mono',monospace; font-size:12px; text-transform:uppercase; letter-spacing:0.1em; color:var(--accent); margin:0 0 16px 0; }
  .person-field-label { font-family:'IBM Plex Mono',monospace; font-size:9px; text-transform:uppercase; letter-spacing:0.12em; color:var(--muted); margin:0 0 4px 0; }
  .person-field-value { font-size:14px; color:var(--text); margin:0 0 14px 0; line-height:1.6; }
  .strength { color:var(--success); }
  .moment-item { display:flex; align-items:flex-start; gap:10px; margin-bottom:8px; }
  .moment-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); margin-top:7px; flex-shrink:0; }
  .lens-dot { background:var(--cool); }
  .moment-text { font-size:14px; color:var(--text); line-height:1.6; }
  .message { padding:12px 16px; border-left:2px solid var(--border); margin-bottom:12px; }
  .message-parallax { border-left-color:var(--cool); background:rgba(106,171,142,0.04); }
  .message-user { border-left-color:var(--accent); background:rgba(212,160,64,0.04); }
  .message-label { font-family:'IBM Plex Mono',monospace; font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); margin:0 0 6px 0; }
  .message-content { font-size:14px; line-height:1.6; color:var(--text); margin:0; white-space:pre-wrap; }
  .pattern-item { padding:6px 0 6px 12px; border-left:2px solid var(--warm); font-size:13px; color:var(--text); margin-bottom:6px; }
  .action-item { padding:6px 0; font-size:13px; color:var(--text); }
  .action-done { color:var(--muted); text-decoration:line-through; }
  .footer { margin-top:48px; padding-top:16px; border-top:1px solid var(--border); text-align:center; }
  .footer p { font-family:'IBM Plex Mono',monospace; font-size:9px; text-transform:uppercase; letter-spacing:0.15em; color:var(--muted); margin:0; }
  .badge { display:inline-block; font-family:'IBM Plex Mono',monospace; font-size:9px; text-transform:uppercase; letter-spacing:0.1em; padding:3px 10px; border:1px solid var(--cool); color:var(--cool); margin-left:8px; }
  @media print { body{background:white;color:#1a1410;padding:20px;} .hero-quote{background:#f5f0e8;} .person-card{break-inside:avoid;} .message{break-inside:avoid;} }
`

function htmlShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="container">
    ${body}
  </div>
</body>
</html>`
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const MODE_LABELS: Record<string, string> = {
  solo: 'Solo Session',
  in_person: 'In-Person Session',
  remote: 'Remote Session',
}

/* ─── Two-Person Session Summary HTML ─── */

export function buildSessionSummaryHtml(
  summary: SessionSummaryData,
  roomCode: string,
  personAName: string,
  personBName: string,
  mode: 'in_person' | 'remote',
): string {
  const date = formatDate()
  const modeLabel = MODE_LABELS[mode] || 'Session'
  let body = ''

  body += `
    <div style="margin-bottom:32px;">
      <p class="label">${escapeHtml(modeLabel)}</p>
      <h1 class="serif" style="font-size:28px;font-weight:400;letter-spacing:-0.02em;color:var(--heading);margin:0 0 4px 0;">
        ${escapeHtml(roomCode)}
        <span class="badge">${escapeHtml(personAName)} + ${escapeHtml(personBName)}</span>
      </h1>
      <p class="mono" style="font-size:11px;color:var(--muted);margin:0;">${date}</p>
    </div>`

  if (summary.overallInsight) {
    body += `<div class="hero-quote"><p>${escapeHtml(summary.overallInsight)}</p></div>`
  }

  if (summary.temperatureArc) {
    body += `<div class="section"><p class="section-title">Temperature Arc</p><p style="font-size:14px;color:var(--text);margin:0;line-height:1.7;">${escapeHtml(summary.temperatureArc)}</p></div>`
  }

  if (summary.keyMoments.length > 0) {
    const moments = summary.keyMoments.map((m) => `<div class="moment-item"><div class="moment-dot"></div><p class="moment-text">${escapeHtml(m)}</p></div>`).join('\n')
    body += `<div class="section"><p class="section-title">Key Moments</p>${moments}</div>`
  }

  if (summary.lensInsights && summary.lensInsights.length > 0) {
    const lenses = summary.lensInsights.map((l) => `<div class="moment-item"><div class="moment-dot lens-dot"></div><p class="moment-text">${escapeHtml(l)}</p></div>`).join('\n')
    body += `<div class="section"><p class="section-title">Lens Insights</p>${lenses}</div>`
  }

  if (summary.resolutionTrajectory) {
    body += `<div class="section"><p class="section-title">Resolution Trajectory</p><p style="font-size:14px;color:var(--text);margin:0;line-height:1.7;">${escapeHtml(summary.resolutionTrajectory)}</p></div>`
  }

  body += `<div class="divider"></div>`
  body += buildPersonHtml(personAName, summary.personANeeds, summary.personATakeaway, summary.personAStrength)
  body += buildPersonHtml(personBName, summary.personBNeeds, summary.personBTakeaway, summary.personBStrength)

  body += `<div class="footer"><p>Generated by Parallax</p><p style="margin-top:4px;font-size:8px;color:var(--muted);opacity:0.6;">Share with your therapist or keep for personal reflection</p></div>`

  return htmlShell(`Parallax Session ${roomCode} - ${date}`, body)
}

function buildPersonHtml(name: string, needs: string, takeaway: string, strength: string): string {
  return `
    <div class="person-card">
      <p class="person-name">${escapeHtml(name)}</p>
      ${needs ? `<p class="person-field-label">What they needed</p><p class="person-field-value">${escapeHtml(needs)}</p>` : ''}
      ${takeaway ? `<p class="person-field-label">Takeaway</p><p class="person-field-value">${escapeHtml(takeaway)}</p>` : ''}
      ${strength ? `<p class="person-field-label">What they did well</p><p class="person-field-value strength">${escapeHtml(strength)}</p>` : ''}
    </div>`
}

/* ─── Solo Session Export HTML ─── */

export function buildExportHtml(
  messages: SoloChatMessage[],
  insights: SoloMemory | null,
  roomCode: string,
): string {
  const date = formatDate()
  let body = ''

  body += `
    <div style="margin-bottom:32px;">
      <p class="label">Solo Session</p>
      <h1 class="serif" style="font-size:28px;font-weight:400;letter-spacing:-0.02em;color:var(--heading);margin:0 0 4px 0;">${escapeHtml(roomCode)}</h1>
      <p class="mono" style="font-size:11px;color:var(--muted);margin:0;">${date}</p>
    </div>`

  if (insights && (insights.identity?.name || insights.currentSituation || insights.themes?.length)) {
    body += `<div style="margin-bottom:32px;">`

    if (insights.identity?.name) {
      body += `<div class="section"><h2 class="serif" style="font-size:20px;font-weight:400;color:var(--heading);margin:0 0 4px 0;">${escapeHtml(insights.identity.name)}</h2>${insights.identity.bio ? `<p style="font-size:13px;color:var(--muted);margin:4px 0 0 0;">${escapeHtml(insights.identity.bio)}</p>` : ''}${insights.emotionalState ? `<p class="mono" style="font-size:10px;color:var(--warm);margin:8px 0 0 0;">${escapeHtml(insights.emotionalState)}</p>` : ''}</div>`
    }

    if (insights.currentSituation) {
      body += `<div class="section"><p class="section-title">Situation</p><p style="font-size:14px;color:var(--text);margin:0;">${escapeHtml(insights.currentSituation)}</p></div>`
    }

    if (insights.themes && insights.themes.length > 0) {
      body += `<div class="section"><p class="section-title">Themes</p><div>${insights.themes.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div></div>`
    }

    if (insights.patterns && insights.patterns.length > 0) {
      body += `<div class="section"><p class="section-title">Patterns</p>${insights.patterns.map((p) => `<div class="pattern-item">${escapeHtml(p)}</div>`).join('')}</div>`
    }

    if (insights.values && insights.values.length > 0) {
      body += `<div class="section"><p class="section-title">Values</p><div>${insights.values.map((v) => `<span class="tag">${escapeHtml(v)}</span>`).join('')}</div></div>`
    }

    if (insights.strengths && insights.strengths.length > 0) {
      body += `<div class="section"><p class="section-title">Strengths</p><div>${insights.strengths.map((s) => `<span class="tag" style="border-color:var(--cool);color:var(--cool);">${escapeHtml(s)}</span>`).join('')}</div></div>`
    }

    if (insights.actionItems && insights.actionItems.length > 0) {
      const items = insights.actionItems.map((a) => {
        const done = a.status === 'completed'
        return `<div class="action-item${done ? ' action-done' : ''}">${done ? '[x]' : '[ ]'} ${escapeHtml(a.text)}</div>`
      }).join('')
      body += `<div class="section"><p class="section-title">Action Items</p>${items}</div>`
    }

    body += `</div><div class="divider"></div>`
  }

  if (messages.length > 0) {
    body += `<div class="section"><p class="section-title">Conversation</p>`
    body += messages.map((msg) => {
      const isParallax = msg.sender === 'mediator'
      const label = isParallax ? 'Parallax' : 'You'
      const cls = isParallax ? 'message-parallax' : 'message-user'
      return `<div class="message ${cls}"><p class="message-label">${label}</p><p class="message-content">${escapeHtml(msg.content)}</p></div>`
    }).join('\n')
    body += `</div>`
  }

  body += `<div class="footer"><p>Generated by Parallax</p><p style="margin-top:4px;font-size:8px;color:var(--muted);opacity:0.6;">Share with your therapist or keep for personal reflection</p></div>`

  return htmlShell(`Parallax Solo Session ${roomCode} - ${date}`, body)
}
