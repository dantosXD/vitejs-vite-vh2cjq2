import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableView, GridView, TimelineView } from '../catches/catch-views';
import { CatchDialog } from '../catches/catch-dialog';
import { CatchFilters } from '../catches/catch-filters';
import { GroupChallenges } from './group-challenges';
import { GroupLeaderboard } from './group-leaderboard';
import type { Group, Catch } from '@/lib/types';

interface GroupDetailsProps {
  group: Group;
  onBack: () => void;
  onUpdateGroup: (updatedGroup: Group) => void;
  currentUserId: string;
  allGroups: Group[];
}

export function GroupDetails({ 
  group, 
  onBack, 
  onUpdateGroup,
  currentUserId,
  allGroups
}: GroupDetailsProps) {
  const [view, setView] = useState<'table' | 'grid' | 'timeline'>('grid');
  const [selectedCatch, setSelectedCatch] = useState<Catch | undefined>();
  const [isCatchDialogOpen, setIsCatchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [activeTab, setActiveTab] = useState('catches');

  const groupCatches = group.catches || [];
  const species = Array.from(new Set(groupCatches.map((c) => c.species))).sort();
  const locations = Array.from(new Set(groupCatches.map((c) => c.location.name))).sort();

  const handleEditCatch = (catch_: Catch) => {
    if (catch_.userId === currentUserId) {
      setSelectedCatch(catch_);
      setIsCatchDialogOpen(true);
    }
  };

  const handleUpdateCatch = (updatedCatch: Catch) => {
    const updatedGroup = {
      ...group,
      catches: group.catches?.map(c => 
        c.id === updatedCatch.id ? updatedCatch : c
      )
    };
    onUpdateGroup(updatedGroup);
    setIsCatchDialogOpen(false);
    setSelectedCatch(undefined);
  };

  const handleAddComment = (catchId: string, content: string) => {
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
                  userId: currentUserId,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : c
      ),
    };
    onUpdateGroup(updatedGroup);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Groups
        </Button>
        <h1 className="text-2xl font-bold">{group.name}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="catches">Catches</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="catches">
          <Card>
            <div className="p-6 space-y-6">
              <CatchFilters
                onSearchChange={setSearchQuery}
                onSpeciesChange={setSelectedSpecies}
                onLocationChange={setSelectedLocation}
                onDateRangeChange={() => {}}
                species={species}
                locations={locations}
              />
              <div className="flex gap-2">
                <Button
                  variant={view === 'table' ? 'secondary' : 'ghost'}
                  onClick={() => setView('table')}
                >
                  Table
                </Button>
                <Button
                  variant={view === 'grid' ? 'secondary' : 'ghost'}
                  onClick={() => setView('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={view === 'timeline' ? 'secondary' : 'ghost'}
                  onClick={() => setView('timeline')}
                >
                  Timeline
                </Button>
              </div>
              <div className="min-w-0 overflow-x-auto">
                {view === 'table' && (
                  <TableView
                    catches={groupCatches}
                    onEdit={handleEditCatch}
                    currentUserId={currentUserId}
                    groupMembers={group.members}
                    onAddComment={handleAddComment}
                  />
                )}
                {view === 'grid' && (
                  <GridView
                    catches={groupCatches}
                    onEdit={handleEditCatch}
                    currentUserId={currentUserId}
                    groupMembers={group.members}
                    onAddComment={handleAddComment}
                  />
                )}
                {view === 'timeline' && (
                  <TimelineView
                    catches={groupCatches}
                    onEdit={handleEditCatch}
                    currentUserId={currentUserId}
                    groupMembers={group.members}
                    onAddComment={handleAddComment}
                  />
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="challenges">
          <GroupChallenges group={group} />
        </TabsContent>

        <TabsContent value="leaderboard">
          <GroupLeaderboard group={group} />
        </TabsContent>
      </Tabs>

      <CatchDialog
        open={isCatchDialogOpen}
        onOpenChange={setIsCatchDialogOpen}
        initialData={selectedCatch}
        groups={allGroups}
        onSubmit={handleUpdateCatch}
      />
    </div>
  );
}