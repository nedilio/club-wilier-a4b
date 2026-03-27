export function validateRut(rut: string): boolean {
  const withoutHyphen = rut.replace(/-/g, "");
  const cleaned = withoutHyphen.replace(/[^0-9kK]/g, "");

  if (cleaned.length !== 9) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toLowerCase();

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDv = (11 - (sum % 11)).toString();
  const calculatedDv = expectedDv === "10" ? "k" : expectedDv;

  return dv === calculatedDv;
}

export function formatRut(rut: string): string {
  const cleaned = rut.replace(/[^0-9kK]/g, "");
  if (cleaned.length < 8) return rut;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toUpperCase();

  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${formattedBody}-${dv}`;
}

export function cleanRut(rut: string): string {
  return rut.replace(/\./g, "").replace(/\s/g, "").toLowerCase();
}
