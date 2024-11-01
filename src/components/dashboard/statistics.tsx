import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fish, MapPin, Scale, Ruler } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCatchStore } from '@/lib/stores/catch-store';
import { useEffect, useMemo, useState } from 'react';

interface StatisticsProps {
  isLoading?: boolean;
}

export function Statistics({ isLoading }: StatisticsProps) {
  const { catches } = useCatchStore();
  const [stats, setStats] = useState({
    totalCatches: 0,
    locations: 0,
    biggestCatch: {
      weight: 0,
      species: '',
      date: '',
    },
    longestCatch: {
      length: 0,
      species: '',
      date: '',
    },
  });

  useEffect(() => {
    if (catches.length > 0) {
      const uniqueLocations = new Set(catches.map(c => c.location.name));
      const biggestCatch = catches.reduce((prev, curr) => 
        curr.weight > prev.weight ? curr : prev
      );
      const longestCatch = catches.reduce((prev, curr) => 
        curr.length > prev.length ? curr : prev
      );

      setStats({
        totalCatches: catches.length,
        locations: uniqueLocations.size,
        biggestCatch: {
          weight: biggestCatch.weight,
          species: biggestCatch.species,
          date: biggestCatch.date,
        },
        longestCatch: {
          length: longestCatch.length,
          species: longestCatch.species,
          date: longestCatch.date,
        },
      });
    }
  }, [catches]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Catches</CardTitle>
          <Fish className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCatches}</div>
          <p className="text-xs text-muted-foreground">Lifetime catches</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Locations</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.locations}</div>
          <p className="text-xs text-muted-foreground">Unique fishing spots</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Biggest Catch</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.biggestCatch.weight} lbs</div>
          <p className="text-xs text-muted-foreground">
            {stats.biggestCatch.species} on{' '}
            {new Date(stats.biggestCatch.date).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Catch</CardTitle>
          <Ruler className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.longestCatch.length}"</div>
          <p className="text-xs text-muted-foreground">
            {stats.longestCatch.species} on{' '}
            {new Date(stats.longestCatch.date).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}