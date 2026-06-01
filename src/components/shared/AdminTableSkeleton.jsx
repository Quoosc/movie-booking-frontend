export default function AdminTableSkeleton({ columns = 5, rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-white/5">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="py-3 px-4">
              <div
                className="h-3 rounded-full bg-white/10 animate-pulse"
                style={{ width: `${45 + ((i * 3 + j * 7) % 40)}%` }}
              />
              {j === 0 && (
                <div
                  className="mt-2 h-2 rounded-full bg-white/6 animate-pulse"
                  style={{ width: `${30 + ((i * 5 + j) % 25)}%` }}
                />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
