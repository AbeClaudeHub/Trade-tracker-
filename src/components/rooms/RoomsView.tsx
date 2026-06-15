"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createRoom, getRoom, joinByCode } from "@/services/roomService";
import type { Room } from "@/domain/types";
import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Field";

export function RoomsView() {
  const { user, profile } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!profile) return;
    const fetched = await Promise.all(profile.roomIds.map((id) => getRoom(id)));
    setRooms(fetched.filter((r): r is Room => Boolean(r)));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.roomIds.join(",")]);

  async function handleCreate() {
    if (!profile || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const room = await createRoom(profile, name);
      setName("");
      setRooms((r) => [...r, room]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!profile || !code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const room = await joinByCode(profile, code);
      setCode("");
      setRooms((r) => (r.some((x) => x.id === room.id) ? r : [...r, room]));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Page>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Accountability Rooms"
        title="Where discipline becomes visible"
        description="A room of ~7 traders who see each other's commitments and follow-through. Visibility is what turns intention into behavior."
      />

      {rooms.length > 0 ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`}>
              <Card className="transition-shadow hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-ink">{room.name}</h3>
                  <span className="text-xs text-faint">{room.memberCount}/7</span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  Invite code <span className="font-mono text-ink">{room.inviteCode}</span>
                </p>
                <p className="mt-3 text-sm text-accent">Open board →</p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="mb-8 text-center">
          <p className="text-muted">
            You&apos;re not in a room yet. Create one and invite your circle, or join with
            a code. Accountability is the product — this is where it lives.
          </p>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <FieldLabel htmlFor="create">Create a room</FieldLabel>
          <Input id="create" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dawn Patrol" />
          <Button className="mt-3" onClick={handleCreate} disabled={busy || !name.trim()}>
            Create room
          </Button>
        </Card>
        <Card>
          <FieldLabel htmlFor="join">Join with a code</FieldLabel>
          <Input id="join" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-character code" className="font-mono uppercase" />
          <Button className="mt-3" variant="secondary" onClick={handleJoin} disabled={busy || !code.trim()}>
            Join room
          </Button>
        </Card>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-breachsoft px-3 py-2 text-sm text-breach">{error}</p>
      ) : null}
    </Page>
  );
}
