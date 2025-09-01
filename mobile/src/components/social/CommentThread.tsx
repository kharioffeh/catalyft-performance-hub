import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '../../types/social';
import { formatRelativeTime } from '../../utils/formatters';

interface CommentThreadProps {
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, text: string, parentId?: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => void;
  onProfilePress: (userId: string) => void;
  currentUserId: string;
  isLoading?: boolean;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  postId,
  comments,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onProfilePress,
  currentUserId,
  isLoading = false,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const inputRef = useRef<TextInput>(null);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(postId, commentText.trim(), replyingTo || undefined);
      setCommentText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment.id);
    inputRef.current?.focus();
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const renderComment = ({ item, isReply = false }: { item: Comment; isReply?: boolean }) => {
    const replies = comments.filter(c => c.parentId === item.id);
    const hasReplies = replies.length > 0;
    const areRepliesExpanded = expandedReplies.has(item.id);

    return (
      <View style={[styles.commentContainer, isReply && styles.replyContainer]}>
        <TouchableOpacity onPress={() => onProfilePress(item.userId)}>
          <Image
            source={{ uri: item.user?.profilePicture || 'https://via.placeholder.com/32' }}
            style={[styles.avatar, isReply && styles.replyAvatar]}
          />
        </TouchableOpacity>

        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <TouchableOpacity onPress={() => onProfilePress(item.userId)}>
              <Text style={styles.userName}>
                {item.user?.fullName || item.user?.username || 'Unknown'}
              </Text>
            </TouchableOpacity>
            {item.user?.isVerified && (
              <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
            )}
            <Text style={styles.timestamp}>{formatRelativeTime(item.createdAt)}</Text>
          </View>

          <Text style={styles.commentText}>{item.text}</Text>

          <View style={styles.commentActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onLikeComment(item.id)}
            >
              <Ionicons
                name={item.isLiked ? 'heart' : 'heart-outline'}
                size={16}
                color={item.isLiked ? '#FF6B6B' : '#666'}
              />
              {item.likesCount > 0 && (
                <Text style={styles.actionText}>{item.likesCount}</Text>
              )}
            </TouchableOpacity>

            {!isReply && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleReply(item)}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#666" />
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
            )}

            {item.userId === currentUserId && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDeleteComment(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#666" />
              </TouchableOpacity>
            )}

            {hasReplies && !isReply && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleReplies(item.id)}
              >
                <Ionicons
                  name={areRepliesExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#666"
                />
                <Text style={styles.actionText}>
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Render nested replies */}
          {hasReplies && areRepliesExpanded && !isReply && (
            <View style={styles.repliesContainer}>
              {replies.map(reply => (
                <View key={reply.id}>
                  {renderComment({ item: reply, isReply: true })}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const parentComments = comments.filter(c => !c.parentId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No comments yet</Text>
          <Text style={styles.emptySubtext}>Be the first to comment!</Text>
        </View>
      ) : (
        <FlatList
          data={parentComments}
          renderItem={({ item }) => renderComment({ item })}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.commentsList}
        />
      )}

      {/* Comment Input */}
      <View style={styles.inputContainer}>
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>
              Replying to {comments.find(c => c.id === replyingTo)?.user?.username}
            </Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputRow}>
          <Image
            source={{ uri: 'https://via.placeholder.com/32' }}
            style={styles.inputAvatar}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
            placeholderTextColor="#999"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!commentText.trim() || isSubmitting) && styles.sendButtonDisabled
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  commentsList: {
    padding: 16,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  replyContainer: {
    marginLeft: 40,
    marginTop: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  repliesContainer: {
    marginTop: 12,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
  },
  replyingToText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
});