/**
 * Fields safe to expose when viewing another user's profile (IDOR mitigation).
 */
const PUBLIC_USER_FIELDS = ['name', 'username', 'photo', 'nombre', 'bio'];

function pickPublicUserFields(data) {
  if (!data || typeof data !== 'object') return {};
  const out = {};
  for (const key of PUBLIC_USER_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined) {
      out[key] = data[key];
    }
  }
  return out;
}

module.exports = { PUBLIC_USER_FIELDS, pickPublicUserFields };
