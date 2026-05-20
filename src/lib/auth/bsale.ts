const BSALE_BASE_URL = "https://api.bsale.io/v1";
const BSALE_ACCESS_TOKEN = process.env.BSALE_ACCESS_TOKEN;

export interface BSaleClient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  code: string;
  phone: string;
  company: string;
  state: number;
  activity: string;
  hasCredit: number;
  maxCredit: number;
  points: number;
  attributes?: {
    items: Array<{
      id: number;
      name: string;
      value: string;
      type: number;
      href: string;
    }>;
  };
}

export interface BSaleClientResponse {
  href: string;
  count: number;
  limit: number;
  offset: number;
  items: BSaleClient[];
}

const CLUB_ATTRIBUTE_ID = 29;

export async function getClientByRut(
  rut: string,
  expandAttributes: boolean = true,
): Promise<BSaleClient | null> {
  const params = new URLSearchParams({
    code: rut,
    expand: expandAttributes ? "[attributes]" : "",
  });

  const response = await fetch(
    `${BSALE_BASE_URL}/clients.json?${params.toString()}`,
    {
      headers: {
        access_token: BSALE_ACCESS_TOKEN!,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`BSale API error: ${response.status}`);
  }

  const data: BSaleClientResponse = await response.json();

  if (data.count === 0) {
    return null;
  }

  return data.items[0];
}

export function extractClubWilierNumber(client: BSaleClient): string | null {
  if (!client.attributes?.items) {
    return null;
  }

  const clubWilierAttribute = client.attributes.items.find(
    (attr) => attr.name === "Club Wilier",
  );

  return clubWilierAttribute ? client.id.toString() : null;
}

export function isClientActive(client: BSaleClient): boolean {
  return client.state === 0;
}

export async function getMembershipName(client: BSaleClient) {
  const rut = client.code;
  const clientWithAttributes = await getClientByRut(rut);

  const attribute = clientWithAttributes?.attributes?.items.find(
    (attr) => attr.id === CLUB_ATTRIBUTE_ID,
  );
  if (!attribute) {
    return { clientId: null, membershipName: null };
  }

  const response = await fetch(attribute.href, {
    headers: {
      access_token: BSALE_ACCESS_TOKEN!,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error obteniendo attributo");
  }

  const clubAttribute: {
    details: { items: Array<{ id: number; name: string; value: string }> };
  } = await response.json();

  const clubAttributeValue = clubAttribute.details.items.find(
    (attr) => parseInt(attribute.value) === attr.id,
  );

  if (!clubAttributeValue) {
    return { clientId: null, membershipName: null };
  }

  return {
    clientId: client.id.toString(),
    membershipName: clubAttributeValue?.name ?? "",
  };
}
