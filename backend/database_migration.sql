-- Bingo App Database Schema
-- Run this SQL in your Supabase SQL Editor to create the new tables

-- ============================================
-- CREATE BINGO BOARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bingo_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- CREATE BINGO BOARD ACTIVITIES (Junction Table)
-- ============================================
CREATE TABLE IF NOT EXISTS bingo_board_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID NOT NULL REFERENCES bingo_boards(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0 AND position < 25),
    UNIQUE(board_id, position),  -- Each position on a board must be unique
    UNIQUE(board_id, activity_id)  -- Each activity can only appear once per board
);

-- ============================================
-- CREATE USER BOARD PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_board_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    board_id UUID NOT NULL REFERENCES bingo_boards(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, board_id, activity_id)  -- User can only complete each activity once per board
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bingo_boards_active ON bingo_boards(is_active);
CREATE INDEX IF NOT EXISTS idx_board_activities_board ON bingo_board_activities(board_id);
CREATE INDEX IF NOT EXISTS idx_board_activities_position ON bingo_board_activities(board_id, position);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_board_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_board ON user_board_progress(board_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_board ON user_board_progress(user_id, board_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_activity ON submissions(user_id, activity_id);

-- Drop status column if it exists (no longer used)
ALTER TABLE submissions DROP COLUMN IF EXISTS status;

-- Make image_url nullable (not all activities require an image)
ALTER TABLE submissions ALTER COLUMN image_url DROP NOT NULL;

-- Drop image_url column (no longer used)
ALTER TABLE submissions DROP COLUMN IF EXISTS image_url;

-- ============================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE bingo_boards IS 'Stores different bingo board configurations with 25 activities each';
COMMENT ON TABLE bingo_board_activities IS 'Links activities to specific positions on bingo boards (0-24)';
COMMENT ON TABLE user_board_progress IS 'Tracks which activities users have completed on each board';

-- ============================================
-- SAMPLE DATA (OPTIONAL - Remove if not needed)
-- ============================================
-- Create a sample bingo board
-- Note: You need to have at least 25 activities in your activities table first
-- Uncomment the following lines and replace with actual activity IDs

/*
INSERT INTO bingo_boards (title, description) 
VALUES ('First Bingo Challenge', 'Complete 25 fun activities to win!');

-- Get the board ID
DO $$
DECLARE
    board_uuid UUID;
    activity_ids UUID[];
BEGIN
    -- Get the board ID we just created
    SELECT id INTO board_uuid FROM bingo_boards WHERE title = 'First Bingo Challenge';
    
    -- Get first 25 activity IDs
    SELECT ARRAY(SELECT id FROM activities LIMIT 25) INTO activity_ids;
    
    -- Insert board activities for positions 0-24
    FOR i IN 0..24 LOOP
        INSERT INTO bingo_board_activities (board_id, activity_id, position)
        VALUES (board_uuid, activity_ids[i+1], i);
    END LOOP;
END $$;
*/
