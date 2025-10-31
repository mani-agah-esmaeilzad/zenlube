type StatItem = {
  label: string;
  value: string;
  description?: string;
};

type StatsBarProps = {
  stats: StatItem[];
};

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-md shadow-slate-500/10 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {stat.label}
          </span>
          <span className="text-2xl font-semibold text-slate-900">{stat.value}</span>
          {stat.description && (
            <span className="text-xs text-slate-500">{stat.description}</span>
          )}
        </div>
      ))}
    </div>
  );
}
