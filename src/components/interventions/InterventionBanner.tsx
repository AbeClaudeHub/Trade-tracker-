"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  acknowledgeIntervention,
  listActiveInterventions,
} from "@/services/interventionService";
import type { Intervention } from "@/domain/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/** Surfaces active interventions — supportive friction, never punishment. */
export function InterventionBanner() {
  const { user } = useAuth();
  const [items, setItems] = useState<Intervention[]>([]);

  useEffect(() => {
    if (!user) return;
    listActiveInterventions(user.uid).then(setItems).catch(() => {});
  }, [user]);

  async function ack(id: string) {
    if (!user) return;
    await acknowledgeIntervention(user.uid, id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {items.map((i) => (
        <Card key={i.id} className="border-caution/30 bg-cautionsoft/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg text-ink">{i.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-ink/90">{i.message}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => ack(i.id)}>
              Acknowledge
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
