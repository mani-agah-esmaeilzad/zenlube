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
    <div className="grid gap-4 rounded-3xl border border-white/10 bg-black/30 p-6 text-sm text-white/70 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1 rounded-2xl border border-white/5 bg-white/5 p-4">
          <span className="text-xs uppercase tracking-wide text-white/40">
            {stat.label}
          </span>
          <span className="text-2xl font-semibold text-white">{stat.value}</span>
          {stat.description && (
            <span className="text-xs text-white/50">{stat.description}</span>
          )}
        </div>
      ))}
    </div>
  );
}
