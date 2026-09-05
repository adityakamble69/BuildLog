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
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectReportView({ result }: { result: ProjectReportResult }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground">{result.progressSummary}</p>
      <ReportList title="Accomplishments" items={result.accomplishments} />
      <ReportList title="Possible blockers" items={result.blockers} />
      <ReportList title="Recommended next steps" items={result.nextSteps} />
    </div>
  );
}

export { ProjectReportView };
