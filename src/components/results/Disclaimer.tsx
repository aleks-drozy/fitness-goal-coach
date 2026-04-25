export function Disclaimer() {
  return (
    <p
      className="text-xs leading-relaxed pt-4 border-t"
      style={{
        color: "var(--muted-foreground)",
        borderColor: "var(--border)",
        opacity: 0.7,
      }}
    >
      This estimate is for general guidance only. It is not medical advice and does not replace a
      doctor, physiotherapist, registered dietitian, or qualified coach. Timelines depend on
      many individual factors including genetics, consistency, sleep, stress, and nutrition.
      Progress will vary.
    </p>
  );
}
