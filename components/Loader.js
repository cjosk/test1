'use client';

export default function Loader({ label }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 text-neon">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-neon" />
      {label && <p className="text-sm font-medium text-gray-600">{label}</p>}
    </div>
  );
}
