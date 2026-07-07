type TopBarProps = {
  onRefresh: () => void;
};

export function TopBar({ onRefresh }: TopBarProps) {
  return (
    <header className="ros-topbar">
      <input placeholder="Search objects, transactions, SOPs, commands..." />
      <button onClick={onRefresh}>Refresh</button>
      <button>AI Command</button>
    </header>
  );
}