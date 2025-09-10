# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 portfolio website for vishalk.com. It's a single-page application built with TypeScript, React 18, and Tailwind CSS.

## Development Commands

```bash
# Install dependencies (using Bun)
bun install

# Run development server
bun dev

# Build for production
bun build

# Start production server
bun start

# Linting
bun lint
bun lint:fix

# Format code
bun format:write  # Write formatting changes
bun format:check  # Check formatting without changes

# Preview production build locally
bun preview
```

## Architecture

### Project Structure
- **`app/`**: Next.js 14 App Router pages and API routes
  - `page.tsx`: Main homepage component
  - `layout.tsx`: Root layout with metadata and providers
  - `api/contact/route.ts`: Contact form API endpoint
- **`components/`**: React components organized by feature
  - `home/`: Homepage sections (intro, expertise, work, contact)
  - `work/`: Work/project showcase components
  - `ui/`: Shadcn/ui components (button, dialog, form, etc.)
- **`data/`**: Static data (projects.ts contains portfolio projects)
- **`lib/`**: Utility functions and shared logic
- **`hooks/`**: Custom React hooks
- **`public/images/projects/`**: Project screenshot images

### Key Technologies & Patterns
- **Styling**: Tailwind CSS with custom animations and responsive design
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Shadcn/ui component library
- **Icons**: Phosphor Icons and React Simple Icons
- **Email**: Nodemailer with Zoho SMTP (requires ZOHO_EMAIL and ZOHO_PASSWORD env vars)
- **Analytics**: Vercel Analytics and Google Analytics (via @next/third-parties)
- **Path Aliases**: Uses `@/*` for imports relative to project root

### Component Architecture
- Homepage is split into sections (Intro, Expertise, Work, Contact)
- Uses FadeInSection wrapper for scroll animations
- Work section uses tabs with carousel for project showcases
- Contact form integrates with API route for email sending

## TypeScript Configuration
- Strict mode enabled
- Path alias `@/*` configured for clean imports
- Next.js plugin configured for optimal type checking