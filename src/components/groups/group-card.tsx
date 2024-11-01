import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Users, Fish } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GroupCatches } from './group-catches';
import type { Group } from '@/lib/types';
import { useAuth } from '@/lib/stores/auth-store';

interface GroupCardProps {
  group: Group;
  onLeave: (groupId: string) => void;
  onSelect: (group: Group) => void;
  onUpdateGroup?: (updatedGroup: Group) => void;
}

export function GroupCard({ group, onLeave, onSelect, onUpdateGroup }: GroupCardProps) {
  const { user } = useAuth();
  const [showCatches, setShowCatches] = useState(false);
  const isAdmin = user ? group.admins.includes(user.$id) : false;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={group.avatar} alt={group.name} />
              <AvatarFallback>
                <Users className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-xl truncate">{group.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0 ml-2">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAdmin ? (
                <>
                  <DropdownMenuItem>Manage Members</DropdownMenuItem>
                  <DropdownMenuItem>Edit Group</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete Group
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => onLeave(group.id)}>
                  Leave Group
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{group.description}</p>
          <div className="mt-auto">
            <div className="flex -space-x-2 mb-4">
              {group.members.slice(0, 5).map((member) => (
                <Avatar
                  key={member.id}
                  className="h-8 w-8 border-2 border-background"
                >
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {group.members.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                  +{group.members.length - 5}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 touch-manipulation"
                onClick={() => setShowCatches(true)}
              >
                <Fish className="mr-2 h-4 w-4" />
                Quick View
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 touch-manipulation"
                onClick={() => onSelect(group)}
              >
                View Group
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCatches} onOpenChange={setShowCatches}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{group.name} - Shared Catches</DialogTitle>
          </DialogHeader>
          <GroupCatches 
            group={group} 
            onAddComment={(catchId, content) => {
              if (!user || !onUpdateGroup) return;
              
              const updatedGroup = {
                ...group,
                catches: group.catches?.map(c =>
                  c.id === catchId
                    ? {
                        ...c,
                        comments: [
                          ...c.comments,
                          {
                            id: Math.random().toString(36).substr(2, 9),
                            content,
                            userId: user.$id,
                            createdAt: new Date().toISOString(),
                          },
                        ],
                      }
                    : c
                ),
              };
              onUpdateGroup(updatedGroup);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}