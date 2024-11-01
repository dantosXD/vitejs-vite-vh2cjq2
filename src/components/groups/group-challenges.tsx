import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Group, Challenge } from '@/lib/types';

interface GroupChallengesProps {
  group: Group;
}

export function GroupChallenges({ group }: GroupChallengesProps) {
  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Biggest Bass Challenge',
      description: 'Catch the biggest bass this month! Winner gets bragging rights and a special badge.',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      type: 'biggest_catch',
      target: {
        species: 'Bass',
        metric: 'weight',
      },
      participants: group.members.map(m => ({
        userId: m.id,
        progress: Math.random() * 10,
      })),
      completed: false,
    },
    {
      id: '2',
      title: 'Species Hunt',
      description: 'Catch 5 different species of fish this week.',
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      type: 'species_variety',
      target: {
        count: 5,
      },
      participants: group.members.map(m => ({
        userId: m.id,
        progress: Math.floor(Math.random() * 5),
      })),
      completed: false,
    },
  ]);

  const getParticipantProgress = (challenge: Challenge, userId: string) => {
    return challenge.participants.find(p => p.userId === userId)?.progress || 0;
  };

  const getProgressPercentage = (challenge: Challenge, progress: number) => {
    if (challenge.type === 'species_variety') {
      return (progress / challenge.target.count) * 100;
    }
    // For biggest catch challenges, show relative progress
    const maxProgress = Math.max(...challenge.participants.map(p => p.progress));
    return maxProgress > 0 ? (progress / maxProgress) * 100 : 0;
  };

  const getLeader = (challenge: Challenge) => {
    const leader = [...challenge.participants].sort((a, b) => b.progress - a.progress)[0];
    return group.members.find(m => m.id === leader.userId);
  };

  return (
    <div className="space-y-4">
      {challenges.map(challenge => {
        const leader = getLeader(challenge);
        
        return (
          <Card key={challenge.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {challenge.description}
                  </p>
                </div>
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(challenge.startDate), 'MMM d')} -{' '}
                    {format(new Date(challenge.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
                {leader && (
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>{leader.name} is leading!</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {challenge.participants.map(participant => {
                  const member = group.members.find(m => m.id === participant.userId);
                  if (!member) return null;

                  const progress = getParticipantProgress(challenge, participant.userId);
                  const percentage = getProgressPercentage(challenge, progress);

                  return (
                    <div key={participant.userId} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{member.name}</span>
                        <span className="text-muted-foreground">
                          {challenge.type === 'species_variety'
                            ? `${progress}/${challenge.target.count} species`
                            : `${progress.toFixed(1)} lbs`}
                        </span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}