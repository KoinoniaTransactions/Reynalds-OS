import "server-only";

export function isAllowedPersonalFinanceHost(
  host: string | undefined
): boolean {
  const normalized =
    host?.trim().toLowerCase() ?? "";

  const hostname =
    normalizedHostName(normalized);

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    return true;
  }

  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    return false;
  }

  return isPrivateIpv4Address(
    hostname
  );
}

function normalizedHostName(
  host: string
): string {
  if (host.startsWith("[")) {
    const closingBracket =
      host.indexOf("]");

    if (closingBracket !== -1) {
      return host.slice(
        1,
        closingBracket
      );
    }
  }

  return host.split(":")[0] ?? "";
}

function isPrivateIpv4Address(
  hostname: string
): boolean {
  const octets =
    hostname.split(".").map(Number);

  if (
    octets.length !== 4 ||
    octets.some(
      (octet) =>
        !Number.isInteger(octet) ||
        octet < 0 ||
        octet > 255
    )
  ) {
    return false;
  }

  const [first, second] = octets;

  return (
    first === 10 ||
    (
      first === 172 &&
      second !== undefined &&
      second >= 16 &&
      second <= 31
    ) ||
    (
      first === 192 &&
      second === 168
    )
  );
}
