export interface PremiumPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  badge?: string;
  featured?: boolean;
}
