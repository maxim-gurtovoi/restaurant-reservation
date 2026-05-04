import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { FloorPlanEditor } from '@/features/manager/components/floor-plan-editor';
import {
  getFloorPlanEditorContext,
  saveFloorPlan,
} from '@/features/manager/server/floor-plan-editor.service';
import { ROUTES } from '@/lib/constants';
import { requireManagerShell } from '@/server/auth';

type FloorPlanEditPageProps = {
  params: Promise<{ floorPlanId: string }>;
};

export default async function FloorPlanEditPage({ params }: FloorPlanEditPageProps) {
  const user = await requireManagerShell();
  const { floorPlanId } = await params;

  const ctx = await getFloorPlanEditorContext(floorPlanId, {
    userId: user.id,
    role: user.role,
  });
  if (!ctx) notFound();

  async function saveAction(payload: unknown) {
    'use server';
    const actor = await requireManagerShell();
    const result = await saveFloorPlan(payload, {
      userId: actor.id,
      role: actor.role,
    });
    if (!result.ok) {
      return { ok: false as const, error: result.error };
    }
    // Redirect so the new data is re-read on next navigation; client component
    // will just show a success flash before navigating.
    return { ok: true as const };
  }

  async function backAction() {
    'use server';
    await requireManagerShell();
    redirect(ROUTES.managerFloorPlan);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Редактор плана · ${ctx.restaurant.name}`}
        subtitle={`Drag&drop для зала «${ctx.floorPlan.name}». Изменения применяются после нажатия «Сохранить».`}
      />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href={ROUTES.managerFloorPlan}
          className="rounded-lg border border-border px-3 py-1.5 font-medium text-foreground hover:bg-surface-soft"
        >
          ← К обзору планов
        </Link>
        {ctx.otherFloors.length ? (
          <>
            <span className="text-muted">Другие залы:</span>
            {ctx.otherFloors.map((f) => (
              <Link
                key={f.id}
                href={`${ROUTES.managerFloorPlanEdit}/${f.id}/edit`}
                className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-soft"
              >
                {f.name}
              </Link>
            ))}
          </>
        ) : null}
      </div>

      <FloorPlanEditor
        floorPlan={ctx.floorPlan}
        initialTables={ctx.tables}
        initialElements={ctx.elements}
        onSaveAction={saveAction}
        onBackAction={backAction}
      />
    </div>
  );
}
