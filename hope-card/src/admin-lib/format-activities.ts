export interface Activity {
  id: string;
  action: string;
  subject: string;
  time: string;
  type: string;
  status: string;
}

export interface RawActivity {
  id?: string;
  action: string;
  description: string;
  created_at: string;
}

export function formatActivities(rawItems: RawActivity[]): Activity[] {
  return rawItems.map((activity) => {
    const createdAt = new Date(activity.created_at);
    const diff = Date.now() - createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    let timeStr = "just now";
    if (days >= 1) {
      timeStr = `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (hours >= 1) {
      timeStr = `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (minutes >= 1) {
      timeStr = `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    let type = "approval";
    let status = activity.action || "Activity";

    if (activity.action === "APPROVED") {
      type = "approval";
      status = "Approved";
    } else if (activity.action === "REJECTED") {
      type = "rejection";
      status = "Rejected";
    } else if (activity.action === "APPLIED") {
      type = "approval";
      status = "Applied";
    } else if (activity.action === "SENT") {
      type = "donation";
      status = "Sent";
    }

    const words = activity.description.split(" ");
    const action = words.length > 1 ? words.slice(0, -1).join(" ") : "";
    const subject = words.length > 0 ? words[words.length - 1] : "";
    return {
      id: activity.id ?? `fallback-${activity.description}-${activity.created_at}`,
      action,
      subject,
      time: timeStr,
      type,
      status,
    };
  });
}
