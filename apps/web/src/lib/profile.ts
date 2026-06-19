export interface ProfileLink {
  label: string
  href: string
}

export interface FeaturedPostRef {
  slug: string
  title: string
}

export const SITE_PROFILE = {
  name: '迪迪',
  title: '秘密小屋的守卷人',
  avatar: '/favicon.png',
  bio: `欢迎来到森林深处的秘密小屋。

这里是迪迪记录咒文笔记与旅途见闻的地方——**技术探索**、**生活碎片**与**随想随笔**，都被整理成一卷卷冒险日志。

如果你在世界地图上迷了路，记得回到小屋，翻翻档案就好。`,
  skills: ['React', 'TypeScript', 'NestJS', 'PostgreSQL', '写作'],
  links: [
    { label: 'GitHub', href: 'https://github.com/yuandidi' },
  ],
  featuredPosts: [
    {
      slug: 'fullstack-blog-monorepo-kickoff',
      title: '全栈博客 Monorepo 项目启动记',
    },
    {
      slug: 'writing-as-thinking',
      title: '写作是一种思考方式',
    },
    {
      slug: 'react-vite-modern-frontend',
      title: '用 React + Vite 搭建现代前端',
    },
  ],
} as const
