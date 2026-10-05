export interface Room {
  id: string;
  title: string;
  description: string | null;
  address: string;
  streetAddress: string;
  provinceCode: string;
  wardCode: string;
  latitude: number;
  longitude: number;
  price: number;
  area: number;
  roomType: string;
  maxOccupants: number;
  electricPrice: number | null;
  waterPrice: number | null;
  deposit: number | null;
  imageUrl: string | null;
  imageUrls: string[];
  amenityIds: number[];
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
