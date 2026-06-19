export interface ProfileLink {
  label: string
  href: string
}

export const SITE_PROFILE = {
  name: '迪迪',
  title: '开发者 & 写作者',
  avatar: '/favicon.png',
  bio: `欢迎来到迪迪の秘密小屋。

这里是迪迪的个人站点，记录技术探索与生活随笔。

内容筹备中，敬请期待。`,
  skills: ['React', 'TypeScript', 'NestJS', 'PostgreSQL', '写作'],
  links: [
    { label: 'GitHub', href: 'https://github.com/yuandidi' },
  ],
} as const
