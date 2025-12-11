# CLAUDE.md - Alkana Coating Project

This file provides guidance to AI assistants when working with the Alkana Coating codebase.

## Project Context

**Project**: Alkana Coating - Full-stack Website  
**Tech Stack**: Laravel 9 (PHP 8.0+) + React 18 + MySQL 8.0  
**Type**: Monorepo (Backend API + Frontend SPA)  
**Status**: Production (v1.0)

## Role & Responsibilities

Your role is to:
1. **Understand** the project context by reading documentation
2. **Follow** established coding standards and patterns
3. **Implement** features according to specifications
4. **Test** changes thoroughly before committing
5. **Document** new features and changes

## Critical Rules

> [!IMPORTANT]
> **MANDATORY RULES - NO EXCEPTIONS:**
> 1. **ALWAYS** read `./docs/project-overview-pdr.md` first for context
> 2. **ALWAYS** follow `./.claude/workflows/development-rules.md`
> 3. **ALWAYS** check `./docs/code-standards.md` before writing code
> 4. **NEVER** commit sensitive data (.env, credentials, API keys)
> 5. **NEVER** create "enhanced" files - update existing files directly

## Workflows

### Primary Workflows
- **Development**: `./.claude/workflows/primary-workflow.md`
- **Rules**: `./.claude/workflows/development-rules.md`
- **Orchestration**: `./.claude/workflows/orchestration-protocol.md`
- **Documentation**: `./.claude/workflows/documentation-management.md`

### When to Use Each Workflow

**Planning Phase** → Use `primary-workflow.md` Step 1
- Creating implementation plans
- Researching technical approaches
- Designing architecture

**Implementation Phase** → Use `primary-workflow.md` Step 1 + `development-rules.md`
- Writing code
- Following coding standards
- Implementing features

**Testing Phase** → Use `primary-workflow.md` Step 2
- Running tests
- Fixing failing tests
- Validating functionality

**Code Review** → Use `primary-workflow.md` Step 3
- Reviewing code quality
- Checking standards compliance
- Optimizing performance

**Documentation** → Use `documentation-management.md`
- Updating docs after changes
- Creating new documentation
- Maintaining consistency

## Skills to Activate

Based on this project's tech stack, activate these skills when needed:

### Backend Development
- **`backend-development`** - PHP/Laravel development
- **`databases`** - MySQL optimization and queries
- **`debugging`** - Backend debugging

### Frontend Development
- **`frontend-development`** - React development
- **`frontend-design`** - UI/UX design
- **`ui-styling`** - CSS/Tailwind styling

### DevOps & Deployment
- **`devops`** - Deployment and server management

### Quality & Testing
- **`code-review`** - Code review automation
- **`debugging`** - General debugging
- **`sequential-thinking`** - Complex problem solving

### Planning & Research
- **`planning`** - Feature planning
- **`research`** - Technical research
- **`docs-seeker`** - Documentation lookup

## Documentation Structure

All documentation is in `./docs/`:

```
./docs/
├── project-overview-pdr.md    # Start here! Project overview
├── system-architecture.md     # Architecture and design
├── code-standards.md          # Coding conventions
├── codebase-summary.md        # Codebase structure
├── design-guidelines.md       # UI/UX guidelines
├── deployment-guide.md        # Deployment instructions
├── project-roadmap.md         # Timeline and roadmap
├── api-contract.md            # API documentation
└── schema.sql                 # Database schema
```

## Quick Reference

### Before Starting Any Task

1. Read relevant documentation:
   - `./docs/project-overview-pdr.md` - Project context
   - `./docs/system-architecture.md` - Architecture
   - `./docs/code-standards.md` - Coding standards

2. Check existing code patterns:
   - Backend: `./backend/app/Http/Controllers/`
   - Frontend: `./frontend/src/`

3. Follow the workflow:
   - Plan → Implement → Test → Review → Document

### Common Tasks

**Adding a new feature:**
```
1. Read: ./docs/project-overview-pdr.md
2. Follow: ./.claude/workflows/primary-workflow.md
3. Check: ./docs/code-standards.md
4. Implement following existing patterns
5. Test thoroughly
6. Update: ./docs/ if needed
```

**Fixing a bug:**
```
1. Activate: debugging skill
2. Follow: ./.claude/workflows/development-rules.md
3. Identify root cause
4. Implement fix
5. Test fix
6. Verify no regression
```

**Deploying:**
```
1. Read: ./docs/deployment-guide.md
2. Choose deployment method
3. Follow checklist
4. Verify deployment
5. Monitor for issues
```

## Tech Stack Specifics

### Backend (Laravel)
- **Framework**: Laravel 9.x
- **PHP Version**: 8.0+
- **Database**: MySQL 8.0
- **Auth**: Laravel Sanctum
- **Key Services**: `DbDumper` (backup service)

### Frontend (React)
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **State**: Zustand
- **Routing**: React Router 6

### Key Features
- Product catalog with categories
- Project portfolio
- Blog/news system
- Admin panel with backup management
- Google Analytics integration
- Dynamic menu builder
- Recruitment system

## Development Principles

Follow **YAGNI, KISS, DRY**:
- **YAGNI**: You Aren't Gonna Need It - Don't add unnecessary features
- **KISS**: Keep It Simple, Stupid - Prefer simple solutions
- **DRY**: Don't Repeat Yourself - Avoid code duplication

## Code Quality Standards

- **File Size**: Keep files under 200 lines
- **Testing**: Write tests for new features
- **Linting**: Fix all syntax errors before committing
- **Security**: Validate all user input
- **Performance**: Optimize database queries

## Git Commit Standards

Use conventional commits:
```
feat(products): add image gallery to product detail
fix(backup): resolve download timeout issue
docs(readme): update deployment instructions
refactor(api): extract backup logic to service
```

## Important Paths

### Backend
- Controllers: `./backend/app/Http/Controllers/`
- Models: `./backend/app/Models/`
- Services: `./backend/app/Services/`
- Routes: `./backend/routes/api_admin.php`

### Frontend
- Admin: `./frontend/src/admin/`
- Components: `./frontend/src/components/`
- Pages: `./frontend/src/pages/`
- Services: `./frontend/src/services/`

### Configuration
- Backend env: `./backend/.env`
- Frontend env: `./frontend/.env`
- Claude Kit: `./.claude/`

## Special Notes

### Backup System
The backup system is a critical feature:
- **Controller**: `backend/app/Http/Controllers/Admin/BackupController.php`
- **Service**: `backend/app/Services/DbDumper.php`
- **Frontend**: `frontend/src/admin/pages/BackupManagement.jsx`
- **Storage**: `backend/storage/app/backups/`

### Deployment
Multiple deployment methods available:
- Manual upload (shared hosting)
- One-command deploy (VPS)
- CI/CD (GitHub Actions)

See `./docs/deployment-guide.md` for details.

---

**Remember**: Quality over speed. Always test your changes!

**Last Updated**: 2025-11-30  
**Project Version**: 1.0