-- =============================================================================
-- SupplyLens Migration 007: Master AI Chatbot, Conversations & Security Schema
-- Adds: ai_conversations, ai_messages, ai_memory, ai_usage_logs, ai_rate_limit_events, ai_feedback
-- =============================================================================

-- 1. AI Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Sourcing Consultation',
    context_snapshot JSONB DEFAULT '{}'::jsonb,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conv_biz ON ai_conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_conv_updated ON ai_conversations(updated_at DESC);

-- 2. AI Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    role VARCHAR(20) NOT NULL,   -- 'user', 'assistant', 'system'
    text TEXT NOT NULL,
    suggested_actions JSONB DEFAULT '[]'::jsonb,
    referenced_supplier_ids JSONB DEFAULT '[]'::jsonb,
    tool_calls JSONB DEFAULT '[]'::jsonb,
    tokens_used INTEGER DEFAULT 0,
    model_used VARCHAR(100) DEFAULT 'gemini-flash-lite-latest',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_msg_conv ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_msg_created ON ai_messages(created_at ASC);

-- 3. AI Memory & User Preferences
CREATE TABLE IF NOT EXISTS ai_memory (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE CASCADE,
    memory_type VARCHAR(50) NOT NULL, -- 'preference', 'constraint', 'priority', 'decision'
    key VARCHAR(100) NOT NULL,
    memory_value JSONB NOT NULL,
    confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, business_id, memory_type, key)
);
CREATE INDEX IF NOT EXISTS idx_ai_mem_user_biz ON ai_memory(user_id, business_id);

-- 4. AI Usage Logs (Token Accounting & Observability)
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id VARCHAR(36) REFERENCES businesses(id) ON DELETE SET NULL,
    conversation_id VARCHAR(36) REFERENCES ai_conversations(id) ON DELETE SET NULL,
    model VARCHAR(100) NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'success', -- 'success', 'rate_limited', 'error'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage_logs(created_at DESC);

-- 5. AI Rate Limit & Abuse Events
CREATE TABLE IF NOT EXISTS ai_rate_limit_events (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    ip_address VARCHAR(50),
    event_type VARCHAR(50) NOT NULL, -- 'per_minute_exceeded', 'per_day_tokens_exceeded', 'abuse_flag'
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_rate_events_user ON ai_rate_limit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_rate_events_created ON ai_rate_limit_events(created_at DESC);

-- 6. AI Response Feedback
CREATE TABLE IF NOT EXISTS ai_feedback (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL, -- 1 for thumbs up, -1 for thumbs down
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_msg ON ai_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON ai_feedback(user_id);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies for authenticated users
CREATE POLICY "Users can manage own AI conversations" ON ai_conversations
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view messages in own conversations" ON ai_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage own AI memory" ON ai_memory
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own usage logs" ON ai_usage_logs
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage own AI feedback" ON ai_feedback
    FOR ALL USING (auth.uid()::text = user_id);
