import { RoomBoard } from "@/components/rooms/RoomBoard";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <RoomBoard roomId={roomId} />;
}
