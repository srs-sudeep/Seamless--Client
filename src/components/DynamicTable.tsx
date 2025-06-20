import { Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';
import { DateTimePicker } from '@/components/ui/date-timePicker';
import { DatePicker } from '@/components/ui/datePicker';
import { DateRangePicker } from '@/components/ui/dateRangePicker';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { type FilterConfig } from '@/types';
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import React, { useMemo, useState } from 'react';

type DynamicTableProps = {
  data: Record<string, any>[];
  customRender?: {
    [key: string]: (value: any, row: Record<string, any>) => React.ReactNode;
  };
  loading?: boolean;
  filterConfig?: FilterConfig[];
  className?: string;
  expandableRows?: boolean;
  expandedComponent?: (row: Record<string, any>) => React.ReactNode;
  disableSearch?: boolean;
  onRowClick?: (row: Record<string, any>, index: number) => void;
  headerActions?: React.ReactNode;
  tableHeading?: string;
  rowExpandable?: (row: Record<string, any>) => boolean;
};

type SortDirection = 'asc' | 'desc' | null;

function toSentenceCase(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  data,
  customRender = {},
  loading = false,
  filterConfig = [],
  className = '',
  expandableRows = false,
  expandedComponent,
  disableSearch = false,
  onRowClick,
  headerActions,
  tableHeading,
  rowExpandable,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  // Add sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const headers = data.length ? Object.keys(data[0]).filter(key => !key.startsWith('_')) : [];

  // Handle column sorting
  const handleSort = (column: string) => {
    // If clicking the same column, cycle through: asc -> desc -> null
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      // New column, start with ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    // First filter the data
    let result = data.filter(row => {
      if (
        !disableSearch &&
        searchTerm &&
        !Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
        return false;

      for (const [col, val] of Object.entries(columnFilters)) {
        if (val?.startDate && val?.endDate) {
          const rowDate = new Date(row[col]);
          if (rowDate < val.startDate || rowDate > val.endDate) return false;
        } else if (val instanceof Date) {
          const rowDate = new Date(row[col]);
          if (rowDate.toDateString() !== val.toDateString()) return false;
        } else if (val && String(row[col]).toLowerCase() !== String(val).toLowerCase()) {
          return false;
        }
      }

      return true;
    });

    // Then sort the filtered data
    if (sortColumn && sortDirection) {
      result = [...result].sort((a, b) => {
        // Get values to compare
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        // Handle nulls/undefined
        if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
        if (bVal == null) return sortDirection === 'asc' ? 1 : -1;

        // Handle different types of values
        if (aVal instanceof Date && bVal instanceof Date) {
          return sortDirection === 'asc'
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }

        // Numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // Boolean
        if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
          return sortDirection === 'asc'
            ? aVal === bVal
              ? 0
              : aVal
                ? 1
                : -1
            : aVal === bVal
              ? 0
              : aVal
                ? -1
                : 1;
        }

        // Default to string comparison
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [data, searchTerm, columnFilters, disableSearch, sortColumn, sortDirection]);

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-background p-6 space-y-4 transition-all duration-300">
        {tableHeading && (
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
            {toSentenceCase(tableHeading)}
          </h2>
        )}

        {(!disableSearch || filterConfig.length > 0 || headerActions) && (
          <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
            <div className="flex flex-wrap items-end  md:gap-4">
              {!disableSearch && (
                <div className="flex-1 min-w-full">
                  <Input
                    placeholder="Search across all columns..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 
                             focus:border-blue-500 dark:focus:border-blue-400 
                             focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800
                             transition-all duration-200"
                  />
                </div>
              )}

              {filterConfig.map(filter => {
                switch (filter.type) {
                  case 'dropdown':
                    return (
                      <div key={filter.column} className="min-w-[180px]">
                        <Select
                          onValueChange={val =>
                            setColumnFilters(prev => ({ ...prev, [filter.column]: val }))
                          }
                        >
                          <SelectTrigger
                            className="h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 
                                                   hover:border-gray-300 dark:hover:border-gray-600
                                                   focus:border-blue-500 dark:focus:border-blue-400
                                                   transition-all duration-200"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {columnFilters[filter.column] || `Filter ${filter.column}`}
                            </span>
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                            {filter.options?.map(opt => (
                              <SelectItem
                                key={opt}
                                value={opt}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                              >
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );

                  case 'date':
                    return (
                      <div key={filter.column} className="min-w-[180px]">
                        <DatePicker
                          onChange={val =>
                            setColumnFilters(prev => ({ ...prev, [filter.column]: val }))
                          }
                        />
                      </div>
                    );

                  case 'date-range':
                    return (
                      <div key={filter.column} className="min-w-[250px]">
                        <DateRangePicker
                          onChange={val =>
                            setColumnFilters(prev => ({ ...prev, [filter.column]: val }))
                          }
                        />
                      </div>
                    );

                  case 'datetime':
                    return (
                      <div key={filter.column} className="min-w-[250px]">
                        <DateTimePicker
                          onChange={val =>
                            setColumnFilters(prev => ({ ...prev, [filter.column]: val }))
                          }
                        />
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </div>
            {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
          </div>
        )}

        {(!disableSearch || filterConfig.length > 0) && (
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
        )}

        <div
          className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 
                        bg-white dark:bg-gray-900 transition-all duration-300"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow
                    className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 
                                     hover:from-gray-100 hover:to-gray-150 
                                     border-b border-gray-200 dark:border-gray-700 transition-all duration-200"
                  >
                    {expandableRows && (
                      <TableHead className="w-12 px-4 py-4 text-center">
                        <span className="sr-only">Expand</span>
                      </TableHead>
                    )}
                    {headers.map(key => (
                      <TableHead
                        key={key}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 
                                 uppercase tracking-wider bg-transparent cursor-pointer group"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <div className="opacity-0 group-hover:opacity-70 transition-opacity">
                            {sortColumn === key ? (
                              sortDirection === 'asc' ? (
                                <ArrowUpIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <ArrowDownIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              )
                            ) : (
                              <div className="w-4 h-4 flex flex-col">
                                <ArrowUpIcon className="w-3 h-3 opacity-40" />
                                <ArrowDownIcon className="w-3 h-3 opacity-40" />
                              </div>
                            )}
                          </div>
                          {sortColumn === key && (
                            <div className="ml-1">
                              {sortDirection === 'asc' ? (
                                <ArrowUpIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <ArrowDownIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={headers.length + (expandableRows ? 1 : 0)}
                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <span className="text-2xl">📋</span>
                          </div>
                          <p className="text-sm font-medium">No data found</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {searchTerm || Object.keys(columnFilters).length > 0
                              ? 'Try adjusting your search or filters'
                              : 'No records available'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row, i) => {
                      const canExpand = rowExpandable ? rowExpandable(row) : expandableRows;
                      return (
                        <React.Fragment key={i}>
                          <TableRow
                            className={cn(
                              'group transition-all duration-200 border-b border-gray-100 dark:border-gray-800',
                              i % 2 === 0
                                ? 'bg-white dark:bg-gray-900'
                                : 'bg-gray-50/50 dark:bg-gray-800/30',
                              'light:hover:bg-gradient-to-r light:hover:from-blue-50 hover:to-indigo-50',
                              'hover:shadow-md dark:hover:shadow-gray-900/10',
                              onRowClick && 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                            )}
                            onClick={() => onRowClick && onRowClick(row, i)}
                          >
                            {expandableRows && (
                              <TableCell
                                onClick={e => {
                                  e.stopPropagation();
                                  if (canExpand) toggleRow(i);
                                }}
                                className="px-4 py-4 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 
                                       transition-colors duration-200 rounded-l-lg"
                              >
                                {canExpand ? (
                                  <ChevronDownIcon
                                    className={cn(
                                      'h-4 w-4 transition-all duration-300 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400',
                                      expandedRows[i] ? 'rotate-180' : 'rotate-0'
                                    )}
                                  />
                                ) : null}
                              </TableCell>
                            )}
                            {headers.map((key, keyIndex) => {
                              const value = row[key];
                              const isLastColumn = keyIndex === headers.length - 1;

                              // Highlight column that's being sorted
                              const isActiveSortColumn = sortColumn === key;

                              return (
                                <TableCell
                                  key={key}
                                  className={cn(
                                    'px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium',
                                    isLastColumn && !expandableRows && 'rounded-r-lg',
                                    isActiveSortColumn && 'bg-blue-50/50 dark:bg-blue-900/10'
                                  )}
                                >
                                  {customRender[key] ? (
                                    customRender[key](value, row)
                                  ) : React.isValidElement(value) ? (
                                    value
                                  ) : value instanceof Date ? (
                                    <span className="text-gray-600 dark:text-gray-300">
                                      {value.toLocaleString()}
                                    </span>
                                  ) : typeof value === 'object' && value !== null ? (
                                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                                      {(() => {
                                        try {
                                          return JSON.stringify(value);
                                        } catch {
                                          return '[Object]';
                                        }
                                      })()}
                                    </code>
                                  ) : (
                                    <span className="break-words">{String(value)}</span>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                          {expandableRows && expandedRows[i] && expandedComponent && canExpand && (
                            <TableRow
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 
                                             border-b border-gray-200 dark:border-gray-700"
                            >
                              <TableCell
                                colSpan={headers.length + 1}
                                className="px-6 py-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900
                                       border-l-4 border-blue-500 dark:border-blue-400"
                              >
                                <div className="rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-700">
                                  {expandedComponent(row)}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Table Footer Info */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between px-1 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <span>Showing</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {filteredData.length}
              </span>
              <span>of</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{data.length}</span>
              <span>results</span>
            </div>
            <div className="flex items-center space-x-2">
              {sortColumn && (
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                  Sorted by {sortColumn} ({sortDirection === 'asc' ? 'ascending' : 'descending'})
                </span>
              )}
              {(searchTerm || Object.keys(columnFilters).length > 0) && (
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                  Filtered
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { DynamicTable };
