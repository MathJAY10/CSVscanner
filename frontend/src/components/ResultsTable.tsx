import React from 'react';

interface ResultsTableProps {
  title: string;
  records: any[];
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

  const renderValue = (value: any) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="mt-8 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
          {records.length} Record(s)
        </span>
      </div>
      
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto max-h-[400px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={`${column}-${index}`}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-b border-gray-200 shadow-sm"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((row, rowIndex) => (
                <tr 
                  key={`row-${rowIndex}`}
                  className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50 hover:bg-gray-100 transition-colors'}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={`cell-${rowIndex}-${colIndex}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {renderValue(row[column])}
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
