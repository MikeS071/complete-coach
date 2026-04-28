import { ClientProfilePage } from "@/components/clients/client-profile-page";

interface ClientProfileRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientProfileRoute({ params }: ClientProfileRouteProps) {
  const { id } = await params;

  return <ClientProfilePage clientId={id} />;
}
