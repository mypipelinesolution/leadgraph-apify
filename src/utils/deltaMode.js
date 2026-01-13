import { Actor } from 'apify';
import crypto from 'crypto';

export async function applyDeltaMode(leads) {
  const prevState = await loadPreviousState();
  const changedLeads = [];
  const newState = {};
  
  for (const lead of leads) {
    const contentHash = computeContentHash(lead);
    newState[lead.dedupeId] = contentHash;
    
    if (!prevState[lead.dedupeId] || prevState[lead.dedupeId] !== contentHash) {
      changedLeads.push(lead);
    }
  }
  
  await saveState(newState);
  return changedLeads;
}

async function loadPreviousState() {
  try {
    const state = await Actor.getValue('LEAD_STATE');
    return state || {};
  } catch (error) {
    return {};
  }
}

async function saveState(state) {
  await Actor.setValue('LEAD_STATE', state);
}

function computeContentHash(lead) {
  const coreFields = {
    name: lead.business?.name,
    address: lead.business?.address?.formatted,
    phoneE164: lead.business?.phoneE164,
    domain: lead.online?.domain,
    emails: lead.contacts?.emails?.map(e => e.email) || [],
    score: lead.score?.leadScore
  };
  
  return crypto.createHash('sha1')
    .update(JSON.stringify(coreFields))
    .digest('hex');
}
