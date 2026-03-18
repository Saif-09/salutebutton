import { type Metadata } from "next";
import { JoinGroupPageClient } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

type ProfilePreview = {
  _id: string;
  name: string;
  description: string;
  image: string;
  respectors: number;
  dispiters: number;
};

type GroupPreviewData = {
  _id: string;
  name: string;
  code: string;
  isPublic?: boolean;
  memberCount: number;
  profileCount: number;
  createdBy: string;
  profile?: ProfilePreview;
};

async function getGroupPreview(
  code: string,
  profileId?: string,
): Promise<GroupPreviewData | null> {
  try {
    const qs = profileId ? `?profileId=${encodeURIComponent(profileId)}` : "";
    const res = await fetch(`${API_URL}/api/groups/preview/${code}${qs}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ profile?: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const { profile: profileId } = await searchParams;

  const preview = await getGroupPreview(code, profileId);
  if (!preview) return { title: "Join Group | SaluteButton" };

  if (profileId && preview.profile) {
    const p = preview.profile;
    const title = `${p.name} in "${preview.name}" — SaluteButton`;
    const description = `"${p.description}" — Vote for ${p.name} in the group "${preview.name}" on SaluteButton!`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: p.image, width: 600, height: 600, alt: p.name }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [p.image],
      },
    };
  }

  return {
    title: `Join "${preview.name}" — SaluteButton`,
    description: `You're invited to join "${preview.name}" on SaluteButton — ${preview.memberCount} members, ${preview.profileCount} profiles. Created by ${preview.createdBy}.`,
  };
}

export default async function JoinGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ profile?: string }>;
}) {
  const { code } = await params;
  const { profile: profileId } = await searchParams;

  const preview = await getGroupPreview(code, profileId);

  return (
    <JoinGroupPageClient
      code={code}
      profileId={profileId}
      initialPreview={preview}
    />
  );
}
