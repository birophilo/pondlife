import {
  SlidersHorizontal,
  Images,
  Brain,
  PersonStanding,
  BookOpenText,
  Timeline,
  Clock2,
  Ear,
  Clapperboard,
  Footprints
} from '@lucide/vue'

/** One Lucide icon per sim editor category in the left icon menu. */
export const SIM_CATEGORY_SECTIONS = [
  { id: 'agent-types', label: 'Agent Types', icon: PersonStanding },
  { id: 'agent-properties', label: 'Agent Properties', icon: BookOpenText },
  { id: 'actions', label: 'Actions', icon: Footprints },
  { id: 'recurring-changes', label: 'Recurring Changes', icon: Clock2 },
  { id: 'conditions', label: 'Conditions', icon: Timeline },
  { id: 'properties', label: 'Properties', icon: SlidersHorizontal },
  { id: 'sprite-sheets', label: 'Sprite Sheets', icon: Images },
  { id: 'animation-sets', label: 'Animation Sets', icon: Clapperboard },
  { id: 'sensors', label: 'Sensors', icon: Ear },
  { id: 'utility-functions', label: 'Utility Functions', icon: Brain }
]
