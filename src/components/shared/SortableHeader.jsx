export default function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  sortDir,
  onSort,
  className = "",
}) {
  const isActive = sortKey === currentSortKey;

  return (
    <th
      className={`cursor-pointer select-none group transition-colors hover:text-white ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span
          className={`text-[10px] transition-opacity ${
            isActive ? "opacity-100" : "opacity-30 group-hover:opacity-60"
          }`}
        >
          {isActive ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </span>
    </th>
  );
}
