import type { User } from "@repo/types";

/**
 * Checks whether a user has completed their profile.
 * Required fields: gender, birthDate, occupation.
 * A complete profile is required before submitting a guest list application.
 */
export function isProfileComplete(
  user: Pick<User, "gender" | "birthDate" | "occupation">
): boolean {
  return (
    user.gender !== null &&
    user.gender !== undefined &&
    user.birthDate !== null &&
    user.birthDate !== undefined &&
    user.occupation !== null &&
    user.occupation !== undefined &&
    user.occupation.trim() !== ""
  );
}

/**
 * Returns the list of missing profile fields.
 */
export function missingProfileFields(
  user: Pick<User, "gender" | "birthDate" | "occupation">
): Array<"gender" | "birthDate" | "occupation"> {
  const missing: Array<"gender" | "birthDate" | "occupation"> = [];
  if (!user.gender) missing.push("gender");
  if (!user.birthDate) missing.push("birthDate");
  if (!user.occupation || user.occupation.trim() === "")
    missing.push("occupation");
  return missing;
}
