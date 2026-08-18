import { Link } from "@tanstack/react-router";

export function SectionHeader({
  ustki,
  sarlavha,
  matn,
  havola,
}: {
  ustki?: string;
  sarlavha: string;
  matn?: string;
  havola?: { to: string; nom: string };
}) {
  return (
    <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        {ustki && (
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{ustki}</p>
        )}
        <h2 className="text-2xl font-extrabold sm:text-3xl">{sarlavha}</h2>
        {matn && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{matn}</p>}
      </div>
      {havola && (
        <Link
          to={havola.to}
          className="shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
        >
          {havola.nom}
        </Link>
      )}
    </div>
  );
}
