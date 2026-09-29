# CodeNime

<div align="center">

![CodeNime Banner](https://img.shields.io/badge/CodeNime-Anime%20Discovery%20Platform-8B5CF6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yIDEyTDEyIDE3TDIyIDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+)

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## About

**CodeNime** is a simple anime search website that I built just for fun. The main idea was to create a project without using a database and instead fetch data from a public API. I wanted to learn how to work with external APIs and handle their data properly.

The site uses the official [AniList GraphQL API](https://graphql.anilist.co) to get anime information. You can search for anime, browse by season, check out trending shows, and see detailed information about each anime including characters and streaming episodes.

> **Note:** This project was migrated from Jikan API (MyAnimeList scraper) to AniList's official API in September 2026 for better reliability and stability.

This was a learning project to practice:

- Working with GraphQL APIs and handling pagination
- Managing server state with React Query
- Building a responsive UI with Tailwind CSS
- Implementing features like search, filters, and pagination without a backend database

Nothing fancy, just a fun side project to explore how to build a data-driven app using only public APIs!

---

## Features

### Homepage

- **Hero Banner** - Showcase of top-rated anime with auto-rotating carousel
- **Trending Now** - Currently popular anime series
- **Top Rated** - Highest-rated anime of all time
- **This Season** - Current seasonal anime releases

### Discovery & Search

- **Advanced Filters** - Filter by genres, type, status, score range, and release year
- **Real-time Search** - Instant search results as you type
- **Smart Pagination** - Efficient browsing through large datasets

### Anime Details

- **Comprehensive Information** - Synopsis, ratings, episodes, studios, and more
- **Character Gallery** - Browse anime characters with detailed profiles
- **Episode List** - Complete episode listings with pagination
- **Recommendations** - Discover similar anime based on your interests

### Collections

- **Popular Anime** - Most popular series across all time
- **Seasonal Anime** - Browse by season and year
- **Upcoming Releases** - Stay updated with future releases
- **Personal Watchlist** - Save and manage your favorite anime (local storage)

### User Experience

- **Dark/Light Mode** - Theme toggle (defaults to dark mode)
- **Smooth Animations** - Page transitions and hover effects
- **Loading States** - Skeleton loaders while fetching data
- **Error Handling** - Retry buttons when something goes wrong
- **Responsive Design** - Works on mobile, tablet, and desktop

---

## Tech Stack

### Core Framework

- **[Next.js 16.2.6](https://nextjs.org/)** - React framework with Turbopack
- **[React 19.2.4](https://reactjs.org/)** - UI library
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Type safety

### Styling & UI

- **[Tailwind CSS 4.x](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion 12.x](https://www.framer.com/motion/)** - Animation library
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

### State Management & Data Fetching

- **[TanStack Query (React Query) 5.x](https://tanstack.com/query)** - Server state management
- **[Zustand 5.x](https://github.com/pmndrs/zustand)** - Client state management
- **[Axios 1.x](https://axios-http.com/)** - HTTP client

### UI Components & Libraries

- **[Swiper 12.x](https://swiperjs.com/)** - Touch slider/carousel
- **[Lenis 1.x](https://lenis.studiofreight.com/)** - Smooth scroll
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[React Hot Toast](https://react-hot-toast.com/)** - Toast notifications

### Development Tools

- **[ESLint 9.x](https://eslint.org/)** - Code linting
- **[Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)** - Bundle size analysis

### API

- **[AniList GraphQL API](https://anilist.co/)** - Official AniList API for anime data

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** / **yarn** / **pnpm** / **bun**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/fikrulhanif/code-nime.git
   cd code-nime
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

---

## Project Structure

```
code-nime/
├── public/                 # Static assets
│   ├── placeholder-anime.svg
│   └── placeholder-character.svg
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── anime/[id]/   # Anime detail page
│   │   ├── filter/       # Advanced filter page
│   │   ├── popular/      # Popular anime page
│   │   ├── search/       # Search results page
│   │   ├── seasonal/     # Seasonal anime page
│   │   ├── upcoming/     # Upcoming anime page
│   │   ├── watchlist/    # User watchlist page
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Homepage
│   ├── components/        # React components
│   │   ├── anime/        # Anime-related components
│   │   ├── filters/      # Filter components
│   │   ├── home/         # Homepage components
│   │   ├── loading/      # Loading states
│   │   ├── navigation/   # Header, footer, nav
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utility functions
│   │   ├── api/          # API client & services
│   │   ├── query/        # React Query setup
│   │   └── utils.ts      # Helper functions
│   ├── store/            # Zustand stores
│   │   ├── ui.ts         # UI state (theme, etc.)
│   │   └── watchlist.ts  # Watchlist state
│   └── types/            # TypeScript type definitions
│       ├── anime.ts
│       ├── api.ts
│       └── filters.ts
├── .gitignore
├── next.config.ts         # Next.js configuration
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

---

## Configuration

### Environment Variables

No environment variables required. The app uses the public AniList GraphQL API at `https://graphql.anilist.co`.

### Next.js Configuration

Key optimizations in `next.config.ts`:

- **Turbopack** enabled for faster builds
- **Image optimization** with WebP format
- **Compression** enabled
- **Package imports optimization** for lucide-react and framer-motion

---

## What I Learned

Building this project helped me understand:

### API Integration

- How to work with GraphQL APIs (AniList API)
- Building and optimizing GraphQL queries
- Implementing retry logic and error handling
- Caching strategies to reduce unnecessary API calls

### State Management

- Using React Query for server state
- Managing client state with Zustand
- Optimistic updates and background refetching

### Performance

- Code splitting and lazy loading
- Image optimization with Next.js
- Reducing bundle size
- Handling loading states properly

### UI/UX

- Building responsive layouts with Tailwind
- Implementing dark/light theme
- Creating smooth animations with Framer Motion
- Designing intuitive filter interfaces

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **[AniList](https://anilist.co/)** - For providing the official anime data API
- **[Vercel](https://vercel.com/)** - Hosting platform
- **[shadcn/ui](https://ui.shadcn.com/)** - UI component inspiration

---

## Contact

**Fikrul Hanif**

- GitHub: [@fikrulhanif](https://github.com/fikrulhanif)
- Project Link: [https://github.com/fikrulhanif/code-nime](https://github.com/fikrulhanif/code-nime)

---

If you like this project, please give it a star on GitHub!

---

<div align="center">

**Author : [Fikrul Hanif](https://github.com/fikrulhanif)**

</div>
