# Project Overview - Alkana Coating

## Project Information

**Project Name**: Alkana Coating Website  
**Type**: Full-stack Web Application  
**Version**: 1.0 (Production)  
**Status**: ✅ Active & Deployed  
**Hosting**: Mat Bao Premium Cloud Hosting

## Business Context

Alkana Coating is a professional coating solutions company website designed to showcase products, projects, and services while providing comprehensive admin management capabilities.

### Target Audience

**Primary Users**:
- **Public Visitors**: Customers seeking coating solutions and product information
- **Admin Users**: Company staff managing content, products, and customer inquiries

**Secondary Users**:
- **Job Seekers**: Candidates applying for open positions
- **Business Partners**: Companies exploring collaboration opportunities

## Business Goals

### Primary Objectives
1. **Product Showcase**: Display comprehensive product catalog with detailed specifications
2. **Lead Generation**: Capture customer inquiries through contact forms
3. **Brand Presence**: Establish professional online presence with portfolio showcase
4. **Content Management**: Enable easy content updates without technical knowledge

### Success Metrics
- Website uptime > 99.5%
- Contact form submission rate
- Product page engagement
- Admin panel usability
- Page load performance < 3s

## Key Features

### Public-Facing Features
- 🏠 **Homepage**: Hero slider, featured products, company overview
- 📦 **Product Catalog**: Category-based browsing, detailed product pages
- 🏗️ **Project Portfolio**: Case studies and completed projects showcase
- 📰 **News/Blog**: Company updates and industry insights
- 💼 **Careers**: Job listings with online application system
- 📞 **Contact**: Multi-channel contact forms with inquiry tracking

### Admin Panel Features
- 📊 **Dashboard**: Analytics overview with Google Analytics integration
- 🛠️ **Content Management**: CRUD operations for products, projects, posts
- 🎨 **Media Management**: Image upload, slider management, menu builder
- 💾 **Backup & Restore**: Database and file backup system
- 👥 **User Management**: Admin user accounts and permissions
- 📧 **Contact Management**: Inquiry tracking and status management
- 🧹 **Image Cleanup**: Unused image detection and cleanup tools

## Technology Stack

### Backend
- **Framework**: Laravel 9.x
- **Language**: PHP 8.0+
- **Database**: MySQL 8.0
- **Authentication**: Laravel Sanctum (SPA)
- **Image Processing**: Intervention Image

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand
- **Routing**: React Router 6
- **UI Components**: Headless UI, Heroicons
- **Rich Text**: Quill Editor
- **Animations**: Framer Motion, AOS

### Development & Deployment
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Testing**: PHPUnit, Playwright
- **Package Managers**: Composer, npm
- **Development**: XAMPP (Windows), Docker (optional)

## Project Timeline

### Phase 1: Foundation (Completed)
- ✅ Project setup and architecture design
- ✅ Database schema and migrations
- ✅ Basic CRUD operations
- ✅ Authentication system

### Phase 2: Core Features (Completed)
- ✅ Product catalog with categories
- ✅ Project portfolio
- ✅ Blog/news system
- ✅ Contact forms
- ✅ Admin panel UI

### Phase 3: Advanced Features (Completed)
- ✅ Menu builder with mega menu support
- ✅ Slider management
- ✅ Google Analytics integration
- ✅ Backup & restore system
- ✅ Image cleanup tools
- ✅ Recruitment system

### Phase 4: Production (Current)
- ✅ Deployment to Mat Bao hosting
- ✅ Performance optimization
- 🔄 Ongoing maintenance and updates
- 🔄 Feature enhancements based on feedback

## Key Stakeholders

### Internal Team
- **Project Owner**: Alkana Coating Management
- **Development Team**: Full-stack developers
- **Content Managers**: Admin users maintaining website content

### External Partners
- **Hosting Provider**: Mat Bao Premium Cloud Hosting
- **End Users**: Website visitors and customers

## Technical Decisions & Rationale

### Why Laravel?
- Robust PHP framework with excellent documentation
- Built-in authentication and security features
- Strong ORM (Eloquent) for database operations
- Large ecosystem and community support

### Why React + Vite?
- Modern, performant SPA experience
- Fast development with HMR (Hot Module Replacement)
- Component-based architecture for reusability
- Excellent developer experience

### Why Tailwind CSS?
- Rapid UI development with utility classes
- Consistent design system
- Small production bundle size
- Easy customization

### Why Zustand for State Management?
- Lightweight alternative to Redux
- Simple API and minimal boilerplate
- Perfect for small to medium applications
- Easy to integrate with React

### Why Laravel Sanctum?
- SPA authentication without complexity of OAuth
- CSRF protection built-in
- Simple token management
- Perfect for first-party SPAs

## Project Structure

```
alkanacoating/
├── backend/           # Laravel API
├── frontend/          # React SPA
├── docs/             # Documentation
├── build/            # Production build
├── scripts/          # Deployment scripts
└── .claude/          # Claude Kit Engineer config
```

## Current Status

**Production Environment**: ✅ Live  
**Admin Panel**: ✅ Fully Functional  
**Backup System**: ✅ Operational  
**Analytics**: ✅ Integrated  
**Documentation**: 🔄 In Progress (This file!)

## Known Limitations

1. **Single Language**: Currently Vietnamese only (no i18n)
2. **Manual Deployment**: No automated deployment pipeline yet
3. **Basic SEO**: Meta tags present but could be enhanced
4. **Mobile Admin**: Admin panel optimized for desktop primarily

## Future Enhancements

- Multi-language support (Vietnamese/English)
- Advanced SEO optimization
- Progressive Web App (PWA) features
- Real-time notifications
- Advanced analytics dashboard
- API rate limiting
- Automated deployment pipeline

---

**Last Updated**: 2025-11-30  
**Document Owner**: Development Team
