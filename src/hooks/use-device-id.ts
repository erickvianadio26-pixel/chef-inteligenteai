import { useEffect, useState } from "react";

const KEY = "chef-caseiro:device-id";

function generate(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `dev-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Stable per-browser identifier used to scope recipe history. */
export function useDeviceId(): string | null {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    try {
      let stored = localStorage.getItem(KEY);
      if (!stored) {
        stored = generate();
        localStorage.setItem(KEY, stored);
      }
      setId(stored);
    } catch {
      // localStorage unavailable — generate a session-only id.
      setId(generate());
    }
  }, []);

  return id;
}
