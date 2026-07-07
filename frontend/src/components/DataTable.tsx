import React from 'react';

interface DataTableProps {
  headers: string[];
  rows: Record<string, any>[];
}

export const DataTable: React.FC<DataTableProps> = ({ headers, rows }) => {
  if (headers.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={`${header}-${index}`}
                  scope="col"
                  className="px-4 py-2 text-left text-[10px] font-bold text-gray-900 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-50"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((row, rowIndex) => (
              <tr 
                key={`row-${rowIndex}`} 
                className="bg-white hover:bg-gray-50 transition-colors"
              >
                {headers.map((header, colIndex) => (
                  <td
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-700"
                  >
                    {row[header] !== undefined && row[header] !== null 
                      ? String(row[header]) 
                      : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-[10px] font-medium text-gray-500 flex justify-between">
        <span>Showing {rows.length} record(s)</span>
      </div>
    </div>
  );
};
