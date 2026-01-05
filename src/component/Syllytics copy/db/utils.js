// src/db/utils.js
export const timestamp = () => new Date().toISOString();

export const sanitizeRecord = (record) => {
  return Object.fromEntries(
    Object.entries(record).filter(([_, v]) => v !== undefined)
  );
};
