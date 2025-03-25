// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.simplemesh.ai',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
  },
  additionalPaths: async (config) => {
    return [
      { loc: '/dashboard', priority: 0.7, changefreq: 'daily' },
      { loc: '/dashboard/image-3d', priority: 0.7, changefreq: 'daily' },
      { loc: '/dashboard/text-3d', priority: 0.7, changefreq: 'daily' },
      { loc: '/dashboard/guide', priority: 0.7, changefreq: 'daily' },
      { loc: '/dashboard/models', priority: 0.7, changefreq: 'daily' },
      { loc: '/dashboard/settings', priority: 0.7, changefreq: 'daily' },
      // Add any other dashboard routes you want indexed
    ]
  }
}