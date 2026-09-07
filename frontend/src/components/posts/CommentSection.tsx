'use client';

import Link from 'next/link';
import { MessageSquare, Pencil, Trash2, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createComment, deleteComment, fetchComments, updateComment } from '@/lib/comments';
import { useAuthStore } from '@/store/useAuthStore';
import type { Comment } from '@/types/post';

interface CommentSectionProps {
  postId: number;
  initialComments?: Comment[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>(initialComments ?? []);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [commentsError, setCommentsError] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(!initialComments);
  const [commentsRetryKey, setCommentsRetryKey] = useState(0);

  useEffect(() => {
    if (initialComments) return;

    let cancelled = false;
    fetchComments(postId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch(() => {
        if (!cancelled) setCommentsError(true);
      })
      .finally(() => {
        if (!cancelled) setCommentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId, initialComments, commentsRetryKey]);

  const handleRetryComments = () => {
    setCommentsError(false);
    setCommentsLoading(true);
    setCommentsRetryKey((k) => k + 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const comment = await createComment(postId, content.trim());
      setComments((prev) => [...prev, comment]);
      setContent('');
      toast.success('댓글이 등록되었습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const canEditComment = (comment: Comment) =>
    isAuthenticated && user?.id === comment.authorId;

  const canDeleteComment = (comment: Comment) =>
    isAuthenticated && (user?.id === comment.authorId || user?.role === 'ADMIN');

  const handleStartEdit = (comment: Comment) => {
    if (!canEditComment(comment)) return;
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (commentId: number) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment || !canEditComment(comment)) return;
    if (!editContent.trim()) return;

    setUpdatingId(commentId);
    try {
      const updated = await updateComment(commentId, editContent.trim());
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      setEditingId(null);
      setEditContent('');
      toast.success('댓글이 수정되었습니다.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (commentId: number) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment || !canDeleteComment(comment)) return;
    if (!window.confirm('이 댓글을 삭제하시겠습니까?')) return;

    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      if (editingId === commentId) {
        setEditingId(null);
        setEditContent('');
      }
      toast.success('댓글이 삭제되었습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="comment">
      <h2 className="comment__title">
        <span className="icon-wrapper" aria-hidden>
          <MessageSquare className="icon-line" size={16} strokeWidth={1.5} />
        </span>
        댓글 ({comments.length})
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="comment__form">
          <textarea
            className="comment__input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요"
            rows={2}
            required
          />
          <button type="submit" className="comment__submit" disabled={submitting}>
            {submitting ? '등록 중...' : '등록'}
          </button>
        </form>
      ) : (
        <p className="comment__guest">
          로그인 후 댓글을 작성할 수 있습니다.{' '}
          <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="comment__login-link">
            로그인
          </Link>
        </p>
      )}

      <ul className="comment__list">
        {commentsError ? (
          <li className="comment__error">
            <p className="comment__error-text">댓글을 불러오지 못했습니다.</p>
            <button type="button" className="comment__retry" onClick={handleRetryComments} disabled={commentsLoading}>
              {commentsLoading ? '불러오는 중...' : '댓글 다시 불러오기'}
            </button>
          </li>
        ) : commentsLoading ? (
          <li className="comment__loading">댓글을 불러오는 중...</li>
        ) : (
          comments.map((comment) => {
            const canEdit = canEditComment(comment);
            const canDelete = canDeleteComment(comment);
            const isEditing = editingId === comment.id;

            return (
              <li key={comment.id} className="comment__item">
                <div className="comment__meta">
                  <span className="comment__avatar" aria-hidden>
                    {(comment.author.name ?? comment.author.email ?? '?').charAt(0).toUpperCase()}
                  </span>
                  <div className="comment__meta-text">
                    <span className="comment__author">{comment.author.name ?? comment.author.email}</span>
                    <span className="comment__date">
                      {new Date(comment.createdAt).toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="comment__edit">
                    <input
                      type="text"
                      className="comment__edit-input"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <div className="comment__edit-actions">
                      <button
                        type="button"
                        className="comment__action"
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={updatingId === comment.id}
                      >
                        {updatingId === comment.id ? '저장 중...' : '저장'}
                      </button>
                      <button type="button" className="comment__action" onClick={handleCancelEdit}>
                        <X className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="comment__body">{comment.content}</p>
                    {(canEdit || canDelete) && (
                      <div className="comment__actions">
                        {canEdit && (
                          <button type="button" className="comment__action" onClick={() => handleStartEdit(comment)}>
                            <Pencil className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
                            수정
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="comment__action"
                            onClick={() => handleDelete(comment.id)}
                            disabled={deletingId === comment.id}
                          >
                            <Trash2 className="icon-line" size={14} strokeWidth={1.5} aria-hidden />
                            {deletingId === comment.id ? '삭제 중...' : '삭제'}
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })
        )}
        {!commentsError && !commentsLoading && comments.length === 0 && (
          <li className="comment__empty">아직 댓글이 없습니다.</li>
        )}
      </ul>
    </section>
  );
}
