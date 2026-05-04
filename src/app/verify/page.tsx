export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ rut?: string }>;
}) {
  const { rut } = await searchParams;

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Verificación Exitosa</h1>
      {rut && <p className="mt-4 text-lg">RUT: {rut}</p>}
    </div>
  );
}
