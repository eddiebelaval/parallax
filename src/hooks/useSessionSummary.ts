"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { buildSessionSummaryHtml } from "@/lib/export-html";
import type { SessionSummaryData } from "@/types/database";

interface UseSessionSummaryOptions {
  roomCode: string;
  personAName: string;
  personBName: string;
  mode: "remote" | "in_person";
  isCompleted: boolean;
}

interface UseSessionSummaryReturn {
  summaryData: SessionSummaryData | null;
  summaryLoading: boolean;
  handleExportSummary: () => void;
}

/**
 * Fetches session summary on completion and provides an HTML export handler.
 * Shared between RemoteView and XRayGlanceView.
 */
export function useSessionSummary({
  roomCode,
  personAName,
  personBName,
  mode,
  isCompleted,
}: UseSessionSummaryOptions): UseSessionSummaryReturn {
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const summaryFetched = useRef(false);

  useEffect(() => {
    if (!isCompleted || summaryFetched.current) return;
    summaryFetched.current = true;
    setSummaryLoading(true);
    fetch(`/api/sessions/${roomCode}/summary`, { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.summary) setSummaryData(data.summary);
      })
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, [isCompleted, roomCode]);

  const handleExportSummary = useCallback((): void => {
    if (!summaryData) return;
    const html = buildSessionSummaryHtml(
      summaryData,
      roomCode,
      personAName,
      personBName,
      mode,
    );
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parallax-${roomCode.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.html`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, [summaryData, roomCode, personAName, personBName, mode]);

  return { summaryData, summaryLoading, handleExportSummary };
}
