export const dashboardStats = [
  { id: 1, title: "Total Beneficiaries", value: "1,234", icon: "Users" },
  { id: 2, title: "Pending Approvals", value: "47", icon: "CheckCircle" },
  { id: 3, title: "Total Donations Sent", value: "₱2.5M", icon: "DollarSign" },
  { id: 4, title: "Active Campaigns", value: "18", icon: "Target" },
];

export const recentActivities = [
  {
    id: 1,
    time: "10 minutes ago",
    action: "Approved Digital Donor registration for",
    subject: "Maria Santos",
    status: "Approved",
    type: "approval",
  },
  {
    id: 2,
    time: "25 minutes ago",
    action: "Sent donation to beneficiary",
    subject: "Juan dela Cruz",
    status: "Sent",
    type: "donation",
  },
  {
    id: 3,
    time: "1 hour ago",
    action: "Rejected Campaign Manager application from",
    subject: "ABC Foundation",
    status: "Rejected",
    type: "rejection",
  },
];

export const notifications = [
  {
    id: 1,
    time: "5 minutes ago",
    title: "New Digital Donor Application",
    message: "Maria Santos has applied as a Digital Donor",
    type: "application",
    read: false,
  },
  {
    id: 2,
    time: "15 minutes ago",
    title: "Beneficiary Approval",
    message: "Juan dela Cruz has been approved as a beneficiary",
    type: "approval",
    read: false,
  },
  {
    id: 3,
    time: "30 minutes ago",
    title: "Campaign Manager Rejection",
    message: "ABC Foundation's application was rejected",
    type: "rejection",
    read: false,
  },
  {
    id: 4,
    time: "1 hour ago",
    title: "New Donation Received",
    message: "A donation of ₱5,000 was received from Anonymous Donor",
    type: "donation",
    read: true,
  },
  {
    id: 5,
    time: "2 hours ago",
    title: "Campaign Update",
    message: "Health Fund Campaign has reached its goal",
    type: "campaign",
    read: true,
  },
];