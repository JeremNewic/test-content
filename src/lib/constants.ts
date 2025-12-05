export const SITE_NAME = 'Starter Kit Blog'
export const SITE_DESCRIPTION = 'Ceci est starter kit de blog.'
export const SITE_URL = 'https://monblog.com'

export const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'À propos' },
  { href: '/services', label: 'Services' }, 
  { href: '/contact', label: 'Contact' },   
] as const

export const FOOTER_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'À propos', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const SOCIAL_LINKS = [
  { label: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
  { label: 'GitHub', href: 'https://github.com', icon: 'github' },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
];