"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SourceDeleteButton({
  id,
  kind,
  name,
  affectedLookCount = 0,
}: {
  readonly id: string;
  readonly kind: "body-template" | "garment";
  readonly name: string;
  readonly affectedLookCount?: number;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteSource() {
    const lookNote = affectedLookCount > 0
      ? ` ${affectedLookCount} existing ${affectedLookCount === 1 ? "look" : "looks"} will stay in your library.`
      : " Existing looks will stay in your library.";
    if (!window.confirm(`Delete ${name}?${lookNote}`)) return;
    setIsDeleting(true);
    const response = await fetch(`/api/sources/${kind}/${id}`, { method: "DELETE" });
    if (response.ok) router.refresh();
    else {
      setIsDeleting(false);
      window.alert("The file could not be deleted. Reconnect Drive and try again.");
    }
  }

  return <button type="button" onClick={deleteSource} disabled={isDeleting} className="mt-3 text-[11px] font-bold text-coral-deep disabled:opacity-50">{isDeleting ? "Deleting…" : "Delete"}</button>;
}
