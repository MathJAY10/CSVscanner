import React from 'react';

interface DataTableProps {
  headers: string[];
  rows: Record<string, unknown>[];
}

export const DataTable: React.FC<DataTableProps> = ({ headers, rows }) => {
  if (headers.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-6 overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={`${header}-${index}`}
                  scope="col"
                  className="px-4 py-3 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b border-gray-200/80 bg-gray-50/90"
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
                className="bg-white hover:bg-[#F9FAFB] transition-colors group cursor-default"
              >
                {headers.map((header, colIndex) => (
                  <td
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="px-4 py-3 whitespace-nowrap text-[13px] text-gray-600 font-medium"
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
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 flex justify-between">
        <span>Showing {rows.length} record(s)</span>
      </div>
    </div>
  );
};
