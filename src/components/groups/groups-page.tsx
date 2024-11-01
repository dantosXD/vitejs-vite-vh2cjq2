import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GroupCard } from './group-card';
import { CreateGroupDialog } from './create-group-dialog';
import { GroupDetails } from './group-details';
import type { Group } from '@/lib/types';
import { useAuth } from '@/lib/stores/auth-store';

// Mock data for initial groups with catches
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
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        createdAt: new Date().toISOString(),
      },
    ],
    admins: ['1'],
    createdAt: new Date().toISOString(),
    catches: [
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
      }
    ]
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
    catches: [
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
        userId: '2',
        sharedWithGroups: ['2'],
        comments: [],
      }
    ]
  },
];

export function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleCreateGroup = (newGroup: Omit<Group, 'id' | 'createdAt'>) => {
    const group: Group = {
      ...newGroup,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      catches: [],
    };
    setGroups([...groups, group]);
  };

  const handleLeaveGroup = (groupId: string) => {
    setGroups(groups.filter((group) => group.id !== groupId));
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(null);
    }
  };

  const handleUpdateGroup = (updatedGroup: Group) => {
    setGroups(groups.map(group => 
      group.id === updatedGroup.id ? updatedGroup : group
    ));
    setSelectedGroup(updatedGroup);
  };

  if (!user) {
    return null;
  }

  if (selectedGroup) {
    return (
      <div className="container py-6">
        <GroupDetails
          group={selectedGroup}
          onBack={() => setSelectedGroup(null)}
          onUpdateGroup={handleUpdateGroup}
          currentUserId={user.$id}
          allGroups={groups}
        />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Groups</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <GroupCard 
            key={group.id} 
            group={group} 
            onLeave={handleLeaveGroup}
            onSelect={setSelectedGroup}
          />
        ))}
      </div>

      <CreateGroupDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
}