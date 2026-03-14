"use client";

import { useEffect, useState } from "react";
import { HealthProfileModal } from "@/components/health-profile-modal";
import { hasUserProfile } from "@/lib/user-profile";

export function AppHealthGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasUserProfile()) {
      setOpen(true);
    }
  }, []);

  return (
    <HealthProfileModal
      open={open}
      onClose={() => setOpen(false)}
      onSave={() => setOpen(false)}
    />
  );
}