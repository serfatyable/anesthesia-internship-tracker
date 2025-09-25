type Params = { params: { id: string } };

export default function RotationPage({ params }: Params) {
  const id = params.id;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Rotation: {id.toUpperCase()}</h1>
      <p className="text-sm text-zinc-500">
        Placeholder page. In T5+ we&apos;ll show requirements, procedures, and progress for this
        rotation.
      </p>
      <ul className="list-disc pl-6 text-sm">
        <li>Required procedures (min counts): coming soon</li>
        <li>Pending verifications: coming soon</li>
        <li>Resources (videos/readings/exams): coming soon</li>
      </ul>
    </section>
  );
}
