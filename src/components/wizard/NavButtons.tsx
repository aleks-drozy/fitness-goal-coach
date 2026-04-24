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
    <div className="flex items-center justify-between pt-6">
      {backHref ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-500 hover:text-zinc-200"
          onClick={() => router.push(backHref)}
        >
          ← Back
        </Button>
      ) : (
        <div />
      )}
      <Button
        onClick={handleNext}
        disabled={disabled || isLoading}
        className="bg-white text-zinc-950 hover:bg-zinc-100 font-medium"
      >
        {isLoading ? "Loading…" : nextLabel}
      </Button>
    </div>
  );
}
