export function SimpleTable({ headers, rows }: { headers: string[]; rows: Array<Array<string | number>> }) {
  return (
    <div className="card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headers.map((head) => (
              <th key={head} style={{ textAlign: "left", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cidx) => (
                <td key={cidx} style={{ padding: "0.65rem 0", borderBottom: "1px solid #efe6db" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
