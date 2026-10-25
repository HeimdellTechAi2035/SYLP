import { notFound } from "next/navigation";
import CommunityInbox from "@/components/admin/CommunityInbox";
import { isCommunityInboxKind } from "@/lib/community/inboxes";
export default async function Page({ params, searchParams }: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { kind } = await params;
  if (!isCommunityInboxKind(kind)) notFound();
  return <CommunityInbox kind={kind} searchParams={searchParams} />;
}
