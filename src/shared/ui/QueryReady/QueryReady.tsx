"use client";

import { useEffect } from "react";

// Reveals sections hidden until React has applied the address
const QueryReady = () => {
  // Drops the pending flag once the page shows the address
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      delete document.documentElement.dataset.pending;
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return null;
};

export default QueryReady;
