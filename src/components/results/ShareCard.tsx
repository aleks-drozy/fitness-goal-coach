// ShareCard is temporarily disabled — html2canvas removed from dependencies.
// Restore by: (1) add html2canvas back to package.json, (2) uncomment this file,
// (3) re-import ShareCard in results/page.tsx.

// "use client";
// import { useRef, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { EstimateResult, WizardState } from "@/lib/types";
//
// interface ShareCardProps {
//   result: EstimateResult;
//   state: WizardState;
// }
//
// export function ShareCard({ result, state }: ShareCardProps) {
//   const cardRef = useRef<HTMLDivElement>(null);
//   const [generating, setGenerating] = useState(false);
//
//   async function handleDownload() {
//     setGenerating(true);
//     const html2canvas = (await import("html2canvas")).default;
//     if (!cardRef.current) { setGenerating(false); return; }
//     const canvas = await html2canvas(cardRef.current, { backgroundColor: "#0f111a", scale: 2, useCORS: true, logging: false,
//       onclone: (clonedDoc: Document) => { clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((n: Element) => n.remove()); clonedDoc.body.style.cssText = "margin:0;padding:0;background:#0f111a"; }
//     });
//     const link = document.createElement("a");
//     link.download = "my-fitness-estimate.png";
//     link.href = canvas.toDataURL("image/png");
//     link.click();
//     setGenerating(false);
//   }
//   return (
//     <div>
//       <div ref={cardRef} className="pointer-events-none fixed -left-[9999px] top-0" style={{ width: 600 }}>
//         {/* card content here */}
//       </div>
//       <Button variant="outline" size="sm" onClick={handleDownload} disabled={generating}>
//         {generating ? "Generating…" : "⬇ Download results card"}
//       </Button>
//     </div>
//   );
// }

export {};
