// src/utils/fechasFirestore.ts
export function toDateFromFirestore(value: any): Date | null {
  if (!value) return null;

  // Timestamp de Firestore (v9) tiene toDate()
  if (typeof value === "object" && value !== null && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }

  // Timestamp crudo { seconds, nanoseconds }
  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof (value as any).seconds === "number"
  ) {
    return new Date((value as any).seconds * 1000);
  }

  // String ISO o similar
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function toDisplayDate(value: any, locale = "es-MX"): string {
  const d = toDateFromFirestore(value);
  if (!d) return "";
  return d.toLocaleDateString(locale);
}

// Si usas <input type="date" />
export function toInputDate(value: any): string {
  const d = toDateFromFirestore(value);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
