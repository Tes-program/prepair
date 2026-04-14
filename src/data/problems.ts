import type { Problem } from '@/types';

export const PROBLEMS: Problem[] = [
  // ── DSA (8) ──────────────────────────────────────────────
  {
    id: 'dsa1',
    title: 'Two Sum',
    type: 'DSA',
    diff: 'Easy',
    tags: ['Arrays', 'Hash Map'],
    week: 1,
    url: 'https://leetcode.com/problems/two-sum',
    description:
      'Given an integer array and target, return indices of two numbers that sum to target. Aim for O(n) using a hash map.',
  },
  {
    id: 'dsa2',
    title: 'Sliding Window Maximum',
    type: 'DSA',
    diff: 'Hard',
    tags: ['Deque', 'Sliding Window'],
    week: 1,
    url: 'https://leetcode.com/problems/sliding-window-maximum',
    description:
      'Return max value in each sliding window of size k. Aim for O(n) using a monotonic deque.',
  },
  {
    id: 'dsa3',
    title: 'Valid Parentheses',
    type: 'DSA',
    diff: 'Easy',
    tags: ['Stack', 'String'],
    week: 2,
    url: 'https://leetcode.com/problems/valid-parentheses',
    description:
      'Given a string of brackets, return true if every open bracket is closed in the correct order. Use a stack.',
  },
  {
    id: 'dsa4',
    title: 'Merge Intervals',
    type: 'DSA',
    diff: 'Medium',
    tags: ['Arrays', 'Sorting'],
    week: 2,
    url: 'https://leetcode.com/problems/merge-intervals',
    description:
      'Given a list of intervals, merge all overlapping ones and return the result.',
  },
  {
    id: 'dsa5',
    title: 'LRU Cache',
    type: 'DSA',
    diff: 'Medium',
    tags: ['Design', 'LinkedHashMap'],
    week: 3,
    url: 'https://leetcode.com/problems/lru-cache',
    description:
      'Design a data structure for an LRU cache supporting O(1) get and put. In Java, LinkedHashMap is the idiomatic solution.',
  },
  {
    id: 'dsa6',
    title: 'Binary Tree Level Order Traversal',
    type: 'DSA',
    diff: 'Medium',
    tags: ['BFS', 'Trees'],
    week: 3,
    url: 'https://leetcode.com/problems/binary-tree-level-order-traversal',
    description:
      'Return the level-order traversal of a binary tree as a list of lists. Use BFS with a queue.',
  },
  {
    id: 'dsa7',
    title: 'Coin Change',
    type: 'DSA',
    diff: 'Medium',
    tags: ['DP'],
    week: 4,
    url: 'https://leetcode.com/problems/coin-change',
    description:
      'Given coins and an amount, return the fewest coins needed to make up that amount. Use bottom-up DP.',
  },
  {
    id: 'dsa8',
    title: 'Find All Anagrams in a String',
    type: 'DSA',
    diff: 'Medium',
    tags: ['Sliding Window', 'Hash Map'],
    week: 4,
    url: 'https://leetcode.com/problems/find-all-anagrams-in-a-string',
    description:
      'Find all starting indices of anagrams of pattern p in string s. Use a fixed-size sliding window with character frequency maps.',
  },

  // ── System Design (8) ────────────────────────────────────
  {
    id: 'sd1',
    title: 'Design a URL Shortener',
    type: 'SD',
    diff: 'Medium',
    tags: ['Hashing', 'Caching', 'DB Design'],
    week: 1,
    description:
      'Design a service like bit.ly handling 100M URLs and 10B redirects/day. Cover: unique ID generation, database schema, caching strategy, redirect latency optimisation.',
  },
  {
    id: 'sd2',
    title: 'Design a Rate Limiter',
    type: 'SD',
    diff: 'Medium',
    tags: ['Redis', 'API Design', 'Distributed'],
    week: 1,
    description:
      'Design a distributed rate limiter for a fintech API gateway. Support per-user and per-endpoint limits. Evaluate token bucket vs sliding window and Redis-based distributed state.',
  },
  {
    id: 'sd3',
    title: 'Design a Notification System',
    type: 'SD',
    diff: 'Medium',
    tags: ['WebSockets', 'Queue', 'Push'],
    week: 2,
    description:
      'Design a multi-channel notification system (push, SMS, email) handling 1M+ notifications/day. Cover delivery guarantees, retry logic, deduplication, and user preferences.',
  },
  {
    id: 'sd4',
    title: 'Design a Payment Processing System',
    type: 'SD',
    diff: 'Hard',
    tags: ['Fintech', 'ACID', 'Idempotency'],
    week: 2,
    description:
      'Design a payment system covering initiation, processing, settlement, and refunds. Critical requirements: idempotency keys, ACID guarantees, audit logging, failure recovery, and reconciliation.',
  },
  {
    id: 'sd5',
    title: 'Design a Distributed Cache',
    type: 'SD',
    diff: 'Medium',
    tags: ['Redis', 'Eviction', 'CDN'],
    week: 3,
    description:
      'Design a distributed caching layer. Compare cache-aside, write-through, write-behind. Cover eviction policies, cache invalidation, and consistent hashing for node distribution.',
  },
  {
    id: 'sd6',
    title: 'Design a Social Activity Feed',
    type: 'SD',
    diff: 'Medium',
    tags: ['Fan-out', 'Timeline', 'Pagination'],
    week: 3,
    description:
      'Design an activity feed for a fintech app handling 10M users with real-time updates. Compare fan-out-on-write vs fan-out-on-read and justify the choice.',
  },
  {
    id: 'sd7',
    title: 'Design Search Autocomplete',
    type: 'SD',
    diff: 'Medium',
    tags: ['Trie', 'Caching', 'Ranking'],
    week: 4,
    description:
      'Design a type-ahead search handling 100M queries/day under 100ms. Cover Trie prefix matching, result caching, ranking by frequency, and CDN distribution.',
  },
  {
    id: 'sd8',
    title: 'Design Bulk Transfer & Reconciliation',
    type: 'SD',
    diff: 'Hard',
    tags: ['Fintech', 'Batch', 'Consistency'],
    week: 4,
    description:
      'Design a bulk money transfer system for payroll/mass disbursements (100K transfers/batch). Cover idempotency, partial failure recovery, bank partner integration, reconciliation, and audit trails.',
  },

  // ── Database (4) ─────────────────────────────────────────
  {
    id: 'db1',
    title: 'Schema Design: Multi-tenant Fintech Platform',
    type: 'DB',
    diff: 'Medium',
    tags: ['Schema', 'Multi-tenancy', 'MySQL'],
    week: 1,
    description:
      'Design a MySQL schema for a multi-tenant fintech platform with wallets, transactions, and users across multiple businesses. Cover tenant isolation, normalisation, soft deletes, and referential integrity.',
  },
  {
    id: 'db2',
    title: 'Query Optimization & Indexing Deep Dive',
    type: 'DB',
    diff: 'Medium',
    tags: ['Indexes', 'EXPLAIN', 'B-Tree'],
    week: 2,
    description:
      'Optimise a slow MySQL query on a 50M-row transactions table using EXPLAIN, composite/covering indexes, and query restructuring. Explain B-tree internals, selectivity, and avoiding full table scans.',
  },
  {
    id: 'db3',
    title: 'ACID Transactions & Isolation Levels',
    type: 'DB',
    diff: 'Medium',
    tags: ['Transactions', 'MVCC', 'Deadlocks'],
    week: 3,
    description:
      'Implement a wallet-to-wallet transfer in MySQL preventing double-spending under concurrent load. Cover isolation levels, pessimistic vs optimistic locking, and MVCC.',
  },
  {
    id: 'db4',
    title: 'Sharding vs Replication Strategies',
    type: 'DB',
    diff: 'Hard',
    tags: ['Sharding', 'CAP Theorem'],
    week: 4,
    description:
      'Design a data distribution strategy for MySQL handling 1B transactions/year. Compare horizontal sharding vs master-slave vs master-master replication. Address query routing and cross-shard transactions.',
  },
];
