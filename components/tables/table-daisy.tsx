type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
};

type TableProps<T> = {
  title?: string;
  columns: Column<T>[];
  data: T[];
};

export default function TableDaisy<T extends Record<string, any>>({
  title,
  columns,
  data,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      {title && <h2 className="p-4 text-lg font-bold">{title}</h2>}

      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>#</th>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>

        {/* body */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th>{rowIndex + 1}</th>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {col.render
                    ? col.render(row[col.accessor as keyof typeof row], row)
                    : row[col.accessor as keyof typeof row]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
