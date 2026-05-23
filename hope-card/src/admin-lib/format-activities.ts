export interface Activity {
  id: string;
  action: string;
  subject: string;
  time: string;
  type: string;
  status: string;
}

interface RawActivity {
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
    if (minutes >= 60 && hours < 24) {
      timeStr = `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (minutes >= 1 && minutes < 60) {
      timeStr = `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (days >= 1) {
      timeStr = `${days} day${days !== 1 ? "s" : ""} ago`;
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
    return {
      id: activity.id ?? Math.random().toString(),
      action: words.slice(0, -1).join(" "),
      subject: words.slice(-1)[0] ?? "",
      time: timeStr,
      type,
      status,
    };
  });
}
