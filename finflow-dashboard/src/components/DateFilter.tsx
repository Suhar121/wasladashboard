import { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type DateFilterType = 'all' | 'this-month' | 'last-month' | 'last-3-months' | 'custom';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateFilterProps {
  onFilterChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

export function DateFilter({ onFilterChange }: DateFilterProps) {
  const [filterType, setFilterType] = useState<DateFilterType>('all');
  const [customRange, setCustomRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  const handleFilterTypeChange = (value: DateFilterType) => {
    setFilterType(value);
    
    const today = new Date();
    
    switch (value) {
      case 'all':
        onFilterChange(undefined, undefined);
        setCustomRange({ from: undefined, to: undefined });
        break;
      case 'this-month':
        onFilterChange(startOfMonth(today), endOfMonth(today));
        break;
      case 'last-month':
        const lastMonth = subMonths(today, 1);
        onFilterChange(startOfMonth(lastMonth), endOfMonth(lastMonth));
        break;
      case 'last-3-months':
        onFilterChange(startOfMonth(subMonths(today, 2)), endOfMonth(today));
        break;
      case 'custom':
        if (customRange.from && customRange.to) {
          onFilterChange(customRange.from, customRange.to);
        }
        break;
    }
  };

  const handleFromDateChange = (date: Date | undefined) => {
    const newRange = { ...customRange, from: date };
    setCustomRange(newRange);
    setIsFromOpen(false);
    if (newRange.from && newRange.to) {
      onFilterChange(newRange.from, newRange.to);
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    const newRange = { ...customRange, to: date };
    setCustomRange(newRange);
    setIsToOpen(false);
    if (newRange.from && newRange.to) {
      onFilterChange(newRange.from, newRange.to);
    }
  };

  const clearFilter = () => {
    setFilterType('all');
    setCustomRange({ from: undefined, to: undefined });
    onFilterChange(undefined, undefined);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filterType} onValueChange={handleFilterTypeChange}>
        <SelectTrigger className="w-[160px]">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Date Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="last-month">Last Month</SelectItem>
          <SelectItem value="last-3-months">Last 3 Months</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {filterType === 'custom' && (
        <div className="flex items-center gap-2">
          <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[130px] justify-start text-left font-normal",
                  !customRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customRange.from ? format(customRange.from, "MMM dd, yyyy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={customRange.from}
                onSelect={handleFromDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground">to</span>
          <Popover open={isToOpen} onOpenChange={setIsToOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[130px] justify-start text-left font-normal",
                  !customRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customRange.to ? format(customRange.to, "MMM dd, yyyy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={customRange.to}
                onSelect={handleToDateChange}
                disabled={(date) => customRange.from ? date < customRange.from : false}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {filterType !== 'all' && (
        <Button variant="ghost" size="icon" onClick={clearFilter} title="Clear filter">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
