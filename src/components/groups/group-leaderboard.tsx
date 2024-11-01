import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Fish,
  Scale,
  Ruler,
  MapPin,
  Medal,
  Award,
} from 'lucide-react';
import type { Group } from '@/lib/types';

interface GroupLeaderboardProps {
  group: Group;
}

export function GroupLeaderboard({ group }: GroupLeaderboardProps) {
  // Calculate member stats
  const memberStats = group.members.map(member => {
    const memberCatches = group.catches?.filter(c => c.userId === member.id) || [];
    
    return {
      member,
      stats: {
        totalCatches: memberCatches.length,
        biggestCatch: Math.max(...memberCatches.map(c => c.weight), 0),
        longestCatch: Math.max(...memberCatches.map(c => c.length), 0),
        uniqueLocations: new Set(memberCatches.map(c => c.location.name)).size,
        uniqueSpecies: new Set(memberCatches.map(c => c.species)).size,
      },
    };
  }).sort((a, b) => b.stats.totalCatches - a.stats.totalCatches);

  const getAchievementBadges = (stats: typeof memberStats[0]['stats']) => {
    const badges = [];
    
    if (stats.totalCatches >= 10) badges.push({ label: 'Pro Angler', icon: Trophy });
    if (stats.uniqueSpecies >= 5) badges.push({ label: 'Species Hunter', icon: Fish });
    if (stats.uniqueLocations >= 3) badges.push({ label: 'Explorer', icon: MapPin });
    if (stats.biggestCatch >= 10) badges.push({ label: 'Big Catch', icon: Scale });
    
    return badges;
  };

  return (
    <div className="space-y-8">
      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 h-48">
        {memberStats.slice(0, 3).map((stat, index) => {
          const height = index === 1 ? 'h-48' : index === 0 ? 'h-40' : 'h-32';
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
          
          return (
            <div
              key={stat.member.id}
              className={`relative flex flex-col items-center ${height}`}
            >
              <div className="absolute -top-2 text-2xl">{medal}</div>
              <div className="flex-1 w-24 bg-muted rounded-t-lg flex items-end justify-center p-2">
                <Avatar className="h-16 w-16 border-4 border-background">
                  <AvatarImage src={stat.member.avatar} alt={stat.member.name} />
                  <AvatarFallback>{stat.member.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="w-full bg-card p-2 text-center rounded-b-lg">
                <div className="font-medium truncate">{stat.member.name}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.stats.totalCatches} catches
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="space-y-4">
        {memberStats.map((stat, index) => (
          <div
            key={stat.member.id}
            className="flex items-start gap-4 p-4 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className="text-lg font-medium text-muted-foreground">
                #{index + 1}
              </div>
              <Avatar>
                <AvatarImage src={stat.member.avatar} alt={stat.member.name} />
                <AvatarFallback>{stat.member.name[0]}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-2">
              <div className="font-medium">{stat.member.name}</div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Fish className="h-4 w-4" />
                  <span>{stat.stats.totalCatches} catches</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Scale className="h-4 w-4" />
                  <span>{stat.stats.biggestCatch} lbs best</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{stat.stats.uniqueLocations} locations</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>{stat.stats.uniqueSpecies} species</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {getAchievementBadges(stat.stats).map((badge, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    <badge.icon className="h-3 w-3" />
                    {badge.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}