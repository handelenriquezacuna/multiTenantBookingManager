"use client";

import { useEffect, useState } from "react";
import { apiGet, isMockMode } from "@/lib/api";
import { mockBookings } from "@/lib/mock-data";
import type { Booking } from "@/types/booking";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isMockMode()) {
        setBookings(mockBookings);
        setLoading(false);
        return;
      }
      const data = await apiGet<Booking[]>("/bookings");
      setBookings(data);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, []);

  return { bookings, loading };
}
