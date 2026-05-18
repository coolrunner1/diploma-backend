import { randomUUID } from "crypto";

/** Remove uuid fields from client payloads (uuids are server-generated). */
export const stripUuidFields = <T extends Record<string, unknown>>(
  data: T,
  fields: string[] = ["uuid"]
): Omit<T, "uuid"> => {
  const copy = { ...data };
  for (const field of fields) {
    delete copy[field];
  }
  return copy;
};

export const withGeneratedUuid = <T extends Record<string, unknown>>(
  data: T,
  field = "uuid"
): T & Record<string, string> => ({
  ...data,
  [field]: randomUUID()
});
