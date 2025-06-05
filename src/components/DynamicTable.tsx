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
import { type FilterConfig } from '@/types';

type DynamicTableProps = {
  data: Record<string, any>[];
  customRender?: {
    [key: string]: (value: any, row: Record<string, any>) => React.ReactNode;
  };
  loading?: boolean;
  filterConfig?: FilterConfig[];
  className?: string;
};

const DynamicTable: React.FC<DynamicTableProps> = ({
  data,
  customRender = {},
  loading = false,
  filterConfig = [],
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});

  const headers = data.length ? Object.keys(data[0]).filter(key => !key.startsWith('_')) : [];

  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (
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
  }, [data, searchTerm, columnFilters]);

  return (
    <div className={`w-full space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-4 items-end">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />

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
              {headers.map(key => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, i) => (
              <TableRow
                key={i}
                className={`transition-colors ${
                  i % 2 === 0 ? 'bg-muted/50 dark:bg-muted/40' : 'bg-background dark:bg-muted/20'
                } hover:bg-muted/70 dark:hover:bg-muted/60`}
              >
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
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default DynamicTable;
