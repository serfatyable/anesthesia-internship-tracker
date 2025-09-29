export async function GET() {
  return Response.json({ error: 'Authentication error' }, { status: 400 });
}
