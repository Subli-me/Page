export type SizeGuideRow = {
  size: string;
  chestCm: string;
  lengthCm: string;
};

export type SizeGuide = {
  label: string;
  rows: SizeGuideRow[];
};

const REMERA_GUIDE: SizeGuide = {
  label: "Remeras",
  rows: [
    { size: "S", chestCm: "48", lengthCm: "68" },
    { size: "M", chestCm: "51", lengthCm: "70" },
    { size: "L", chestCm: "54", lengthCm: "72" },
    { size: "XL", chestCm: "57", lengthCm: "74" },
  ],
};

const BUZO_GUIDE: SizeGuide = {
  label: "Buzos",
  rows: [
    { size: "S", chestCm: "54", lengthCm: "66" },
    { size: "M", chestCm: "57", lengthCm: "68" },
    { size: "L", chestCm: "60", lengthCm: "70" },
    { size: "XL", chestCm: "63", lengthCm: "72" },
  ],
};

const CHOMBA_GUIDE: SizeGuide = {
  label: "Chombas",
  rows: [
    { size: "S", chestCm: "49", lengthCm: "67" },
    { size: "M", chestCm: "52", lengthCm: "69" },
    { size: "L", chestCm: "55", lengthCm: "71" },
    { size: "XL", chestCm: "58", lengthCm: "73" },
  ],
};

// Medida tomada de axila a axila (ancho de pecho) y de hombro a bajo (largo).
// Ajustar estos valores por los de tus prendas reales cuando las tengas medidas.
export function getSizeGuide(productSlug: string): SizeGuide {
  if (productSlug.includes("buzo")) return BUZO_GUIDE;
  if (productSlug.includes("chomba")) return CHOMBA_GUIDE;
  return REMERA_GUIDE;
}
