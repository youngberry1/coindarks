import { MetadataRoute } from 'next'
import { academyArticles } from '@/lib/academy-data'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://coindarks.com'

    // Static pages
    const staticRoutes = [
        '',
        '/privacy',
        '/terms',
        '/help',
        '/login',
        '/register',
        '/forgot-password',
        '/faq',
        '/academy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: (route === '' || route === '/academy' || route === '/help') ? 'daily' as const : 'monthly' as const,
        priority: route === '' ? 1 : (route === '/academy' || route === '/help') ? 0.9 : 0.8,
    }))

    // Dynamic academy articles
    const academyRoutes = academyArticles.map((article) => ({
        url: `${baseUrl}/academy/${article.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [...staticRoutes, ...academyRoutes]
}
