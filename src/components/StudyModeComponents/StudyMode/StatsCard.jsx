const StatsCard = ({ icon: Icon, value, total, unit = "", label, color }) => (
  <div className="bg-surface-elevated rounded-xl shadow-lg p-4 text-center border border-border-muted">
    <Icon className="w-6 h-6 mx-auto mb-2" style={{ color }} />
    <h3 className="text-2xl font-bold text-text-primary mb-1">
      {value}
      {total ? `/${total}` : unit}
    </h3>
    <p className="text-text-muted text-sm">{label}</p>
  </div>
);

export default StatsCard;
