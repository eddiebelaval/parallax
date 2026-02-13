import type { SoloMemory } from '@/types/database'
import type { SoloChatMessage } from '@/hooks/useSoloChat'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Build a self-contained HTML export of a solo session.
 *
 * Includes inline CSS with Ember design tokens + Google Fonts import.
 * No external dependencies — works offline after download.
 */
export function buildExportHtml(
  messages: SoloChatMessage[],
  insights: SoloMemory | null,
  roomCode: string,
): string {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const messagesHtml = messages
    .map((msg) => {
      const isParallax = msg.sender === 'mediator'
      const label = isParallax ? 'Parallax' : 'You'
      const borderColor = isParallax ? '#6aab8e' : '#d4a040'
      const bgColor = isParallax ? 'rgba(106,171,142,0.05)' : 'rgba(212,160,64,0.05)'
      return `
      <div style="padding:12px 16px;border-left:2px solid ${borderColor};background:${bgColor};margin-bottom:12px;">
        <p style="font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#7a6c58;margin:0 0 6px 0;">${label}</p>
        <p style="font-family:'Source Sans 3',sans-serif;font-size:14px;line-height:1.6;color:#c9b9a3;margin:0;white-space:pre-wrap;">${escapeHtml(msg.content)}</p>
      </div>`
    })
    .join('\n')

  let insightsHtml = ''
  if (insights && insights.identity?.name) {
    const sections: string[] = []

    if (insights.currentSituation) {
      sections.push(`
      <div style="margin-bottom:20px;">
        <p style="font-family:'IBM Plex Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.15em;color:#7a6c58;margin:0 0 8px 0;">Situation</p>
        <p style="font-family:'Source Sans 3',sans-serif;font-size:13px;color:#c9b9a3;margin:0;">${escapeHtml(insights.currentSituation)}</p>
      </div>`)
    }

    if (insights.themes.length > 0) {
      const tags = insights.themes
        .map((t) => `<span style="display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;padding:2px 8px;border:1px solid #3a2e22;color:#7a6c58;margin:0 4px 4px 0;">${escapeHtml(t)}</span>`)
        .join('')
      sections.push(`
      <div style="margin-bottom:20px;">
        <p style="font-family:'IBM Plex Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.15em;color:#7a6c58;margin:0 0 8px 0;">Themes</p>
        <div>${tags}</div>
      </div>`)
    }

    if (insights.patterns.length > 0) {
      const items = insights.patterns
        .map((p) => `<div style="padding:6px 0 6px 12px;border-left:2px solid #d4a040;font-family:'Source Sans 3',sans-serif;font-size:13px;color:#c9b9a3;margin-bottom:6px;">${escapeHtml(p)}</div>`)
        .join('')
      sections.push(`
      <div style="margin-bottom:20px;">
        <p style="font-family:'IBM Plex Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.15em;color:#7a6c58;margin:0 0 8px 0;">Patterns</p>
        ${items}
      </div>`)
    }

    if (insights.actionItems.length > 0) {
      const items = insights.actionItems
        .map((a) => {
          const done = a.status === 'completed'
          return `<div style="padding:6px 0;font-family:'Source Sans 3',sans-serif;font-size:13px;color:${done ? '#7a6c58' : '#c9b9a3'};${done ? 'text-decoration:line-through;' : ''}">${done ? '[x]' : '[ ]'} ${escapeHtml(a.text)}</div>`
        })
        .join('')
      sections.push(`
      <div style="margin-bottom:20px;">
        <p style="font-family:'IBM Plex Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.15em;color:#7a6c58;margin:0 0 8px 0;">Action Items</p>
        ${items}
      </div>`)
    }

    if (sections.length > 0) {
      insightsHtml = `
      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #3a2e22;">
        <h2 style="font-family:'Source Serif 4',serif;font-size:18px;font-weight:400;letter-spacing:-0.02em;color:#ebe1d4;margin:0 0 20px 0;">Insights</h2>
        ${sections.join('\n')}
      </div>`
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parallax Session ${escapeHtml(roomCode)} - ${date}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400&family=Source+Sans+3:wght@400&family=IBM+Plex+Mono:wght@400&display=swap');
    body {
      margin: 0;
      padding: 40px 20px;
      background: #0f0b08;
      color: #c9b9a3;
      font-family: 'Source Sans 3', sans-serif;
    }
    .container {
      max-width: 720px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="margin-bottom:32px;">
      <p style="font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#7a6c58;margin:0 0 8px 0;">Parallax Solo Session</p>
      <h1 style="font-family:'Source Serif 4',serif;font-size:28px;font-weight:400;letter-spacing:-0.02em;color:#ebe1d4;margin:0 0 4px 0;">${escapeHtml(roomCode)}</h1>
      <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#7a6c58;margin:0;">${date}</p>
    </div>
    ${messagesHtml}
    ${insightsHtml}
    <div style="margin-top:40px;padding-top:16px;border-top:1px solid #3a2e22;text-align:center;">
      <p style="font-family:'IBM Plex Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:0.15em;color:#7a6c58;">Generated by Parallax</p>
    </div>
  </div>
</body>
</html>`
}
