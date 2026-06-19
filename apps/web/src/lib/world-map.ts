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

/** 地图热点；新增分类后在此补充 region 条目 */
export const WORLD_HOTSPOTS: WorldHotspot[] = [
  {
    kind: 'hut',
    id: 'hut',
    label: '小屋',
    x: 28,
    y: 58,
  },
]

export function getHotspotHref(spot: WorldHotspot): string {
  return spot.kind === 'hut' ? WEB_ROUTES.profile : WEB_ROUTES.category(spot.slug)
}

export function getRegionHotspots(): RegionHotspot[] {
  return WORLD_HOTSPOTS.filter((spot): spot is RegionHotspot => spot.kind === 'region')
}
