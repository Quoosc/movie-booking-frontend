import { useState, useMemo } from "react";

export function useSortable(items) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const sortedItems = useMemo(() => {
    if (!sortKey || !items?.length) return items;

    return [...items].sort((a, b) => {
      const aVal = getNestedValue(a, sortKey);
      const bVal = getNestedValue(b, sortKey);

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === "string") {
        cmp = aVal.localeCompare(bVal, "vi", { sensitivity: "base" });
      } else if (aVal instanceof Date || (typeof aVal === "string" && !isNaN(Date.parse(aVal)))) {
        cmp = new Date(aVal) - new Date(bVal);
      } else {
        cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return { sortedItems, sortKey, sortDir, toggleSort };
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}
