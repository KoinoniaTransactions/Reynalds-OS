type TopBarProps = {
  onRefresh: () => void;
  isRefreshing: boolean;
  hasError: boolean;
};

export function TopBar({
  onRefresh,
  isRefreshing,
  hasError
}: TopBarProps) {
  return (
    <header className="ros-topbar ros-topbar-modern">
      <div className="ros-context-path">
        <span
          aria-hidden="true"
          className={`ros-status-dot ${
            hasError
              ? "ros-status-dot-error"
              : ""
          }`}
        />

        <span>Reynalds OS</span>
        <span aria-hidden="true">/</span>
        <strong>Mission Control</strong>
      </div>

      <button
        aria-label="Refresh dashboard status"
        className="ros-icon-button"
        disabled={isRefreshing}
        title="Refresh dashboard status"
        type="button"
        onClick={onRefresh}
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="16"
          viewBox="0 0 24 24"
          width="16"
        >
          <path
            d="M20 11a8 8 0 1 0-2.34 5.66M20 11V5m0 6h-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </button>
    </header>
  );
}
