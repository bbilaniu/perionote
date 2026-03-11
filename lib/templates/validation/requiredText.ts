export function requiredText(value: string, fieldName: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Missing required value for ${fieldName}`);
  }

  return trimmed;
}
