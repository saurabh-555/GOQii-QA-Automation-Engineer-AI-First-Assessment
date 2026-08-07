-- Task 6 — SQL Challenge
-- Assumed table:
-- UserActivity (user_id INT, activity VARCHAR, steps INT, created_date TIMESTAMP)
--
-- Dialect: written for PostgreSQL; noted where MySQL syntax differs.

-- =========================================================
-- 1. Return the latest activity record for every user
-- =========================================================
-- Approach: window function ROW_NUMBER() partitioned by user, ordered by
-- most recent created_date, then keep only rank 1 per user. This handles
-- ties (same timestamp) deterministically by also ordering on a tiebreaker
-- if one exists (e.g., an id column) — add one if available.

SELECT user_id, activity, steps, created_date
FROM (
    SELECT
        user_id,
        activity,
        steps,
        created_date,
        ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY created_date DESC
        ) AS rn
    FROM UserActivity
) ranked
WHERE rn = 1;


-- =========================================================
-- 2. Find users who completed more than 10,000 steps today
-- =========================================================
-- Approach: aggregate steps per user for rows whose created_date falls on
-- today's calendar date, then filter on the summed total. Summing (rather
-- than filtering single rows) matters if a user has multiple activity
-- records logged today that should be added together.

SELECT user_id, SUM(steps) AS total_steps_today
FROM UserActivity
WHERE created_date >= CURRENT_DATE
  AND created_date <  CURRENT_DATE + INTERVAL '1 day'
GROUP BY user_id
HAVING SUM(steps) > 10000;

-- MySQL equivalent for the date filter:
-- WHERE DATE(created_date) = CURDATE()


-- =========================================================
-- 3. Calculate total weekly steps for each user
-- =========================================================
-- Approach: bucket rows into ISO calendar weeks, then sum steps per
-- user per week. DATE_TRUNC is Postgres-specific; MySQL alternative shown
-- below. This assumes "weekly" means calendar week rather than a rolling
-- 7-day window — call this out as an assumption if the business means the
-- latter, since the query would differ (rolling window needs a self-join
-- or a window function with a range frame instead of GROUP BY).

SELECT
    user_id,
    DATE_TRUNC('week', created_date) AS week_start,
    SUM(steps) AS total_weekly_steps
FROM UserActivity
GROUP BY user_id, DATE_TRUNC('week', created_date)
ORDER BY user_id, week_start;

-- MySQL equivalent (weeks starting Monday):
-- SELECT user_id,
--        DATE_SUB(DATE(created_date), INTERVAL WEEKDAY(created_date) DAY) AS week_start,
--        SUM(steps) AS total_weekly_steps
-- FROM UserActivity
-- GROUP BY user_id, week_start
-- ORDER BY user_id, week_start;


-- =========================================================
-- 4. Identify duplicate activity records
-- =========================================================
-- Approach: "duplicate" is assumed to mean the same user, same activity,
-- same step count, and same timestamp appearing more than once — i.e., a
-- true repeated row rather than two genuinely different activities that
-- happen to share a timestamp. Adjust the PARTITION BY columns if the
-- business definition of "duplicate" is narrower (e.g., just user_id +
-- created_date regardless of activity/steps).

SELECT user_id, activity, steps, created_date, COUNT(*) AS occurrences
FROM UserActivity
GROUP BY user_id, activity, steps, created_date
HAVING COUNT(*) > 1;

-- To retrieve the actual duplicate rows (not just the summary) for
-- inspection or cleanup, use ROW_NUMBER() instead:
--
-- SELECT *
-- FROM (
--     SELECT *,
--            ROW_NUMBER() OVER (
--                PARTITION BY user_id, activity, steps, created_date
--                ORDER BY user_id
--            ) AS rn
--     FROM UserActivity
-- ) t
-- WHERE rn > 1;
