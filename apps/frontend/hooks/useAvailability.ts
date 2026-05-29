"use client";

import { useEffect, useState } from "react";
import { apiGet, isMockMode } from "@/lib/api";
import { mockAvailability } from "@/lib/mock-data";
import type { AvailabilityBlock } from "@/types/availability";

export function useAvailability(tenantSlug: string) {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isMockMode()) {
        setBlocks(mockAvailability);
        setLoading(false);
        return;
      }
      const data = await apiGet<AvailabilityBlock[]>(`/public/${tenantSlug}/availability`);
      setBlocks(data);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, [tenantSlug]);

  return { blocks, loading };
}
