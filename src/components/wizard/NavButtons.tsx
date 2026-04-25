"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface NavButtonsProps {
  backHref?: string;
  onNext?: () => void;
  nextLabel?: string;
  nextHref?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function NavButtons({
  backHref,
  onNext,
  nextLabel = "Continue",
  nextHref,
  disabled,
  isLoading,
}: NavButtonsProps) {
  const router = useRouter();

  const handleNext = () => {
    if (onNext) onNext();
    if (nextHref) router.push(nextHref);
  };

  return (
    <div className="flex items-center justify-between pt-8">
      {backHref ? (
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="text-sm font-medium transition-colors"
          style={{
            color: "var(--muted-foreground)",
            transitionDuration: "var(--dur-fast)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--foreground)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)")
          }
        >
          ← Back
        </button>
      ) : (
        <div />
      )}

      <Button
        onClick={handleNext}
        disabled={disabled || isLoading}
        size="lg"
        className="min-w-[8.5rem]"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span
              className="size-3.5 rounded-full border-2 border-t-transparent animate-spin"
              style={{
                borderColor:
                  "oklch(0.14 0.015 255 / 30%) oklch(0.14 0.015 255 / 30%) oklch(0.14 0.015 255 / 30%) oklch(0.14 0.015 255)",
              }}
            />
            Generating…
          </span>
        ) : (
          nextLabel
        )}
      </Button>
    </div>
  );
}
