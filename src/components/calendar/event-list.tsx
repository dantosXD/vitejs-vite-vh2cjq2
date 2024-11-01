import { MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CalendarEvent } from '@/lib/types';

interface EventListProps {
  events: CalendarEvent[];
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No events scheduled for this day
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-start space-x-4 rounded-lg border p-4"
        >
          <div className="flex-1 space-y-1">
            <h4 className="font-medium leading-none">{event.title}</h4>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              {event.location}
            </div>
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
            {event.participants.length > 0 && (
              <div className="flex -space-x-2 mt-2">
                {event.participants.map((participant) => (
                  <Avatar
                    key={participant.id}
                    className="h-6 w-6 border-2 border-background"
                  >
                    <AvatarImage src={participant.avatar} alt={participant.name} />
                    <AvatarFallback>{participant.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}