import { useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Scale, Ruler, MessageCircle } from 'lucide-react';
import { ImageDialog } from '@/components/ui/image-dialog';
import { CatchDetailsDialog } from '../catches/catch-details-dialog';
import type { Group, Catch } from '@/lib/types';
import { useAuth } from '@/lib/auth';

interface GroupCatchesProps {
  group: Group;
  onAddComment?: (catchId: string, content: string) => void;
}

export function GroupCatches({ group, onAddComment }: GroupCatchesProps) {
  const { user: currentUser } = useAuth();
  const [selectedCatch, setSelectedCatch] = useState<Catch | null>(null);

  if (!group.catches || group.catches.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No catches have been shared with this group yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {group.catches.map((catch_) => {
          const user = group.members.find(member => member.id === catch_.userId);
          if (!user) return null;

          return (
            <Card 
              key={catch_.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCatch(catch_)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm font-medium">{user.name}</CardTitle>
                    <CardDescription>
                      {format(new Date(catch_.date), 'PPP')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ImageDialog
                  image={catch_.photos[catch_.featurePhotoIndex || 0]}
                  alt={`${catch_.species} catch by ${user.name}`}
                  trigger={
                    <img
                      src={catch_.photos[catch_.featurePhotoIndex || 0]}
                      alt={`${catch_.species} catch by ${user.name}`}
                      className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    />
                  }
                />
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{catch_.species}</h3>
                    {catch_.comments.length > 0 && (
                      <div className="flex items-center text-muted-foreground">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">{catch_.comments.length}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Scale className="mr-1 h-4 w-4" />
                      {catch_.weight} lbs
                    </div>
                    <div className="flex items-center">
                      <Ruler className="mr-1 h-4 w-4" />
                      {catch_.length}"
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {catch_.location.name}
                    </div>
                  </div>
                  {catch_.notes && (
                    <p className="text-sm text-muted-foreground">{catch_.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {currentUser && (
        <CatchDetailsDialog
          catch_={selectedCatch}
          open={!!selectedCatch}
          onOpenChange={(open) => !open && setSelectedCatch(null)}
          groupMembers={group.members}
          currentUserId={currentUser.$id}
          onAddComment={onAddComment}
        />
      )}
    </>
  );
}