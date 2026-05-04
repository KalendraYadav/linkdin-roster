import { roastStore } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = roastStore.get(id);

  if (!session) {
    return Response.json({ error: "Roast not found" }, { status: 404 });
  }

  return Response.json({ data: session });
}
