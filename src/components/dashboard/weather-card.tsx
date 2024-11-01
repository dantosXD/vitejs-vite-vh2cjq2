import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, Thermometer, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherCardProps {
  isLoading?: boolean;
  data?: {
    temperature: number;
    conditions: string;
    icon: 'sun' | 'cloud' | 'rain';
  };
  error?: string;
}

export function WeatherCard({ isLoading, data, error }: WeatherCardProps) {
  if (isLoading) {
    return (
      <Card className="md:w-[240px]">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Local Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="md:w-[240px]">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Local Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cloud className="h-4 w-4" />
            <span>Unable to load weather data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weather = data ?? {
    temperature: 72,
    conditions: 'Partly Cloudy',
    icon: 'sun' as const,
  };

  const WeatherIcon = weather.icon === 'sun' ? Sun : Cloud;

  return (
    <Card className="md:w-[240px]">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Local Weather</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-4">
          <WeatherIcon className="h-8 w-8 text-yellow-500" />
          <div>
            <div className="flex items-center">
              <Thermometer className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{weather.temperature}°F</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Cloud className="mr-2 h-4 w-4" />
              <span>{weather.conditions}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}