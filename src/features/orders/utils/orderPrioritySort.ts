/**
 * Order Priority Sorting System
 *
 * Implements the multi-tier priority queue for buyer & seller order views:
 * 1 🔴 Disputed                           -> Oldest dispute first
 * 2 🔴 Late                               -> Most overdue first
 * 3 🟠 Revision Requested                 -> Oldest request first
 * 4 🟠 In Progress (deadline approaching) -> Nearest deadline first (<= 24 hours)
 * 5 🟡 Delivered                          -> Oldest delivery first
 * 7 🟢 In Progress (not urgent)           -> Nearest deadline first (> 24 hours)
 * 8 ⚪ Completed                          -> Most recently completed first
 * 9 ⚫ Cancelled                          -> Most recently cancelled first
 */

export const URGENT_DEADLINE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface OrderPriorityRank {
  tier: number;
  sortValue: number;
}

/**
 * Resolves the numeric deadline timestamp from various order schemas
 */
export const getOrderDeadlineTime = (item: any): number | null => {
  if (!item) return null;
  const raw = item.raw || item;

  const deadlineStr = item.deadline || raw.deadline || item.dueDate || raw.dueDate || raw.deliveryDate;
  if (deadlineStr) {
    const parsed = new Date(deadlineStr).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  const createdAtStr = raw.createdAt || item.createdAt;
  const deliveryDays = Number(raw.deliveryTime ?? item.deliveryTime);
  if (createdAtStr && !isNaN(deliveryDays) && deliveryDays > 0) {
    const created = new Date(createdAtStr).getTime();
    if (!isNaN(created)) {
      return created + deliveryDays * 86400000;
    }
  }

  return null;
};

/**
 * Resolves the timestamp of when a dispute occurred
 */
export const getOrderDisputeTime = (item: any): number => {
  if (!item) return 0;
  const raw = item.raw || item;
  const dateStr =
    raw.dispute?.createdAt ||
    raw.disputeCreatedAt ||
    raw.disputedAt ||
    raw.updatedAt ||
    item.updatedAt ||
    raw.createdAt ||
    item.createdAt;

  if (dateStr) {
    const parsed = new Date(dateStr).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
};

/**
 * Resolves the timestamp of when a revision was requested
 */
export const getOrderRevisionTime = (item: any): number => {
  if (!item) return 0;
  const raw = item.raw || item;
  const dateStr =
    raw.revisionRequest?.createdAt ||
    raw.revision?.createdAt ||
    raw.revisionRequestedAt ||
    raw.updatedAt ||
    item.updatedAt ||
    raw.createdAt ||
    item.createdAt;

  if (dateStr) {
    const parsed = new Date(dateStr).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
};

/**
 * Resolves the timestamp of when deliverables were submitted
 */
export const getOrderDeliveredTime = (item: any): number => {
  if (!item) return 0;
  const raw = item.raw || item;
  const dateStr =
    raw.deliveredAt ||
    raw.delivery?.deliveredAt ||
    raw.deliveryDate ||
    raw.updatedAt ||
    item.updatedAt ||
    raw.createdAt ||
    item.createdAt;

  if (dateStr) {
    const parsed = new Date(dateStr).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
};

/**
 * Resolves the timestamp of when an order completed
 */
export const getOrderCompletedTime = (item: any): number => {
  if (!item) return 0;
  const raw = item.raw || item;
  const dateStr =
    raw.completedAt ||
    raw.updatedAt ||
    item.updatedAt ||
    raw.createdAt ||
    item.createdAt;

  if (dateStr) {
    const parsed = new Date(dateStr).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
};

/**
 * Resolves the timestamp of when an order was cancelled or failed
 */
export const getOrderCancelledTime = (item: any): number => {
  if (!item) return 0;
  const raw = item.raw || item;
  const dateStr =
    raw.cancelledAt ||
    raw.canceledAt ||
    raw.updatedAt ||
    item.updatedAt ||
    raw.createdAt ||
    item.createdAt;

  if (dateStr) {
    const parsed = new Date(dateStr).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
};

/**
 * Calculates the tier (1-9) and secondary numeric sort value for any order item
 */
export const getOrderPriorityRank = (item: any, now = Date.now()): OrderPriorityRank => {
  if (!item) return { tier: 99, sortValue: 0 };
  const raw = item.raw || item;

  const statusStr = String(item.status || raw.status || "inprogress").toLowerCase().trim();
  const isCompleted =
    statusStr === "completed" || statusStr === "complete" || Boolean(item.isCompleted || raw.isCompleted);
  const isCancelled = statusStr === "cancelled" || statusStr === "canceled" || statusStr === "failed";
  const isDisputed = statusStr === "disputed" || statusStr === "escalated_to_dispute";
  const isDelivered = statusStr === "delivered";
  const isRevision = statusStr === "revision" || statusStr === "in_revision";

  const deadlineTime = getOrderDeadlineTime(item);
  const isOverdue =
    !isCompleted &&
    !isCancelled &&
    !isDelivered &&
    !isRevision &&
    !isDisputed &&
    (statusStr === "late" || (deadlineTime !== null && deadlineTime < now));

  // 1 🔴 Disputed -> Oldest dispute first (ascending timestamp)
  if (isDisputed) {
    return {
      tier: 1,
      sortValue: getOrderDisputeTime(item),
    };
  }

  // 2 🔴 Late -> Most overdue first (earliest deadline = overdue for longest)
  if (isOverdue) {
    return {
      tier: 2,
      sortValue: deadlineTime !== null ? deadlineTime : 0,
    };
  }

  // 3 🟠 Revision Requested -> Oldest request first (ascending timestamp)
  if (isRevision) {
    return {
      tier: 3,
      sortValue: getOrderRevisionTime(item),
    };
  }

  // Active / In Progress checks:
  if (!isCompleted && !isCancelled && !isDelivered) {
    const isApproaching = deadlineTime !== null && deadlineTime - now <= URGENT_DEADLINE_WINDOW_MS;

    // 4 🟠 In Progress (deadline approaching <= 24h) -> Nearest deadline first
    if (isApproaching) {
      return {
        tier: 4,
        sortValue: deadlineTime,
      };
    }

    // (If not approaching, we check delivered first before priority 7)
  }

  // 5 🟡 Delivered -> Oldest delivery first (waiting longest for buyer review)
  if (isDelivered) {
    return {
      tier: 5,
      sortValue: getOrderDeliveredTime(item),
    };
  }

  // 7 🟢 In Progress (not urgent: > 24h away or unscheduled) -> Nearest deadline first
  if (!isCompleted && !isCancelled) {
    return {
      tier: 7,
      sortValue: deadlineTime !== null ? deadlineTime : Number.MAX_SAFE_INTEGER,
    };
  }

  // 8 ⚪ Completed -> Most recently completed first (descending timestamp)
  if (isCompleted) {
    return {
      tier: 8,
      sortValue: -getOrderCompletedTime(item),
    };
  }

  // 9 ⚫ Cancelled -> Most recently cancelled first (descending timestamp)
  if (isCancelled) {
    return {
      tier: 9,
      sortValue: -getOrderCancelledTime(item),
    };
  }

  return {
    tier: 7,
    sortValue: Number.MAX_SAFE_INTEGER,
  };
};

/**
 * Comparator function to sort orders by business priority rules
 */
export const compareOrdersByPriority = (a: any, b: any, now = Date.now()): number => {
  const rankA = getOrderPriorityRank(a, now);
  const rankB = getOrderPriorityRank(b, now);

  if (rankA.tier !== rankB.tier) {
    return rankA.tier - rankB.tier;
  }
  return rankA.sortValue - rankB.sortValue;
};

/**
 * Sorts an array of orders according to the prioritized queue without mutating the input
 */
export const sortOrdersByPriority = <T>(orders: T[], now = Date.now()): T[] => {
  if (!Array.isArray(orders) || orders.length <= 1) return orders || [];
  return [...orders].sort((a, b) => compareOrdersByPriority(a, b, now));
};
