import type { Bouquet as BouquetType } from "@/types/bouquet";

type ShareLetter = {
  t?: string;
  st?: string;
  s: string;
  r: string;
  m: string;
  u?: string;
  p?: "auto" | "youtube" | "spotify" | "soundcloud";
  c?: string;
  fo?: string;
};

type SharePayload = {
  m: string;
  f: Array<{ i: number; c: number }>;
  l: ShareLetter;
  g: number;
  ts: number;
  o: number[];
  fn?: string;
};

const toBase64Url = (input: string) => {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (input: string) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding ? normalized + "=".repeat(4 - padding) : normalized;

  const binary =
    typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary");

  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const serializeBouquetToShareToken = (bouquet: BouquetType) => {
  const safeMessage =
    typeof bouquet.letter.message === "string" ? bouquet.letter.message : "";

  const payload: SharePayload = {
    m: bouquet.mode,
    f: bouquet.flowers.map((flower) => ({ i: flower.id, c: flower.count })),
    l: {
      t: bouquet.letter.title || "",
      st: bouquet.letter.songTitle || "",
      s: bouquet.letter.sender || "",
      r: bouquet.letter.recipient || "",
      m: safeMessage,
      u: bouquet.letter.songUrl || "",
      p: bouquet.letter.songPlatform || "auto",
      c: bouquet.letter.cardColor || "",
      fo: bouquet.letter.font || "",
    },
    g: bouquet.greenery,
    ts: bouquet.timestamp,
    o: bouquet.flowerOrder || [],
    fn: bouquet.font || "",
  };

  return toBase64Url(JSON.stringify(payload));
};

export const parseBouquetFromShareToken = (
  token: string
): BouquetType | null => {
  try {
    const decoded = fromBase64Url(token);
    const payload = JSON.parse(decoded) as SharePayload;

    return {
      mode: payload.m,
      flowers: payload.f.map((flower) => ({ id: flower.i, count: flower.c })),
      letter: {
        title: payload.l.t || "",
        songTitle: payload.l.st || "",
        sender: payload.l.s || "",
        recipient: payload.l.r || "",
        message: payload.l.m || "",
        songUrl: payload.l.u || "",
        songPlatform: payload.l.p || "auto",
        cardColor: payload.l.c || "",
        font: payload.l.fo || "",
      },
      greenery: payload.g,
      timestamp: payload.ts,
      flowerOrder: payload.o || [],
      font: payload.fn || undefined,
    };
  } catch {
    return null;
  }
};
