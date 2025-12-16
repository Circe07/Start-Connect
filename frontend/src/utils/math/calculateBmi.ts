export const calculateBMI = (heightCm: string, weightKg: string) => {
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  if (h && w && h > 0) {
    const heightM = h / 100;
    return w / (heightM * heightM);
  }
  return null;
};
