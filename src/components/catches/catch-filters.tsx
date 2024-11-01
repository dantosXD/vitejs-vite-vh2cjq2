import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { useCatchStore } from '@/lib/stores/catch-store';

interface CatchFiltersProps {
  onSearchChange: (value: string) => void;
  onSpeciesChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function CatchFilters({
  onSearchChange,
  onSpeciesChange,
  onLocationChange,
  onDateRangeChange,
}: CatchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { catches } = useCatchStore();

  // Extract unique species and locations from catches
  const species = Array.from(new Set(catches.map(c => c.species))).sort();
  const locations = Array.from(new Set(catches.map(c => c.location.name))).sort();

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search catches..."
          className="pl-8"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="shrink-0">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Species</Label>
              <Select onValueChange={onSpeciesChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All species</SelectItem>
                  {species.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select onValueChange={onLocationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange onSelect={onDateRangeChange} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}