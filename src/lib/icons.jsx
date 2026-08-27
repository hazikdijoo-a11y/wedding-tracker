import {
  Landmark, Utensils, Flower2, Camera, Video, Sparkles, Gem, Shirt, Mail, Music4,
  Car, BedDouble, Gift, Flame, Disc3, Flower, Hand, MoreHorizontal, Store,
} from 'lucide-react'

export const ICON_MAP = {
  landmark: Landmark,
  utensils: Utensils,
  'flower-2': Flower2,
  camera: Camera,
  video: Video,
  sparkles: Sparkles,
  gem: Gem,
  shirt: Shirt,
  mail: Mail,
  'music-4': Music4,
  car: Car,
  'bed-double': BedDouble,
  gift: Gift,
  flame: Flame,
  'disc-3': Disc3,
  flower: Flower,
  hand: Hand,
  'more-horizontal': MoreHorizontal,
  store: Store,
}

export function CategoryIcon({ name, ...props }) {
  const Icon = ICON_MAP[name] || Store
  return <Icon {...props} />
}
