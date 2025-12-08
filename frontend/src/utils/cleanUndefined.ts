/**
 * Removes undefined values from an object to prevent Firestore errors
 * @param obj - The object to clean
 * @returns A new object without undefined values
 */
export const cleanUndefined = (obj: any): any => {
  const cleaned: any = {};
  
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  
  return cleaned;
};

/**
 * Removes undefined values from an object recursively
 * @param obj - The object to clean
 * @returns A new object without undefined values
 */
export const cleanUndefinedDeep = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedDeep).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      const cleanedValue = cleanUndefinedDeep(obj[key]);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }
  
  return obj;
};
