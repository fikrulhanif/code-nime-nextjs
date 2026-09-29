import { Metadata } from "next";
import { fetchAnimeDetails } from "@/lib/api/anilist";
import AnimeDetailClient from "./anime-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength);
}

// Helper function to truncate title for SEO
function truncateTitle(title: string): string {
  const maxLength = 60;
  if (title.length <= maxLength) {
    return `${title} - CodeNime`;
  }
  return `${truncateText(title, maxLength)}... - CodeNime`;
}

// Helper function to generate meta description
function generateMetaDescription(
  synopsis: string | null,
  title: string,
): string {
  if (synopsis && synopsis.trim().length > 0) {
    return truncateText(synopsis, 160);
  }
  return `Discover ${title} on CodeNime - Your premium anime discovery platform`;
}

// Helper function to get best image URL
function getBestImageUrl(anime: {
  images: {
    jpg: {
      large_image_url: string;
      image_url: string;
    };
  };
}): string {
  return anime.images.jpg.large_image_url || anime.images.jpg.image_url;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const animeId = Number(id);

    // Validate anime ID
    if (isNaN(animeId) || animeId <= 0) {
      return {
        title: "Anime Not Found - CodeNime",
        description: "The anime you're looking for could not be found.",
      };
    }

    // Fetch anime details for metadata
    const anime = await fetchAnimeDetails(animeId);

    // Generate page title (truncate if exceeds 60 chars)
    const pageTitle = truncateTitle(anime.title);

    // Generate meta description (first 160 chars of synopsis or fallback)
    const metaDescription = generateMetaDescription(
      anime.synopsis,
      anime.title,
    );

    // Get best image URL (prefer large_image_url, fallback to image_url)
    const imageUrl = getBestImageUrl(anime);

    return {
      title: pageTitle,
      description: metaDescription,
      openGraph: {
        title: anime.title,
        description: metaDescription,
        images: [
          {
            url: imageUrl,
            alt: anime.title,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: anime.title,
        description: metaDescription,
        images: [imageUrl],
      },
    };
  } catch (error) {
    // Return fallback metadata if fetch fails
    return {
      title: "Anime Details - CodeNime",
      description:
        "Discover anime on CodeNime - Your premium anime discovery platform",
    };
  }
}

// Server component that renders the client component
export default async function AnimeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const animeId = Number(id);

  return <AnimeDetailClient animeId={animeId} />;
}
