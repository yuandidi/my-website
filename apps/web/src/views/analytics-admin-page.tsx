'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FantasyScroll } from '@/components/layout/fantasy-scroll'
import { useAnalyticsSummary } from '@/hooks/useAnalytics'
import { cn } from '@/lib/utils'

const PERIOD_OPTIONS = [7, 30] as const

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value)
}

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`)
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}

interface StatCardProps {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-none border-2 border-gold/30 bg-card/80 px-4 py-3 fantasy-pixel-shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl text-gold">{formatNumber(value)}</p>
    </div>
  )
}

interface BarChartProps {
  items: { label: string; value: number }[]
}

function BarChart({ items }: BarChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无数据</p>
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-muted-foreground">{item.label}</span>
            <span className="shrink-0 text-foreground">{formatNumber(item.value)}</span>
          </div>
          <div className="h-2 rounded-none border border-gold/20 bg-background/60">
            <div
              className="h-full bg-primary/80"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

interface RankListProps {
  items: { key: string; label: string; value: number }[]
  emptyText: string
}

function RankList({ items, emptyText }: RankListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>
  }

  return (
    <ol className="space-y-2 text-sm">
      {items.map((item, index) => (
        <li
          key={item.key}
          className="flex items-center justify-between gap-3 border-b border-gold/15 pb-2 last:border-b-0"
        >
          <span className="truncate">
            <span className="mr-2 text-muted-foreground">{index + 1}.</span>
            {item.label}
          </span>
          <span className="shrink-0 text-gold">{formatNumber(item.value)}</span>
        </li>
      ))}
    </ol>
  )
}

export function AnalyticsAdminPage() {
  const [days, setDays] = useState<(typeof PERIOD_OPTIONS)[number]>(7)
  const { data, isLoading, isError, error, refetch } = useAnalyticsSummary(days)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-gold">访问数据</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            仅统计公开页面访问与交互
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={days === option ? 'default' : 'outline'}
              onClick={() => setDays(option)}
            >
              近 {option} 天
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">加载统计数据…</p>
      )}

      {isError && (
        <div className="space-y-3">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : '加载失败'}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            重试
          </Button>
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="页面浏览 (PV)" value={data.totals.pageViews} />
            <StatCard label="独立访客 (UV)" value={data.totals.uniqueSessions} />
            <StatCard label="文章阅读" value={data.totals.postViews} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <FantasyScroll innerClassName="space-y-4">
              <h3 className="font-display text-lg text-gold">每日趋势</h3>
              <BarChart
                items={data.daily.map((item) => ({
                  label: formatDateLabel(item.date),
                  value: item.pageViews,
                }))}
              />
            </FantasyScroll>

            <FantasyScroll innerClassName="space-y-4">
              <h3 className="font-display text-lg text-gold">热门页面</h3>
              <RankList
                emptyText="暂无页面浏览记录"
                items={data.topPages.map((item) => ({
                  key: item.path,
                  label: item.path,
                  value: item.views,
                }))}
              />
            </FantasyScroll>

            <FantasyScroll innerClassName="space-y-4">
              <h3 className="font-display text-lg text-gold">热门文章</h3>
              <RankList
                emptyText="暂无文章阅读记录"
                items={data.topPosts.map((item) => ({
                  key: item.slug,
                  label: item.slug,
                  value: item.views,
                }))}
              />
            </FantasyScroll>

            <FantasyScroll innerClassName="space-y-4">
              <h3 className="font-display text-lg text-gold">标签筛选</h3>
              <RankList
                emptyText="暂无标签筛选记录"
                items={data.topTagFilters.map((item) => ({
                  key: item.slug,
                  label: item.slug,
                  value: item.clicks,
                }))}
              />
            </FantasyScroll>

            <FantasyScroll
              innerClassName={cn('space-y-4', data.topExternalLinks.length === 0 && 'lg:col-span-2')}
            >
              <h3 className="font-display text-lg text-gold">外链点击</h3>
              <RankList
                emptyText="暂无外链点击记录"
                items={data.topExternalLinks.map((item) => ({
                  key: `${item.href}:${item.label}`,
                  label: item.label || item.href,
                  value: item.clicks,
                }))}
              />
            </FantasyScroll>
          </div>
        </>
      )}
    </div>
  )
}
