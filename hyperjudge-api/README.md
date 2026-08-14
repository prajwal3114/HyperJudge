# HyperJudge Foundation

This project contains the complete database and configuration foundation for **HyperJudge**, a production-oriented online judge platform based on a high-level asynchronous worker architecture.

## FINAL PROJECT TREE

```text
hyperjudge-api/
│
├── src/
│   ├── app.js                          # Express app entrypoint stub
│   ├── config/
│   │   └── env.js                      # Joi environment validation
│   ├── constants/
│   │   └── enums.js                    # Core domain enums
│   ├── db/
│   │   └── prisma/
│   │       └── client.js               # Prisma client singleton
│   ├── events/
│   │   └── outbox/
│   │       └── publisher.js            # Outbox polling/Kafka publisher stub
│   ├── mongodb/
│   │   └── connection.js               # MongoDB connection wrapper
│   └── redis/
│       ├── index.js                    # Redis client multiplexer
│       └── cache.js                    # Cryptographic cache key generation
│
├── prisma/
│   ├── schema.prisma                   # Authoritative Database Schema
│   └── seed.js                         # Development seed script
│
├── docker-compose.yml                  # Infrastructure (PG, Redis, Mongo, Kafka)
├── .env.example                        # Environment variables template
├── package.json                        # Node.js dependencies
└── README.md                           # Architecture and setup guide
```

## DATABASE ER SUMMARY

The primary relational data store is **PostgreSQL**.
* **Users**: Authors of problems, makers of submissions.
* **Problems**: Contain problem definition and limits.
* **TestCases**: Associated with Problems, hold execution data.
* **Submissions**: The aggregate root of an execution attempt.
* **SubmissionTestCaseResults**: Individual result per testcase for a submission.
* **Contests & Leaderboard**: For competitive ranking.
* **OutboxEvents**: Stores transactional events (like `SubmissionCreated`) to be reliably published to Kafka.

## TABLE-BY-TABLE EXPLANATION

* `users`: Stores user identity, rating, and role. Uses UUID primary keys.
* `problems`: Stores problem metadata, time limit, memory limit. `slug` is unique.
* `test_cases`: Stores `input_data` and `expected_output`. A composite unique constraint on `(problem_id, sequence_number)` ensures deterministic ordering.
* `submissions`: Central table. Tracks status (`PENDING`, `RUNNING`, `ACCEPTED`, etc.), execution metrics. Has `version` for optimistic locking and `idempotency_key` for safe creation.
* `submission_test_case_results`: Stores fine-grained metrics for each testcase run in the sandbox. Unique on `(submission_id, testcase_id)`.
* `contests` & `leaderboard`: Standard ranking models. Leaderboard has composite unique constraint on `(contest_id, user_id)`.
* `outbox_events`: Implementation of the transactional outbox pattern to guarantee at-least-once delivery to Kafka.

## INDEX STRATEGY

1. `submissions(user_id, problem_id, created_at DESC)`: Rapid retrieval of a user's attempt history on a specific problem.
2. `submissions(status, created_at)`: Allows outbox/recovery routines to quickly find `PENDING` or stuck submissions.
3. `submission_test_case_results(submission_id)`: Needed to rapidly fetch all testcases for a specific submission view.
4. `test_cases(problem_id, sequence_number)`: Enables deterministic fetch of tests.
5. `leaderboard(contest_id, score DESC, penalty_time ASC)`: Optimizes paginated fetching of the contest ranking.
6. `outbox_events(status, created_at)`: Optimizes polling for unsent events.

## TRANSACTION STRATEGY

To ensure no Kafka events are lost:
1. `BEGIN`
2. Create `Submission` record.
3. Create `OutboxEvent` record containing the `SubmissionCreated` payload.
4. `COMMIT`
The Outbox Publisher will separately read this event and publish it to Kafka, guaranteeing *at-least-once* delivery.

## REDIS STRATEGY

Redis connections are strictly segregated by responsibility (`src/redis/index.js`):
1. **Cache**: Used for short-circuiting compilation/execution. The cache key includes `hash(source + problem limits + compiler version)`.
2. **PubSub**: Dedicated `pubClient` and `subClient` for streaming execution updates to WebSockets.
3. **RateLimit**: Used for token-bucket API rate limiting.
4. **Leaderboard**: To be used for in-memory Sorted Sets before persisting to PostgreSQL.

## MONGODB STRATEGY

MongoDB is configured as an **optional** adjunct datastore. It does not replace PostgreSQL.
Use cases:
* Storing large strings that exceed PostgreSQL row efficiency (e.g., massive `stdout` dumps, large editorial explanations).
* Logging non-transactional user analytics.
It is initialized via `src/mongodb/connection.js`.

## ENVIRONMENT VARIABLES

Configuration is enforced and validated using `Joi` in `src/config/env.js`.
Ensure you copy `.env.example` to `.env` and fill in:
* `DATABASE_URL`
* `REDIS_URL`
* `KAFKA_BROKERS`
* `JWT_SECRET`

## MIGRATION INSTRUCTIONS

To generate and push the database schema:
```bash
# 1. Start the PostgreSQL container
docker-compose up -d postgres

# 2. Run Prisma migrations
npx prisma migrate dev --name init
```

## SEED INSTRUCTIONS

To inject minimal development data (an admin user and a sample 'Two Sum' problem):
```bash
npm run db:seed
```
*Note: Do not automate hidden test case seeding in production.*

## WHAT I STILL NEED TO IMPLEMENT

As requested, this repository provides only the **database and project configuration foundation**. 
You still need to implement:
1. **API Routes** (e.g., `POST /submissions`)
2. **API Controllers** and business validation logic.
3. **Kafka Producer Implementation** (to read from `OutboxEvents` and push to topics).
4. **Worker Kafka Consumer** (to pull off the topic and invoke the Sandbox Engine).
5. **Worker Result Event Handling** (updating PG with `version` locking and publishing to Redis Pub/Sub).
6. **WebSocket Layer** (Socket.IO integration using the Redis adapter).
