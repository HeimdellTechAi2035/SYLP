export default function AdminPageHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
      {action}
    </div>
  );
}
