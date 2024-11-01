import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageDialog } from '@/components/ui/image-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Image, Pencil, Scale, Ruler, MapPin, Calendar, MessageCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Catch } from '@/lib/types';
import { CatchDetailsDialog } from './catch-details-dialog';
import { usePreferences } from '@/lib/hooks/use-preferences';

interface CatchViewProps {
  catches: Catch[];
  onEdit: (catch_: Catch) => void;
  currentUserId: string;
  groupMembers?: { id: string; name: string; avatar?: string }[];
  onAddComment?: (catchId: string, comment: string) => void;
}

function getFeatureImage(catch_: Catch): string {
  return catch_.photos[catch_.featurePhotoIndex ?? 0];
}

function formatMeasurement(value: number, type: 'weight' | 'length', preferences: ReturnType<typeof usePreferences>) {
  const { displaySettings } = preferences;
  const isImperial = displaySettings.measurementSystem === 'imperial';

  if (type === 'weight') {
    return isImperial ? `${value} lbs` : `${(value * 0.453592).toFixed(1)} kg`;
  } else {
    return isImperial ? `${value}"` : `${(value * 2.54).toFixed(1)} cm`;
  }
}

function formatDate(date: string, preferences: ReturnType<typeof usePreferences>) {
  const { displaySettings } = preferences;
  const dateFormat = displaySettings.dateFormat
    .replace('DD', 'dd')
    .replace('YYYY', 'yyyy');
  return format(new Date(date), dateFormat);
}

export function TableView({ catches, onEdit, currentUserId, groupMembers, onAddComment }: CatchViewProps) {
  const [selectedCatch, setSelectedCatch] = useState<Catch | null>(null);
  const preferences = usePreferences();

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Photo</TableHead>
            <TableHead>Species</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Length</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {catches.map((catch_) => (
            <TableRow key={catch_.id}>
              <TableCell>
                <ImageDialog
                  image={getFeatureImage(catch_)}
                  alt={`${catch_.species} catch`}
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Image className="h-4 w-4" />
                    </Button>
                  }
                />
              </TableCell>
              <TableCell className="font-medium">{catch_.species}</TableCell>
              <TableCell>{formatMeasurement(catch_.weight, 'weight', preferences)}</TableCell>
              <TableCell>{formatMeasurement(catch_.length, 'length', preferences)}</TableCell>
              <TableCell>{catch_.location.name}</TableCell>
              <TableCell>{formatDate(catch_.date, preferences)}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCatch(catch_)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {catch_.userId === currentUserId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(catch_)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {catch_.comments.length > 0 && (
                    <div className="flex items-center text-muted-foreground">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">{catch_.comments.length}</span>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedCatch && (
        <CatchDetailsDialog
          catch_={selectedCatch}
          open={!!selectedCatch}
          onOpenChange={(open) => !open && setSelectedCatch(null)}
          groupMembers={groupMembers}
          currentUserId={currentUserId}
          onAddComment={onAddComment}
        />
      )}
    </>
  );
}

export function GridView({ catches, onEdit, currentUserId, groupMembers, onAddComment }: CatchViewProps) {
  const [selectedCatch, setSelectedCatch] = useState<Catch | null>(null);
  const preferences = usePreferences();

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {catches.map((catch_) => (
          <Card key={catch_.id}>
            <CardContent className="p-4">
              <div className="relative">
                <ImageDialog
                  image={getFeatureImage(catch_)}
                  alt={`${catch_.species} catch`}
                  trigger={
                    <img
                      src={getFeatureImage(catch_)}
                      alt={`${catch_.species} catch`}
                      className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  }
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {catch_.userId === currentUserId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                      onClick={() => onEdit(catch_)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {catch_.comments.length > 0 && (
                    <div className="flex items-center bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-muted-foreground">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">{catch_.comments.length}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{catch_.species}</h3>
                  <time className="text-sm text-muted-foreground">
                    {formatDate(catch_.date, preferences)}
                  </time>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Scale className="h-4 w-4" />
                    <span>{formatMeasurement(catch_.weight, 'weight', preferences)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    <span>{formatMeasurement(catch_.length, 'length', preferences)}</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <MapPin className="h-4 w-4" />
                    <span>{catch_.location.name}</span>
                  </div>
                </div>
                {catch_.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {catch_.notes}
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setSelectedCatch(catch_)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCatch && (
        <CatchDetailsDialog
          catch_={selectedCatch}
          open={!!selectedCatch}
          onOpenChange={(open) => !open && setSelectedCatch(null)}
          groupMembers={groupMembers}
          currentUserId={currentUserId}
          onAddComment={onAddComment}
        />
      )}
    </>
  );
}

export function TimelineView({ catches, onEdit, currentUserId, groupMembers, onAddComment }: CatchViewProps) {
  const [selectedCatch, setSelectedCatch] = useState<Catch | null>(null);
  const preferences = usePreferences();

  return (
    <>
      <div className="relative space-y-12 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
        {catches.map((catch_) => (
          <div key={catch_.id} className="relative flex items-start gap-6">
            <div className="absolute left-0 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-muted shadow-sm">
                <span className="h-2 w-2 rounded-full bg-primary" />
              </div>
            </div>
            <Card className="ml-12 flex-1">
              <CardContent className="relative p-6">
                <div className="absolute top-6 right-6 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCatch(catch_)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {catch_.userId === currentUserId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(catch_)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {catch_.comments.length > 0 && (
                    <div className="flex items-center text-muted-foreground">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{catch_.comments.length}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <time className="text-sm font-medium text-muted-foreground">
                    {formatDate(catch_.date, preferences)}
                  </time>
                  <h3 className="mt-2 text-xl font-semibold">{catch_.species}</h3>
                </div>

                <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                  <div className="space-y-4">
                    <ImageDialog
                      image={getFeatureImage(catch_)}
                      alt={`${catch_.species} catch`}
                      trigger={
                        <img
                          src={getFeatureImage(catch_)}
                          alt={`${catch_.species} catch`}
                          className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      }
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Scale className="h-4 w-4" />
                        <span className="text-foreground font-medium">
                          {formatMeasurement(catch_.weight, 'weight', preferences)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Ruler className="h-4 w-4" />
                        <span className="text-foreground font-medium">
                          {formatMeasurement(catch_.length, 'length', preferences)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-foreground font-medium">{catch_.location.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-foreground font-medium">
                          {formatDate(catch_.date, preferences)}
                        </span>
                      </div>
                    </div>

                    {catch_.notes && (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground">{catch_.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {selectedCatch && (
        <CatchDetailsDialog
          catch_={selectedCatch}
          open={!!selectedCatch}
          onOpenChange={(open) => !open && setSelectedCatch(null)}
          groupMembers={groupMembers}
          currentUserId={currentUserId}
          onAddComment={onAddComment}
        />
      )}
    </>
  );
}