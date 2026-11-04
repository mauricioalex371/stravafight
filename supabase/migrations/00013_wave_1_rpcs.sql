-- ==============================================================================
-- STRAVA FIGHT — Migration 00013: RPCs para Wave 1 (Likes, Comments, Followers)
-- Stored Procedures para incrementar/decrementar contadores de forma atômica
-- ==============================================================================

-- ==========================================
-- POST LIKES
-- ==========================================

CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- POST COMMENTS
-- ==========================================

CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET comments_count = comments_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- FOLLOWERS
-- ==========================================

CREATE OR REPLACE FUNCTION increment_follower_counts(follower_user_id UUID, following_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Incrementa following_count do seguidor
  UPDATE profiles SET following_count = following_count + 1 WHERE id = follower_user_id;
  -- Incrementa followers_count do seguido
  UPDATE profiles SET followers_count = followers_count + 1 WHERE id = following_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_follower_counts(follower_user_id UUID, following_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Decrementa following_count do seguidor
  UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = follower_user_id;
  -- Decrementa followers_count do seguido
  UPDATE profiles SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = following_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- COMMENT LIKES (para Wave 2, já preparado)
-- ==========================================

CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE post_comments SET likes_count = likes_count + 1 WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE post_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- CONVERSATION UPDATES
-- ==========================================

CREATE OR REPLACE FUNCTION update_conversation_timestamp(conversation_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE conversations SET updated_at = NOW() WHERE id = conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- GRANTS: Permitir que usuários autenticados executem as funções
-- ==============================================================================

GRANT EXECUTE ON FUNCTION increment_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_post_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_follower_counts(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_follower_counts(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_comment_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_comment_likes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_conversation_timestamp(UUID) TO authenticated;

-- ==============================================================================
-- FIM DA MIGRATION
-- ==============================================================================
