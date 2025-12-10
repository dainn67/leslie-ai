export const convertDateToDDMMYYYY = (input: Date | number | string, language: "en" | "vi" = "en"): string => {
  let date: Date;
  const locale = language == "en" ? "en-GB" : "vi-VN";

  if (input instanceof Date) {
    date = input;
  } else if (typeof input === "number") {
    date = new Date(input);
  } else if (typeof input === "string") {
    const maybeNumber = Number(input);
    date = isNaN(maybeNumber) ? new Date(input) : new Date(maybeNumber);
  } else {
    throw new Error("Invalid input type for date conversion");
  }

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const normalizeDate = (date: Date) => {
  const normalized = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime();
};

// Negative if version1 < version2, 0 if version1 == version2, positive if version1 > version2
export const compareVersions = (version1: string, version2: string): number => {
  const v1 = version1.split(".");
  const v2 = version2.split(".");
  for (let i = 0; i < v1.length && i < v2.length; i++) {
    const diff = parseInt(v1[i]) - parseInt(v2[i]);
    if (diff !== 0) return diff;
  }
  return v1.length - v2.length;
};
