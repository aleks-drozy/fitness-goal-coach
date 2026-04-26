export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start"
      style={{
        padding: "2.5rem 1.5rem 3.5rem",
      }}
    >
      <div className="w-full max-w-[26rem] space-y-8">
        {children}
      </div>
    </div>
  );
}
