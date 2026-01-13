import crypto from 'crypto';

export function generateDedupeId(business) {
  const normName = normalizeName(business.name);
  const normAddress = normalizeAddress(business.address?.formatted);
  const domain = business.domain || '';
  const phoneE164 = business.phoneE164 || '';
  
  const input = `${normName}|${normAddress}|${domain}|${phoneE164}`;
  return crypto.createHash('sha1').update(input).digest('hex').substring(0, 16);
}

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAddress(address) {
  return (address || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
