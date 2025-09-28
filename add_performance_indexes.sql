-- Performance optimization indexes for Anesthesia Internship Tracker
-- Run this after the main schema is created

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON User(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON User(role);
CREATE INDEX IF NOT EXISTS idx_user_idnumber ON User(idNumber);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON User(createdAt);

-- LogEntry table indexes (most critical for performance)
CREATE INDEX IF NOT EXISTS idx_logentry_intern_date ON LogEntry(internId, date DESC);
CREATE INDEX IF NOT EXISTS idx_logentry_procedure_date ON LogEntry(procedureId, date DESC);
CREATE INDEX IF NOT EXISTS idx_logentry_created_at ON LogEntry(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_logentry_intern_procedure ON LogEntry(internId, procedureId);

-- Verification table indexes
CREATE INDEX IF NOT EXISTS idx_verification_status ON Verification(status);
CREATE INDEX IF NOT EXISTS idx_verification_verifier ON Verification(verifierId);
CREATE INDEX IF NOT EXISTS idx_verification_timestamp ON Verification(timestamp DESC);

-- Procedure table indexes
CREATE INDEX IF NOT EXISTS idx_procedure_rotation ON Procedure(rotationId);
CREATE INDEX IF NOT EXISTS idx_procedure_name ON Procedure(name);

-- Rotation table indexes
CREATE INDEX IF NOT EXISTS idx_rotation_active ON Rotation(isActive);
CREATE INDEX IF NOT EXISTS idx_rotation_state ON Rotation(state);

-- Requirement table indexes
CREATE INDEX IF NOT EXISTS idx_requirement_rotation ON Requirement(rotationId);
CREATE INDEX IF NOT EXISTS idx_requirement_procedure ON Requirement(procedureId);

-- Case table indexes
CREATE INDEX IF NOT EXISTS idx_case_category ON Case(category);
CREATE INDEX IF NOT EXISTS idx_case_created_at ON Case(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_case_author ON Case(authorId);

-- Comment table indexes
CREATE INDEX IF NOT EXISTS idx_comment_case ON Comment(caseId);
CREATE INDEX IF NOT EXISTS idx_comment_author ON Comment(authorId);
CREATE INDEX IF NOT EXISTS idx_comment_parent ON Comment(parentId);
CREATE INDEX IF NOT EXISTS idx_comment_created_at ON Comment(createdAt DESC);

-- Favorite table indexes
CREATE INDEX IF NOT EXISTS idx_favorite_user ON Favorite(userId);
CREATE INDEX IF NOT EXISTS idx_favorite_case ON Favorite(caseId);

-- QuizResult table indexes
CREATE INDEX IF NOT EXISTS idx_quizresult_intern ON QuizResult(internId);
CREATE INDEX IF NOT EXISTS idx_quizresult_item ON QuizResult(itemId, itemType);
CREATE INDEX IF NOT EXISTS idx_quizresult_created_at ON QuizResult(createdAt DESC);

-- Reflection table indexes
CREATE INDEX IF NOT EXISTS idx_reflection_intern ON Reflection(internId);
CREATE INDEX IF NOT EXISTS idx_reflection_item ON Reflection(itemId, itemType);
CREATE INDEX IF NOT EXISTS idx_reflection_created_at ON Reflection(createdAt DESC);

-- MentorFeedback table indexes
CREATE INDEX IF NOT EXISTS idx_mentorfeedback_intern ON MentorFeedback(internId);
CREATE INDEX IF NOT EXISTS idx_mentorfeedback_mentor ON MentorFeedback(mentorId);
CREATE INDEX IF NOT EXISTS idx_mentorfeedback_item ON MentorFeedback(itemId, itemType);
CREATE INDEX IF NOT EXISTS idx_mentorfeedback_read ON MentorFeedback(isRead);
CREATE INDEX IF NOT EXISTS idx_mentorfeedback_created_at ON MentorFeedback(createdAt DESC);

-- TutorFavoriteIntern table indexes
CREATE INDEX IF NOT EXISTS idx_tutorfavorite_tutor ON TutorFavoriteIntern(tutorId);
CREATE INDEX IF NOT EXISTS idx_tutorfavorite_intern ON TutorFavoriteIntern(internId);

-- ProcedureKnowledgeFavorite table indexes
CREATE INDEX IF NOT EXISTS idx_procknowledgefavorite_user ON ProcedureKnowledgeFavorite(userId);
CREATE INDEX IF NOT EXISTS idx_procknowledgefavorite_item ON ProcedureKnowledgeFavorite(itemId, itemType);

-- Audit table indexes
CREATE INDEX IF NOT EXISTS idx_audit_actor ON Audit(actorUserId);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON Audit(entity, entityId);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON Audit(timestamp DESC);

-- Session table indexes
CREATE INDEX IF NOT EXISTS idx_session_token ON Session(sessionToken);
CREATE INDEX IF NOT EXISTS idx_session_user ON Session(userId);
CREATE INDEX IF NOT EXISTS idx_session_expires ON Session(expires);

-- Account table indexes
CREATE INDEX IF NOT EXISTS idx_account_user ON Account(userId);
CREATE INDEX IF NOT EXISTS idx_account_provider ON Account(provider, providerAccountId);

-- Topic table indexes
CREATE INDEX IF NOT EXISTS idx_topic_parent ON Topic(parentId);
CREATE INDEX IF NOT EXISTS idx_topic_title ON Topic(title);

-- Resource table indexes
CREATE INDEX IF NOT EXISTS idx_resource_topic ON Resource(topicId);
CREATE INDEX IF NOT EXISTS idx_resource_type ON Resource(type);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_logentry_intern_status ON LogEntry(internId, procedureId, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_verification_logentry_status ON Verification(logEntryId, status);
CREATE INDEX IF NOT EXISTS idx_case_category_created ON Case(category, createdAt DESC);

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_logentry_pending_verification 
ON LogEntry(internId, createdAt DESC) 
WHERE id IN (SELECT logEntryId FROM Verification WHERE status = 'PENDING');

CREATE INDEX IF NOT EXISTS idx_user_active_interns 
ON User(id, name, email) 
WHERE role = 'INTERN';

-- Analyze tables to update statistics
ANALYZE User;
ANALYZE LogEntry;
ANALYZE Verification;
ANALYZE Procedure;
ANALYZE Rotation;
ANALYZE Requirement;
ANALYZE Case;
ANALYZE Comment;
ANALYZE Favorite;
ANALYZE QuizResult;
ANALYZE Reflection;
ANALYZE MentorFeedback;
ANALYZE TutorFavoriteIntern;
ANALYZE ProcedureKnowledgeFavorite;
ANALYZE Audit;
ANALYZE Session;
ANALYZE Account;
ANALYZE Topic;
ANALYZE Resource;
