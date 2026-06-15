'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '@/lib/types';

interface DocumentCommentsProps {
  comments: Comment[];
}

const commentTypeConfig = {
  comment: { icon: MessageSquare, color: '#71717A', label: 'Comment' },
  approval: { icon: CheckCircle2, color: '#10B981', label: 'Approved' },
  'change-request': { icon: AlertCircle, color: '#F59E0B', label: 'Changes Requested' },
};

export function DocumentComments({ comments }: DocumentCommentsProps) {
  const [newComment, setNewComment] = useState('');

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Comments ({comments.length})
      </h4>

      {/* Comment List */}
      <div className="space-y-3">
        {comments.map((comment, index) => {
          const config = commentTypeConfig[comment.type];
          const Icon = config.icon;
          const initials = comment.author.name
            .split(' ')
            .map((n) => n[0])
            .join('');

          return (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="space-y-2"
            >
              <div className="flex gap-2.5 p-3 rounded-lg bg-surface/50 border border-border/30">
                <Avatar className="h-7 w-7 flex-shrink-0">
                  <AvatarFallback className="text-[10px] bg-brand/20 text-brand-light">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{comment.author.name}</span>
                    {comment.type !== 'comment' && (
                      <Badge
                        variant="outline"
                        className="text-[10px] gap-1 h-5"
                        style={{ borderColor: `${config.color}40`, color: config.color }}
                      >
                        <Icon className="h-2.5 w-2.5" />
                        {config.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {comment.content}
                  </p>
                  <span className="text-[10px] text-muted-foreground/60 mt-1.5 inline-block">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 space-y-2">
                  {comment.replies.map((reply) => {
                    const replyInitials = reply.author.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('');
                    return (
                      <div
                        key={reply.id}
                        className="flex gap-2.5 p-2.5 rounded-lg bg-surface/30 border border-border/20"
                      >
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarFallback className="text-[9px] bg-surface-active text-muted-foreground">
                            {replyInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-xs font-medium">{reply.author.name}</span>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                            {reply.content}
                          </p>
                          <span className="text-[10px] text-muted-foreground/60 mt-1 inline-block">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {comments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center mb-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No comments yet</p>
          <p className="text-xs text-muted-foreground">Be the first to leave feedback.</p>
        </div>
      )}

      {/* Add Comment */}
      <div className="pt-2 border-t border-border/30">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment..."
          className="min-h-[72px] bg-surface/50 border-border/30 text-sm resize-none focus:border-brand/30"
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Request Changes
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs gap-1 bg-brand hover:bg-brand-light text-foreground"
            disabled={!newComment.trim()}
          >
            <Send className="h-3 w-3" />
            Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
