export function extractVerificationToken(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    const token = url.searchParams.get('token');

    if (token) {
      return token;
    }
  } catch {
    // Not a full URL — treat input as raw token.
  }

  return trimmed;
}
