export type CampaignStatus = 'Active' | 'Draft' | 'Completed' | 'Cancelled';

export interface Campaign {
  id: number;
  title: string;
  beneficiary: string;
  raised: number;
  goal: number;
  donors: number;
  endDate: string;
  status: CampaignStatus;
}