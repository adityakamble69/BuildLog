"use client";

import * as React from "react";
import { Download, Printer, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectReportResult } from "@/lib/validations/ai";

function ReportList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="flex flex-col gap-1.5 text-sm text-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatReportAsMarkdown(
  result: ProjectReportResult,
  projectName?: string,
  generatedAt?: Date | null
): string {
  const dateStr = generatedAt
    ? generatedAt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const title = projectName
    ? `# ${projectName} — AI Project Report`
    : `# DevTrace AI Project Report`;

  let md = `${title}\n\n*Generated: ${dateStr}*\n\n## Progress Summary\n${result.progressSummary}\n\n`;

  if (result.accomplishments.length > 0) {
    md += `## Accomplishments\n${result.accomplishments.map((a) => `- ${a}`).join("\n")}\n\n`;
  }
  if (result.blockers.length > 0) {
    md += `## Possible Blockers\n${result.blockers.map((b) => `- ${b}`).join("\n")}\n\n`;
  }
  if (result.nextSteps.length > 0) {
    md += `## Recommended Next Steps\n${result.nextSteps.map((s) => `- ${s}`).join("\n")}\n\n`;
  }

  return md;
}

function ProjectReportView({
  result,
  projectName,
  generatedAt,
}: {
  result: ProjectReportResult;
  projectName?: string;
  generatedAt?: Date | null;
}) {
  const [downloaded, setDownloaded] = React.useState(false);

  function handleDownloadMarkdown() {
    const mdContent = formatReportAsMarkdown(result, projectName, generatedAt);
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (projectName || "project")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-");
    link.href = url;
    link.download = `${safeName}-report-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2 border-b border-border/50 pb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownloadMarkdown}
          className="h-7 px-2.5 text-xs"
          title="Download report as Markdown"
        >
          {downloaded ? (
            <Check className="size-3 text-success" />
          ) : (
            <Download className="size-3" />
          )}
          <span>{downloaded ? "Downloaded" : "Export .md"}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="h-7 px-2.5 text-xs"
          title="Print or save as PDF"
        >
          <Printer className="size-3" />
          <span>Print / PDF</span>
        </Button>
      </div>

      <p className="text-sm text-foreground">{result.progressSummary}</p>
      <ReportList title="Accomplishments" items={result.accomplishments} />
      <ReportList title="Possible blockers" items={result.blockers} />
      <ReportList title="Recommended next steps" items={result.nextSteps} />
    </div>
  );
}

export { ProjectReportView, formatReportAsMarkdown };
