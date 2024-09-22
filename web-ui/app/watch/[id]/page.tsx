import { PlayerPage } from "@/components/player-page";

export default function Watch({ params }: { params: { id: string } }) {
  return <PlayerPage id={params.id} />;
}
