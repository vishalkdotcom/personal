# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit portfolio website for vishalk.com. It's a single-page application built with TypeScript, Svelte 5, and Tailwind CSS.

## Development Commands

```bash
# Install dependencies (using Bun)
bun install

# Run development server
bun dev

# Build for production
bun build

# Preview production build locally
bun preview

# Linting
bun lint

# Format code
bun format  # Write formatting changes

# Type checking
bun check  # Run Svelte type checking
bun check:watch  # Watch mode for type checking
```

## Architecture

### Project Structure
- **`src/routes/`**: SvelteKit file-based routing with special files:
  - `+page.svelte`: Page components
  - `+layout.svelte`: Layout components  
  - `+page.server.ts`: Server-side logic and actions
  - `+page.ts`/`+layout.ts`: Load functions
- **`src/lib/components/`**: Svelte components organized by feature
  - `home/`: Homepage sections (Intro, Expertise, WorkSection, ContactSection)
  - `work/`: Work/project showcase components
  - `ui/`: Custom UI components (Button, Input, Textarea, etc.)
- **`src/lib/data/`**: Static data (projects.ts contains portfolio projects)
- **`src/lib/`**: Utility functions and shared logic
- **`static/images/projects/`**: Project screenshot images
- **`scripts/`**: Build-time scripts (image optimization)

### Key Technologies & Patterns
- **Build System**: Vite with SvelteKit optimizations
- **Styling**: Tailwind CSS with custom animations and responsive design
- **Forms**: Native SvelteKit forms with Zod validation and server actions
- **UI Components**: Custom Svelte UI components
- **Icons**: Phosphor Icons and Simple Icons
- **Email**: Nodemailer with Zoho SMTP (requires ZOHO_EMAIL and ZOHO_PASSWORD env vars)
- **Path Aliases**: Uses `$lib/*` for SvelteKit library imports
- **Deployment**: Cloudflare Pages with @sveltejs/adapter-cloudflare
- **Image Optimization**: Concurrent Sharp-based processing with smart caching

### Component Architecture
- Homepage sections implemented as Svelte components
- Uses FadeInSection Svelte component for scroll animations
- Work section uses tabs with carousel for project showcases
- Contact form uses SvelteKit actions for server-side processing

### SvelteKit Configuration
- **svelte.config.js**: Configured with Cloudflare adapter and path aliases
- **vite.config.js**: Vite configuration optimized for SvelteKit
- **Image Processing**: Pre-build script generates optimized WebP and AVIF formats

## TypeScript Configuration
- Strict mode enabled
- SvelteKit TypeScript integration with proper type checking
- Path alias `$lib/*` configured for SvelteKit library imports
- Svelte-specific type checking with `svelte-check`