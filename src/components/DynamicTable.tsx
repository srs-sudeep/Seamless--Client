import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/datePicker';
import { DateRangePicker } from '@/components/ui/dateRangePicker';
import { DateTimePicker } from '@/components/ui/date-timePicker';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { type FilterConfig } from '@/types';

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
};

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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const headers = data.length ? Object.keys(data[0]).filter(key => !key.startsWith('_')) : [];

  const filteredData = useMemo(() => {
    return data.filter(row => {
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
  }, [data, searchTerm, columnFilters, disableSearch]);

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-4 items-end">
        {!disableSearch && (
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        )}

        {filterConfig.map(filter => {
          switch (filter.type) {
            case 'dropdown':
              return (
                <Select
                  key={filter.column}
                  onValueChange={val =>
                    setColumnFilters(prev => ({ ...prev, [filter.column]: val }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <span>{columnFilters[filter.column] || `Select ${filter.column}`}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options?.map(opt => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );

            case 'date':
              return (
                <div key={filter.column} className="w-[180px]">
                  <DatePicker
                    onChange={val => setColumnFilters(prev => ({ ...prev, [filter.column]: val }))}
                  />
                </div>
              );

            case 'date-range':
              return (
                <div key={filter.column} className="w-[250px]">
                  <DateRangePicker
                    onChange={val => setColumnFilters(prev => ({ ...prev, [filter.column]: val }))}
                  />
                </div>
              );

            case 'datetime':
              return (
                <div key={filter.column} className="w-[250px]">
                  <DateTimePicker
                    onChange={val => setColumnFilters(prev => ({ ...prev, [filter.column]: val }))}
                  />
                </div>
              );

            default:
              return null;
          }
        })}
      </div>

      {loading ? (
        <TableCaption>Loading...</TableCaption>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {expandableRows && <TableHead />}
              {headers.map(key => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, i) => (
              <React.Fragment key={i}>
                <TableRow
                  className={`transition-colors ${
                    i % 2 === 0 ? 'bg-muted/50 dark:bg-muted/40' : 'bg-background dark:bg-muted/20'
                  } hover:bg-muted/70 dark:hover:bg-muted/60`}
                  onClick={() => onRowClick && onRowClick(row, i)} // <-- Add this
                  style={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {expandableRows && (
                    <TableCell
                      onClick={e => {
                        e.stopPropagation();
                        toggleRow(i);
                      }}
                      className="cursor-pointer w-4"
                    >
                      <ChevronDownIcon
                        className={cn(
                          'h-4 w-4 transition-transform',
                          expandedRows[i] ? 'rotate-180' : 'rotate-0'
                        )}
                      />
                    </TableCell>
                  )}
                  {headers.map(key => {
                    const value = row[key];
                    if (customRender[key]) {
                      return <TableCell key={key}>{customRender[key](value, row)}</TableCell>;
                    }
                    if (React.isValidElement(value)) {
                      return <TableCell key={key}>{value}</TableCell>;
                    }
                    if (value instanceof Date) {
                      return <TableCell key={key}>{value.toLocaleString()}</TableCell>;
                    }
                    if (typeof value === 'object' && value !== null) {
                      try {
                        return <TableCell key={key}>{JSON.stringify(value)}</TableCell>;
                      } catch {
                        return <TableCell key={key}>[Object]</TableCell>;
                      }
                    }
                    return <TableCell key={key}>{value}</TableCell>;
                  })}
                </TableRow>

                {expandableRows && expandedRows[i] && expandedComponent && (
                  <TableRow className="bg-muted">
                    <TableCell colSpan={headers.length + 1}>{expandedComponent(row)}</TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export { DynamicTable };
