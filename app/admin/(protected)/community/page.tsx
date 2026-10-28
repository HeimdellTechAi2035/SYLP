import CommunityInbox from "@/components/admin/CommunityInbox";
export default function Page({ searchParams }: { searchParams: Promise<{ status?: string; page?: string; record?: string }> }) {
  return <CommunityInbox searchParams={searchParams} />;
}
