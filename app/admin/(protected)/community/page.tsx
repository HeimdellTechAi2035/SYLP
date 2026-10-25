import CommunityInbox from "@/components/admin/CommunityInbox";
export default function Page({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  return <CommunityInbox searchParams={searchParams} />;
}
