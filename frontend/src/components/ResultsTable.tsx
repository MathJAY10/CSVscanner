import React from 'react';

interface ResultsTableProps {
  title: string;
  records: Record<string, unknown>[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ title, records }) => {
  if (!records || records.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-gray-100 text-gray-600">
            0 Record(s)
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
          <p className="text-sm font-medium text-gray-500 mb-1">No records found</p>
          <p className="text-xs text-gray-400 text-center">There are no {title.toLowerCase()} to display for this import.</p>
        </div>
      </div>
    );
  }

  const columns = Object.keys(records[0]);

  const renderValue = (column: string, value: unknown) => {
    if (value === null || value === undefined || value === '') return <span className="text-gray-400">-</span>;
    
    // Status badges styling
    const colLower = column.toLowerCase();
    if (colLower.includes('status') || colLower === 'crm_status') {
      const valStr = String(value).toLowerCase();
      if (valStr.includes('success') || valStr.includes('done') || valStr.includes('good')) {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2EC] text-[#2D735C]">{String(value)}</span>;
      }
      if (valStr.includes('fail') || valStr.includes('skip') || valStr.includes('error')) {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEE2E2] text-[#EF4444]">{String(value)}</span>;
      }
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">{String(value)}</span>;
    }

    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200/60 shadow-sm">
          {records.length} Record(s)
        </span>
      </div>
      
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={`${column}-${index}`}
                    scope="col"
                    className="px-4 py-3 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap border-b border-gray-200/80 bg-gray-50/90"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {records.map((row, rowIndex) => (
                <tr 
                  key={`row-${rowIndex}`}
                  className="bg-white hover:bg-[#F9FAFB] transition-colors group"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={`cell-${rowIndex}-${colIndex}`}
                      className="px-4 py-3 whitespace-nowrap text-[13px] text-gray-600 font-medium"
                    >
                      {renderValue(column, row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
