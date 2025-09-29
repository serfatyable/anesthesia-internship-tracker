export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '2', 10);

  const allInterns = [
    {
      id: 'i1',
      name: 'John Doe',
      progress: { Cardiology: 80, Surgery: 60, Anesthesiology: 100 },
    },
    {
      id: 'i2',
      name: 'Jane Roe',
      progress: { Cardiology: 40, Surgery: 90, Anesthesiology: 70 },
    },
    {
      id: 'i3',
      name: 'Sam Patel',
      progress: { Cardiology: 100, Surgery: 100, Anesthesiology: 100 },
    },
    {
      id: 'i4',
      name: 'Maria Garcia',
      progress: { Cardiology: 30, Surgery: 50, Anesthesiology: 40 },
    },
  ];
  const start = (page - 1) * limit;
  const paginated = allInterns.slice(start, start + limit);

  return Response.json({ interns: paginated, total: allInterns.length });
}
