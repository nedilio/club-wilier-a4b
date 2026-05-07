export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ rut?: string; membership?: string }>;
}) {
  const { rut, membership } = await searchParams;

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Verificación Exitosa</h1>
      {rut && <p className="mt-4 text-lg">RUT: {rut}</p>}
      {membership && (
        <p className="mt-4 text-lg">Miembro del club: {membership}</p>
      )}
    </div>
  );
}
