import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useCommentStore } from '@/lib/stores/comment-store';
import type { Comment, User } from '@/lib/types';

interface CatchCommentsProps {
  catchId: string;
  comments: Comment[];
  groupMembers: User[];
  currentUser: User;
}

export function CatchComments({
  catchId,
  comments,
  groupMembers,
  currentUser,
}: CatchCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const { createComment, isLoading } = useCommentStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isLoading) return;
    
    try {
      await createComment(catchId, newComment.trim(), currentUser.id);
      setNewComment('');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const getMemberById = (userId: string) => {
    return groupMembers.find(member => member.id === userId);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Comments</h4>
      
      <div className="space-y-4">
        {comments.map((comment) => {
          const member = getMemberById(comment.userId);
          if (!member) return null;

          return (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), 'PP')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {comment.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="self-end"
          disabled={!newComment.trim() || isLoading}
        >
          Post Comment
        </Button>
      </form>
    </div>
  );
}