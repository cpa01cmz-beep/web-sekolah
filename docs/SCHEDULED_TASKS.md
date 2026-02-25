# Scheduled Tasks

## Overview

The application uses **Cloudflare Workers Scheduled Events** for automated background task execution:

- **Cron Triggers**: Tasks run on defined schedules (e.g., every minute, hourly)
- **Scheduled Task Infrastructure**: Centralized task management via `worker/scheduled.ts`
- **Task Monitoring**: Execution tracking via `ScheduledTaskMonitor`
- **Integration Health**: Scheduled task metrics included in `/api/health` endpoint

## Current Scheduled Tasks

| Task Name                    | Schedule                   | Description                                |
| ---------------------------- | -------------------------- | ------------------------------------------ |
| `process-webhook-deliveries` | `* * * * *` (every minute) | Processes pending webhook delivery retries |

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Cloudflare     │────▶│  scheduled.ts   │────▶│ WebhookService  │
│  Cron Triggers  │     │  (Task Router)  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │ Integration     │
                       │ Monitor        │
                       └─────────────────┘
```

## Task Configuration

Tasks are defined in `worker/scheduled.ts`:

```typescript
const SCHEDULED_TASKS: ScheduledTaskConfig[] = [
  {
    name: 'process-webhook-deliveries',
    cron: '* * * * *',
    handler: async (env: Env) => {
      await WebhookService.processPendingDeliveries(env)
    },
  },
]
```

## Monitoring

Scheduled task execution metrics:

- **totalExecutions**: Total number of times task was executed
- **successfulExecutions**: Number of successful executions
- **failedExecutions**: Number of failed executions
- **totalDuration**: Cumulative execution time (ms)
- **lastExecution**: Timestamp of last execution
- **lastSuccess**: Timestamp of last successful execution
- **lastFailure**: Timestamp of last failed execution

Metrics available at `/api/health` endpoint:

```json
{
  "scheduledTasks": {
    "totalExecutions": 1440,
    "successfulExecutions": 1435,
    "failedExecutions": 5,
    "totalDuration": 8640000,
    "lastExecution": "2026-01-23T12:00:00.000Z",
    "lastSuccess": "2026-01-23T12:00:00.000Z",
    "lastFailure": "2026-01-23T11:45:00.000Z",
    "taskExecutions": {
      "process-webhook-deliveries": {
        "name": "process-webhook-deliveries",
        "totalExecutions": 1440,
        "successfulExecutions": 1435,
        "failedExecutions": 5
      }
    }
  }
}
```

## Webhook Delivery Automation

**Problem**: Before automated scheduling, webhook deliveries required manual triggering via POST `/api/admin/webhooks/process`

**Solution**: Automatic processing every minute via scheduled task

**Benefits**:

- Zero manual intervention required
- Consistent retry timing
- Reduced webhook delivery latency
- Failed deliveries automatically retried
- Dead letter queue for permanently failed deliveries

## Adding New Scheduled Tasks

To add a new scheduled task:

1. Define task in `worker/scheduled.ts`:

```typescript
const SCHEDULED_TASKS: ScheduledTaskConfig[] = [
  {
    name: 'my-task-name',
    cron: '0 * * * *', // Every hour
    handler: async (env: Env) => {
      // Your task logic here
    },
  },
]
```

2. Update `wrangler.toml` to add cron trigger:

```toml
[triggers]
crons = ["* * * * *", "0 * * * *"]
```

3. Task will be automatically matched and executed based on cron expression

## Cron Expression Format

Cloudflare Workers cron format:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-6, Sunday = 0)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

Common schedules:

| Schedule              | Cron Expression |
| --------------------- | --------------- |
| Every minute          | `* * * * *`     |
| Every hour            | `0 * * * *`     |
| Every day at midnight | `0 0 * * *`     |
| Every Monday at 9am   | `0 9 * * 1`     |

## Error Handling

Scheduled tasks have built-in error handling:

- **Error Logging**: All task failures logged with error details
- **Integration Monitoring**: Failed executions tracked in metrics
- **Non-blocking**: One task failure doesn't prevent other tasks from running
- **Duration Tracking**: Execution time tracked for performance monitoring

## Resilience Patterns

- **Idempotency**: Tasks designed to be safe to run multiple times
- **Timeout Protection**: Tasks respect Cloudflare Workers execution limits
- **Graceful Degradation**: Failed tasks don't crash the worker
- **Automatic Retry**: Failed tasks retried on next scheduled run
