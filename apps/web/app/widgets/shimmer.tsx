export const Shimmer = ({
  width = "full",
  height = "4",
  length = 1,
}: {
  height?: string;
  width?: string;
  length?: number;
}) => {
  return (
    <span className="flex flex-col items-center space-y-6 animate-pulse my-2">
      {Array.from({ length }).map((_, index) => (
        <span
          key={index}
          className={`bg-gray-200 dark:bg-gray-600 rounded h-${height} w-${width}`}
        ></span>
      ))}
    </span>
  );
};
