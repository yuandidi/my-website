import { WEB_ROUTES } from '@my-blog/shared'

interface HotspotBase {
  label: string
  x: number
  y: number
}

export interface HutHotspot extends HotspotBase {
  kind: 'hut'
  id: 'hut'
}

export interface RegionHotspot extends HotspotBase {
  kind: 'region'
  id: string
  slug: string
}

export type WorldHotspot = HutHotspot | RegionHotspot

/** 分类 slug 与地图领地一一对应；坐标可按视觉再微调 */
export const WORLD_HOTSPOTS: WorldHotspot[] = [
  {
    kind: 'hut',
    id: 'hut',
    label: '秘密小屋',
    x: 28,
    y: 58,
  },
  {
    kind: 'region',
    id: 'tech',
    slug: 'tech',
    label: '北境工坊城',
    x: 68,
    y: 28,
  },
  {
    kind: 'region',
    id: 'notes',
    slug: 'notes',
    label: '迷雾森林',
    x: 46,
    y: 48,
  },
  {
    kind: 'region',
    id: 'life',
    slug: 'life',
    label: '南岸村镇',
    x: 72,
    y: 68,
  },
]

export function getHotspotHref(spot: WorldHotspot): string {
  return spot.kind === 'hut' ? WEB_ROUTES.profile : WEB_ROUTES.category(spot.slug)
}

export function getRegionHotspots(): RegionHotspot[] {
  return WORLD_HOTSPOTS.filter((spot): spot is RegionHotspot => spot.kind === 'region')
}
