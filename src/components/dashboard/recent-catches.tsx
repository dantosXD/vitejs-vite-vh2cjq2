import { useState } from 'react';
import { Plus, TableIcon, LayoutGrid, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatchDialog } from '../catches/catch-dialog';
import { CatchFilters } from '../catches/catch-filters';
import { TableView, GridView, TimelineView } from '../catches/catch-views';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO } from 'date-fns';
import type { Catch, Group } from '@/lib/types';

// Mock groups data
const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Bass Masters',
    description: 'A group for bass fishing enthusiasts',
    members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        createdAt: new Date().toISOString(),
      },
    ],
    admins: ['1'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Lake Travis Anglers',
    description: 'Local fishing group for Lake Travis area',
    members: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        createdAt: new Date().toISOString(),
      },
    ],
    admins: ['2'],
    createdAt: new Date().toISOString(),
  },
];

// Mock initial catches data
const mockCatches: Catch[] = [
  {
    id: '1',
    species: 'Bass',
    weight: 4.2,
    length: 18,
    location: {
      name: 'Lake Travis',
    },
    date: '2024-03-15',
    photos: [
      'https://images.unsplash.com/photo-1544722751-0b7c4e5c7f0e?auto=format&fit=crop&q=80&w=400',
    ],
    featurePhotoIndex: 0,
    notes: 'Caught during early morning using a topwater lure.',
    userId: '1',
    sharedWithGroups: ['1'],
    comments: [],
  },
  {
    id: '2',
    species: 'Trout',
    weight: 2.8,
    length: 14,
    location: {
      name: 'Colorado River',
    },
    date: '2024-03-12',
    photos: [
      'https://images.unsplash.com/photo-1583120073934-eb2a0c4f8882?auto=format&fit=crop&q=80&w=400',
    ],
    featurePhotoIndex: 0,
    notes: 'Beautiful rainbow trout caught on a fly.',
    userId: '1',
    sharedWithGroups: ['2'],
    comments: [],
  },
];

interface RecentCatchesProps {
  userId: string;
  isLoading?: boolean;
}

export function RecentCatches({ userId, isLoading }: RecentCatchesProps) {
  const [view, setView] = useState<'table' | 'grid' | 'timeline'>('table');
  const [catches, setCatches] = useState<Catch[]>(mockCatches);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCatch, setSelectedCatch] = useState<Catch | undefined>();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>();

  const species = Array.from(new Set(catches.map((c) => c.species))).sort();
  const locations = Array.from(new Set(catches.map((c) => c.location.name))).sort();

  // Filter catches based on search and filters
  const filteredCatches = catches.filter((catch_) => {
    const matchesSearch = searchQuery === '' || 
      catch_.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catch_.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catch_.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecies = selectedSpecies === 'all' || 
      catch_.species === selectedSpecies;

    const matchesLocation = selectedLocation === 'all' || 
      catch_.location.name === selectedLocation;

    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      isWithinInterval(parseISO(catch_.date), {
        start: dateRange.from,
        end: dateRange.to,
      });

    return matchesSearch && matchesSpecies && matchesLocation && matchesDateRange;
  });

  const handleSubmit = (catchData: Catch) => {
    if (selectedCatch) {
      setCatches(catches.map((c) => (c.id === catchData.id ? catchData : c)));
    } else {
      setCatches([catchData, ...catches]);
    }
    setIsDialogOpen(false);
    setSelectedCatch(undefined);
  };

  const handleEdit = (catch_: Catch) => {
    if (catch_.userId !== userId) return;
    setSelectedCatch(catch_);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Catches</CardTitle>
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 w-12 bg-muted rounded animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Recent Catches</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-2">
                <Button
                  variant={view === 'table' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setView('table')}
                >
                  <TableIcon className="h-4 w-4" />
                  <span className="sr-only">Table view</span>
                </Button>
                <Button
                  variant={view === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setView('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only">Grid view</span>
                </Button>
                <Button
                  variant={view === 'timeline' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setView('timeline')}
                >
                  <History className="h-4 w-4" />
                  <span className="sr-only">Timeline view</span>
                </Button>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Catch
              </Button>
            </div>
          </div>
          <CatchFilters
            onSearchChange={setSearchQuery}
            onSpeciesChange={setSelectedSpecies}
            onLocationChange={setSelectedLocation}
            onDateRangeChange={setDateRange}
            species={species}
            locations={locations}
          />
        </CardHeader>
        <CardContent>
          <div className="min-w-0 overflow-x-auto">
            {filteredCatches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No catches found matching your filters.
              </div>
            ) : (
              <>
                {view === 'table' && (
                  <TableView 
                    catches={filteredCatches} 
                    onEdit={handleEdit}
                    currentUserId={userId}
                  />
                )}
                {view === 'grid' && (
                  <GridView 
                    catches={filteredCatches} 
                    onEdit={handleEdit}
                    currentUserId={userId}
                  />
                )}
                {view === 'timeline' && (
                  <TimelineView 
                    catches={filteredCatches} 
                    onEdit={handleEdit}
                    currentUserId={userId}
                  />
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <CatchDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedCatch}
        groups={mockGroups}
        onSubmit={handleSubmit}
      />
    </>
  );
}