export interface OrderStatusInfo {
  label: string;
  className: string;
}

export const getOrderStatusInfo = (rawStatus?: string): OrderStatusInfo => {
  const normalized = (rawStatus || "in_progress").toLowerCase().trim().replace(/[\s-]+/g, "_");
  switch (normalized) {
    case "completed":
    case "complete":
      return {
        label: "Completed",
        className: "bg-[#eaf8f0] text-[#169c5e] border border-[#bbf0d2]",
      };
    case "delivered":
      return {
        label: "Delivered",
        className: "bg-[#eaf4f3] text-[#327C73] border border-[#c3e4e0]",
      };
    case "in_revision":
    case "revision":
      return {
        label: "In Revision",
        className: "bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa]",
      };
    case "in_progress":
    case "paid":
    case "pending":
      return {
        label: "In Progress",
        className: "bg-[#fffbeb] text-[#d97706] border border-[#fde68a]",
      };
    case "cancelled":
    case "canceled":
      return {
        label: "Cancelled",
        className: "bg-[#fef2f2] text-[#e11d48] border border-[#fecdd3]",
      };
    case "disputed":
      return {
        label: "Disputed",
        className: "bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]",
      };
    default:
      return {
        label: rawStatus || "In Progress",
        className: "bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]",
      };
  }
};

export default getOrderStatusInfo;
