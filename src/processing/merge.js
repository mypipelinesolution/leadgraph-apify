export function mergeLeads(rawLeads) {
  const grouped = groupByDedupeId(rawLeads);
  return Object.values(grouped).map(mergeDuplicates);
}

function groupByDedupeId(leads) {
  const grouped = {};
  
  for (const lead of leads) {
    if (!grouped[lead.dedupeId]) {
      grouped[lead.dedupeId] = [];
    }
    grouped[lead.dedupeId].push(lead);
  }
  
  return grouped;
}

function mergeDuplicates(leads) {
  if (leads.length === 1) {
    return leads[0];
  }
  
  const merged = {
    dedupeId: leads[0].dedupeId,
    confidence: calculateConfidence(leads),
    sources: {},
    business: {},
    online: {},
    contacts: { emails: [], phones: [], keyPeople: [] },
    signals: {},
    score: {},
    raw: {}
  };
  
  for (const lead of leads) {
    if (lead.sources) {
      Object.assign(merged.sources, lead.sources);
    }
    
    if (lead.business) {
      merged.business = mergeField(merged.business, lead.business, leads.length);
    }
    
    if (lead.online) {
      merged.online = mergeField(merged.online, lead.online, leads.length);
    }
    
    if (lead.contacts) {
      if (lead.contacts.emails) {
        merged.contacts.emails.push(...lead.contacts.emails);
      }
      if (lead.contacts.phones) {
        merged.contacts.phones.push(...lead.contacts.phones);
      }
    }
  }
  
  merged.contacts.emails = deduplicateEmails(merged.contacts.emails);
  merged.contacts.phones = deduplicatePhones(merged.contacts.phones);
  
  return merged;
}

function calculateConfidence(leads) {
  return Math.min(0.5 + (leads.length * 0.2), 1.0);
}

function mergeField(target, source, totalSources) {
  const result = { ...target };
  
  for (const key in source) {
    if (!result[key] || source[key]) {
      result[key] = source[key];
    }
  }
  
  return result;
}

function deduplicateEmails(emails) {
  const seen = new Set();
  const unique = [];
  
  for (const email of emails) {
    if (!seen.has(email.email)) {
      seen.add(email.email);
      unique.push(email);
    }
  }
  
  return unique;
}

function deduplicatePhones(phones) {
  const seen = new Set();
  const unique = [];
  
  for (const phone of phones) {
    const key = phone.phoneE164 || phone.phone;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(phone);
    }
  }
  
  return unique;
}
