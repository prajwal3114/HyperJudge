/**
 * Shared Enums and Constants
 * 
 * Note: While Prisma has DB-level enums, it's often useful to have JS constants
 * for use in application logic, validation, and testing.
 */

const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

const ProblemStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
};

const SubmissionStatus = {
  PENDING: 'PENDING',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  ACCEPTED: 'ACCEPTED',
  WRONG_ANSWER: 'WRONG_ANSWER',
  TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
  MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  COMPILATION_ERROR: 'COMPILATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

const OutboxEventStatus = {
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED',
};

module.exports = {
  Role,
  ProblemStatus,
  SubmissionStatus,
  OutboxEventStatus,
};
