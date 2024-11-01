import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EventDialog } from './event-dialog';
import { EventList } from './event-list';
import type { CalendarEvent } from '@/lib/types';

export function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Fishing at Lake Travis',
      date: '2024-03-20',
      location: 'Lake Travis',
      description: 'Early morning fishing trip',
      participants: [
        {
          id: '1',
          name: 'John Doe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        },
      ],
    },
  ]);

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
    };
    setEvents([...events, newEvent]);
  };

  const selectedDateEvents = events.filter(
    (event) => event.date === date?.toISOString().split('T')[0]
  );

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Events for {date?.toLocaleDateString(undefined, { dateStyle: 'long' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EventList events={selectedDateEvents} />
          </CardContent>
        </Card>
      </div>
      <EventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={addEvent}
      />
    </div>
  );
}