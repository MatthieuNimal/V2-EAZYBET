interface WikimediaPageImage {
  pageimages?: {
    thumbnail?: {
      source: string;
    };
  };
}

interface WikimediaResponse {
  query?: {
    pages?: Record<string, WikimediaPageImage>;
  };
}

export interface TeamImages {
  badge?: string;
  banner?: string;
  stadium?: string;
}

const WIKIMEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php';

export async function getTeamImagesFromWikimedia(
  teamName: string,
  supabaseClient?: any
): Promise<TeamImages> {
  const normalizedTeamName = teamName.toLowerCase().trim();

  if (supabaseClient) {
    const { data: cached } = await supabaseClient
      .from('team_images_cache')
      .select('badge_url, banner_url, stadium_url')
      .eq('team_name', normalizedTeamName)
      .maybeSingle();

    if (cached) {
      return {
        badge: cached.badge_url,
        banner: cached.banner_url,
        stadium: cached.stadium_url,
      };
    }
  }

  const images: TeamImages = {};

  try {
    const teamImageUrl = await fetchWikimediaImage(teamName);
    if (teamImageUrl) {
      images.banner = teamImageUrl;
      images.badge = teamImageUrl;
    }

    if (!teamImageUrl) {
      const stadiumImageUrl = await fetchWikimediaImage(`${teamName} Stadium`);
      if (stadiumImageUrl) {
        images.stadium = stadiumImageUrl;
        images.banner = stadiumImageUrl;
      }
    }

    if (supabaseClient && (images.badge || images.banner || images.stadium)) {
      await supabaseClient
        .from('team_images_cache')
        .upsert({
          team_name: normalizedTeamName,
          badge_url: images.badge || null,
          banner_url: images.banner || null,
          stadium_url: images.stadium || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'team_name'
        });
    }
  } catch (error) {
    console.error(`Error fetching images for ${teamName}:`, error);
  }

  return images;
}

async function fetchWikimediaImage(searchTerm: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: searchTerm,
      prop: 'pageimages',
      format: 'json',
      pithumbsize: '1200',
      origin: '*'
    });

    const url = `${WIKIMEDIA_API_BASE}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data: WikimediaResponse = await response.json();

    if (data.query?.pages) {
      const pages = Object.values(data.query.pages);
      if (pages.length > 0 && pages[0].pageimages?.thumbnail?.source) {
        return pages[0].pageimages.thumbnail.source;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error fetching Wikimedia image for "${searchTerm}":`, error);
    return null;
  }
}

