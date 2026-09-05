import { DevLogForm } from "@/components/dev-logs/dev-log-form";
import { DevLogItem } from "@/components/dev-logs/dev-log-item";
import type { DevLog } from "@/lib/db/schema/dev-logs";

function DevLogList({
  projectId,
  logs,
}: {
  projectId: string;
  logs: DevLog[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <DevLogForm projectId={projectId} />

      {logs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
          No development logs yet. Add your first entry above.
        </p>
      ) : (
        <div className="flex flex-col">
          {logs.map((log) => (
            <DevLogItem key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}

export { DevLogList };
