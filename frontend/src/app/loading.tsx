
export default function Loading() {
  return (
    <main
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-gray-600">
        <span className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-700" />
        <span>Chargement Nader...</span>
      </div>
    </main>
  );
}
