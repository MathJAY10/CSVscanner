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
    <div className="w-full mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto max-h-[500px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={`${header}-${index}`}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-b border-gray-200 shadow-sm"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr 
                key={`row-${rowIndex}`} 
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50 hover:bg-gray-100 transition-colors'}
              >
                {headers.map((header, colIndex) => (
                  <td
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
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
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between">
        <span>Showing {rows.length} record(s)</span>
      </div>
    </div>
  );
};
