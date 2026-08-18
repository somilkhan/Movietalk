import { useParams } from "wouter";
import TitleDetail from "@/pages/TitleDetail";

export default function TitleDetailRoute() {
  const params = useParams<{ mediaType?: string; id: string }>();
  return <TitleDetail routeMediaType={params.mediaType} routeId={params.id} />;
}
