export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold">Detalle de Ruta: {id}</h1>
        </main>
    );
}
