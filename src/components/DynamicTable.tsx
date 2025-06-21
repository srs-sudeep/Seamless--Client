import { Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';
import { DateTimePicker } from '@/components/ui/date-timePicker';
import { DatePicker } from '@/components/ui/datePicker';
import { DateRangePicker } from '@/components/ui/dateRangePicker';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  ScrollArea,
  Checkbox,
  Button,
} from '@/components';
import { ChevronDownIcon, ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type FilterConfig } from '@/types';
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
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const headers = data.length ? Object.keys(data[0]).filter(key => !key.startsWith('_')) : [];

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Clear a specific filter
  const clearFilter = (column: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setColumnFilters({});
  };

  // Fixed filter rendering
  const renderFilter = (filter: FilterConfig) => {
    const currentValue = columnFilters[filter.column];

    switch (filter.type) {
      case 'multi-select': {
        const selectedValues = Array.isArray(currentValue) ? currentValue : [];
        return (
          <div key={filter.column} className="min-w-[220px] relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[180px] flex justify-between items-center h-10"
                >
                  <span>
                    {selectedValues.length > 0
                      ? `${selectedValues.length} selected`
                      : `Filter ${filter.column}`}
                  </span>
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <ScrollArea className="h-48">
                  {filter.options?.map(opt => (
                    <div
                      key={opt}
                      className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        setColumnFilters(prev => {
                          const prevArr = Array.isArray(prev[filter.column])
                            ? prev[filter.column]
                            : [];
                          const exists = prevArr.includes(opt);
                          return {
                            ...prev,
                            [filter.column]: exists
                              ? prevArr.filter((v: string) => v !== opt)
                              : [...prevArr, opt],
                          };
                        });
                      }}
                    >
                      <Checkbox
                        checked={selectedValues.includes(opt)}
                        onCheckedChange={() => {
                          setColumnFilters(prev => {
                            const prevArr = Array.isArray(prev[filter.column])
                              ? prev[filter.column]
                              : [];
                            const exists = prevArr.includes(opt);
                            return {
                              ...prev,
                              [filter.column]: exists
                                ? prevArr.filter((v: string) => v !== opt)
                                : [...prevArr, opt],
                            };
                          });
                        }}
                        className="mr-2"
                        tabIndex={-1}
                        aria-label={opt}
                      />
                      <span>{opt}</span>
                    </div>
                  ))}
                </ScrollArea>
                {selectedValues.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => clearFilter(filter.column)}
                  >
                    Clear All
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>
        );
      }
      case 'dropdown': {
        return (
          <div key={filter.column} className="min-w-[180px] relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between items-center h-10">
                  <span>{currentValue || `Filter ${filter.column}`}</span>
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <ScrollArea className="h-32">
                  {filter.options?.map(opt => (
                    <div
                      key={opt}
                      className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        setColumnFilters(prev => ({
                          ...prev,
                          [filter.column]: prev[filter.column] === opt ? undefined : opt,
                        }));
                      }}
                    >
                      <Checkbox
                        checked={currentValue === opt}
                        onCheckedChange={() => {
                          setColumnFilters(prev => ({
                            ...prev,
                            [filter.column]: prev[filter.column] === opt ? undefined : opt,
                          }));
                        }}
                        className="mr-2"
                        tabIndex={-1}
                        aria-label={opt}
                      />
                      <span>{opt}</span>
                    </div>
                  ))}
                </ScrollArea>
                {currentValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => clearFilter(filter.column)}
                  >
                    Clear
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>
        );
      }
      case 'date':
        return (
          <div key={filter.column} className="min-w-[180px] relative">
            <DatePicker
              value={currentValue}
              onChange={val => setColumnFilters(prev => ({ ...prev, [filter.column]: val }))}
            />
            {currentValue && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  clearFilter(filter.column);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
              >
                {/* <XIcon className="h-4 w-4" /> */}
              </button>
            )}
          </div>
        );

      case 'date-range':
        return (
          <div key={filter.column} className="min-w-[250px] relative">
            <DateRangePicker
              // selected={currentValue}
              onChange={val => setColumnFilters(prev => ({ ...prev, [filter.column]: val }))}
              // placeholder={`Filter ${filter.column}`}
            />
            {currentValue && (currentValue.startDate || currentValue.endDate) && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  clearFilter(filter.column);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
              >
                {/* <XIcon className="h-4 w-4" /> */}
              </button>
            )}
          </div>
        );

      case 'datetime':
        return (
          <div key={filter.column} className="min-w-[250px] relative">
            <DateTimePicker
              // selected={currentValue}
              onChange={val => setColumnFilters(prev => ({ ...prev, [filter.column]: val }))}
              // placeholder={`Filter ${filter.column}`}
            />
            {currentValue && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  clearFilter(filter.column);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
              >
                {/* <XIcon className="h-4 w-4" /> */}
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const filteredData = useMemo(() => {
    let result = data.filter(row => {
      // Search filter
      let searchMatch = true;
      if (!disableSearch && searchTerm) {
        searchMatch = Object.values(row).some(val => {
          if (val == null) return false;
          if (Array.isArray(val)) {
            return val.some(item => String(item).toLowerCase().includes(searchTerm.toLowerCase()));
          }
          if (typeof val === 'object') {
            try {
              return JSON.stringify(val).toLowerCase().includes(searchTerm.toLowerCase());
            } catch {
              return false;
            }
          }
          return String(val).toLowerCase().includes(searchTerm.toLowerCase());
        });
      }

      // If search is enabled and no match found, skip this row
      if (!disableSearch && searchTerm && !searchMatch) {
        return false;
      }

      // Column filters
      for (const [col, val] of Object.entries(columnFilters)) {
        // Skip empty/null/undefined filters, but allow 0 and false
        if (val === null || val === undefined || val === '') continue;

        // Skip empty arrays
        if (Array.isArray(val) && val.length === 0) continue;

        // Skip empty objects (but not Date objects)
        if (typeof val === 'object' && !(val instanceof Date) && !Array.isArray(val)) {
          if (Object.keys(val).length === 0) continue;
        }
        const rowValue = row[col];
        if (val && typeof val === 'object' && (val.startDate || val.endDate)) {
          const rowDate = new Date(rowValue);
          if (isNaN(rowDate.getTime())) return false;

          if (val.startDate) {
            const startDate = new Date(val.startDate);
            startDate.setHours(0, 0, 0, 0);
            if (rowDate < startDate) return false;
          }

          if (val.endDate) {
            const endDate = new Date(val.endDate);
            endDate.setHours(23, 59, 59, 999);
            if (rowDate > endDate) return false;
          }
        } else if (val instanceof Date) {
          const rowDate = new Date(rowValue);
          if (isNaN(rowDate.getTime())) return false;

          // Compare dates only (ignore time)
          const filterDate = new Date(val);
          filterDate.setHours(0, 0, 0, 0);
          const comparableRowDate = new Date(rowDate);
          comparableRowDate.setHours(0, 0, 0, 0);

          if (comparableRowDate.getTime() !== filterDate.getTime()) return false;
        }
        // Multi-select filter
        else if (Array.isArray(val)) {
          if (Array.isArray(rowValue)) {
            // Both filter and row value are arrays
            const hasMatch = val.some(selected =>
              rowValue.some(rv => String(rv.label).toLowerCase() === String(selected).toLowerCase())
            );
            if (!hasMatch) return false;
          } else {
            // Row value is not array, check if it matches any selected value
            const hasMatch = val.some(
              selected => String(rowValue).toLowerCase() === String(selected).toLowerCase()
            );
            if (!hasMatch) return false;
          }
        }
        // Regular string/dropdown filter
        else {
          if (Array.isArray(rowValue)) {
            const hasMatch = rowValue.some(v =>
              typeof v === 'object' && v !== null && !Array.isArray(v)
                ? JSON.stringify(v).toLowerCase().includes(String(val).toLowerCase())
                : String(v).toLowerCase().includes(String(val).toLowerCase())
            );
            if (!hasMatch) return false;
          } else if (
            typeof rowValue === 'object' &&
            rowValue !== null &&
            !Array.isArray(rowValue) &&
            !React.isValidElement(rowValue)
          ) {
            // For plain objects (not React elements), stringify and check
            if (!JSON.stringify(rowValue).toLowerCase().includes(String(val).toLowerCase())) {
              return false;
            }
          } else if (React.isValidElement(rowValue)) {
            // For React elements, skip filtering (or you can add custom logic if needed)
            return false;
          } else {
            // Regular string/number/boolean comparison
            if (!String(rowValue).toLowerCase().includes(String(val).toLowerCase())) {
              return false;
            }
          }
        }
      }

      return true;
    });

    // Sort the filtered data
    if (sortColumn && sortDirection) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        // Handle nulls/undefined
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
        if (bVal == null) return sortDirection === 'asc' ? 1 : -1;

        // Handle dates
        if (aVal instanceof Date && bVal instanceof Date) {
          return sortDirection === 'asc'
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }

        // Try to parse as dates if they're strings
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortDirection === 'asc'
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }

        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // Try to parse as numbers
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Handle booleans
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

        // Default string comparison
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

  const hasActiveFilters = Object.keys(columnFilters).length > 0;

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
            <div className="flex flex-wrap items-end gap-2 md:gap-4">
              {!disableSearch && (
                <div className="flex-1 min-w-[300px]">
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

              {filterConfig.map(renderFilter)}
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
              <div className="flex flex-col items-center space-y-3 text-gray-500 dark:text-gray-400">
                <div className="w-8 h-8 border-3 border-current border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Loading data...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow
                    className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-gray-800 dark:to-gray-700 
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
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-gray-400 dark:text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <p className="text-base font-medium">No data found</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs text-center">
                            {searchTerm || hasActiveFilters
                              ? "Try adjusting your search or filters to find what you're looking for."
                              : 'No records are currently available in this table.'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row, i) => {
                      const canExpand = rowExpandable ? rowExpandable(row) : expandableRows;
                      const isExpanded = expandedRows[i] || false;

                      return (
                        <React.Fragment key={i}>
                          <TableRow
                            className={cn(
                              'group transition-all duration-200 border-b border-gray-100 dark:border-gray-800',
                              i % 2 === 0
                                ? 'bg-white dark:bg-gray-900'
                                : 'bg-gray-50/50 dark:bg-gray-800/30',
                              'hover:bg-blue-50/50 dark:hover:bg-blue-900/10',
                              isExpanded && 'bg-blue-50/50 dark:bg-blue-900/10 shadow-sm',
                              onRowClick &&
                                'cursor-pointer hover:scale-[1.005] active:scale-[0.995]'
                            )}
                            onClick={() => onRowClick && onRowClick(row, i)}
                          >
                            {expandableRows && (
                              <TableCell
                                onClick={e => {
                                  e.stopPropagation();
                                  if (canExpand) toggleRow(i);
                                }}
                                className={cn(
                                  'px-4 py-4 text-center transition-colors duration-200',
                                  canExpand &&
                                    'cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 rounded-l-lg'
                                )}
                              >
                                {canExpand ? (
                                  <div
                                    className={cn(
                                      'flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300',
                                      isExpanded
                                        ? 'bg-blue-100 dark:bg-blue-900/30'
                                        : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
                                    )}
                                  >
                                    <ChevronDownIcon
                                      className={cn(
                                        'h-4 w-4 transition-all duration-300',
                                        isExpanded
                                          ? 'text-blue-600 dark:text-blue-400 rotate-180'
                                          : 'text-gray-500 dark:text-gray-400 rotate-0 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                      )}
                                    />
                                  </div>
                                ) : null}
                              </TableCell>
                            )}
                            {headers.map((key, keyIndex) => {
                              const value = row[key];
                              const isLastColumn = keyIndex === headers.length - 1;
                              const isActiveSortColumn = sortColumn === key;

                              return (
                                <TableCell
                                  key={key}
                                  className={cn(
                                    'px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium',
                                    isLastColumn && !expandableRows && 'rounded-r-lg',
                                    isActiveSortColumn && 'bg-blue-50/70 dark:bg-blue-900/20'
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
                          {expandableRows && isExpanded && expandedComponent && canExpand && (
                            <TableRow className="transition-all duration-300">
                              <TableCell
                                colSpan={headers.length + 1}
                                className="p-0 border-b-0 bg-transparent"
                              >
                                <div className="mx-4 mt-0 mb-4 overflow-hidden rounded-b-lg border border-t-0 border-blue-200 dark:border-blue-900 dark:bg-gray-900/50">
                                  <div className="p-5 bg-white/80 dark:bg-gray-900/50 border-t-2 border-blue-400 dark:border-blue-700">
                                    <div className="pb-1 mb-3 border-b border-gray-100 dark:border-gray-800">
                                      <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                                        Details
                                      </span>
                                    </div>
                                    {expandedComponent(row)}
                                  </div>
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

        {/* Table Footer Info - refined styling */}
        {filteredData.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 px-1 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-sm">Showing</span>
              <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-semibold text-gray-900 dark:text-gray-100">
                {filteredData.length}
              </span>
              <span>of</span>
              <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 font-semibold text-gray-900 dark:text-gray-100">
                {data.length}
              </span>
              <span>results</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {sortColumn && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d={
                        sortDirection === 'asc'
                          ? 'M8 10L12 6M12 6L16 10M12 6V18'
                          : 'M8 14L12 18M12 18L16 14M12 18V6'
                      }
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Sorted by {sortColumn} ({sortDirection === 'asc' ? 'A to Z' : 'Z to A'})
                </span>
              )}
              {(searchTerm || Object.keys(columnFilters).length > 0) && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200">
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75M3 18h14.25M16.5 8.25L19.5 11.25L16.5 14.25"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Filtered results
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
