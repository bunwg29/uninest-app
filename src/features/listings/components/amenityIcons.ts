import {
  ArrowUpDown,
  Armchair,
  Bath,
  BedDouble,
  Bike,
  Cctv,
  CookingPot,
  DoorOpen,
  Lock,
  PanelTop,
  Refrigerator,
  ShieldCheck,
  Shirt,
  Snowflake,
  WashingMachine,
  Wifi,
  type LucideIcon,
} from 'lucide-react-native';

const AMENITY_ICONS: Record<number, LucideIcon> = {
  1: Snowflake,
  2: Refrigerator,
  3: WashingMachine,
  4: BedDouble,
  5: Armchair,
  6: Wifi,
  7: Bike,
  8: CookingPot,
  9: Shirt,
  10: DoorOpen,
  11: Cctv,
  12: ShieldCheck,
  13: Lock,
  14: Bath,
  15: PanelTop,
  16: ArrowUpDown,
};

export const getAmenityIcon = (amenityId: number): LucideIcon =>
  AMENITY_ICONS[amenityId] ?? ShieldCheck;
