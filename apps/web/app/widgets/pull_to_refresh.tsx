import { useState, useCallback } from "react";

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return { isRefreshing, handleRefresh };
}

export function PullToRefresh({
  children,
  onRefresh,
}: {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
}) {
  const { isRefreshing, handleRefresh } = usePullToRefresh(onRefresh);

  return (
    <div
      style={{
        overscrollBehavior: "contain",
        touchAction: "none",
      }}
    >
      {isRefreshing && (
        <div
          style={{
            textAlign: "center",
            padding: "10px",
            backgroundColor: "#f0f0f0",
          }}
        >
          Refreshing...
        </div>
      )}
      <div
        style={{
          minHeight: "100%",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
        onTouchStart={(e) => {
          const target = e.currentTarget;
          if (target.scrollTop === 0) {
            target.dataset.touching = "true";
            target.dataset.startY = e.touches[0].clientY.toString();
          }
        }}
        onTouchMove={(e) => {
          const target = e.currentTarget;
          if (target.dataset.touching === "true") {
            const startY = parseFloat(target.dataset.startY || "0");
            const currentY = e.touches[0].clientY;
            const diff = currentY - startY;

            if (diff > 50 && !isRefreshing) {
              handleRefresh();
            }
          }
        }}
        onTouchEnd={(e) => {
          const target = e.currentTarget;
          target.dataset.touching = "false";
          target.dataset.startY = "0";
        }}
      >
        {children}
      </div>
    </div>
  );
}
