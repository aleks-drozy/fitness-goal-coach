export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-12">
      <div className="w-full max-w-lg space-y-8">
        {children}
      </div>
    </div>
  );
}
