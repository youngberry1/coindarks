import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://coindarks.com'

    // Public pages that we want Google to index
    const routes = [
        '',
        '/privacy',
        '/terms',
        '/help',
        '/login',
        '/register',
        '/forgot-password',
        '/faq',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: (route === '' || route === '/help') ? 'daily' as const : 'monthly' as const,
        priority: route === '' ? 1 : route === '/help' ? 0.9 : 0.8,
    }))

    return routes
}
