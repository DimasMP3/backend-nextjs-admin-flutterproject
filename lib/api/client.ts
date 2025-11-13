export async function api<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {

  const res = await fetch(input, {

    ...init,

    headers: {

      "content-type": "application/json",
      ...(init?.headers || {}),

    },

    cache: "no-store",

  });

  if (!res.ok) {

    let error: unknown;

    try {

      error = await res.json();

    } catch {

      error = await res.text();

    }

    throw new Error(typeof error === "string" ? error : JSON.stringify(error));

  }

  return res.json() as Promise<T>;

}
