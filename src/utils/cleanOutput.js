/**
 * Clean and format lead data for final output
 * Removes unnecessary fields and creates actionable lead records
 * Column order optimized for CSV/Excel usability
 */

export function cleanLeadForOutput(lead) {
  return {
    // ===== LEAD QUALITY (most important first) =====
    tier: lead.score.tier,
    leadScore: lead.score.leadScore,
    
    // ===== BUSINESS IDENTITY =====
    businessName: lead.business.name,
    category: lead.business.category,
    
    // ===== PRIMARY CONTACT INFO =====
    phone: lead.business.phone,
    email: lead.contacts.emails[0]?.email || '',
    website: lead.online.website || '',
    
    // ===== LOCATION =====
    address: lead.business.address.formatted,
    city: lead.business.address.city,
    state: lead.business.address.state,
    zip: lead.business.address.postalCode,
    
    // ===== REPUTATION =====
    rating: lead.signals.reviews.rating,
    reviewCount: lead.signals.reviews.reviewCount,
    
    // ===== WEBSITE SUMMARY =====
    websiteSummary: extractWebsiteSummary(lead.signals?.websiteChunk),
    
    // ===== AI OUTREACH (ready to use) =====
    coldEmailSubject: extractEmailSubject(lead.ai?.coldEmail),
    coldEmailBody: extractEmailBody(lead.ai?.coldEmail),
    voicemailScript: lead.ai?.voicemail || '',
    smsMessage: lead.ai?.sms || '',
    
    // ===== SOCIAL MEDIA =====
    facebook: lead.online.socials?.facebook || '',
    instagram: lead.online.socials?.instagram || '',
    linkedin: lead.online.socials?.linkedin || '',
    
    // ===== ADDITIONAL CONTACTS =====
    additionalEmails: lead.contacts.emails.slice(1).map(e => e.email).join(', '),
    additionalPhones: lead.contacts.phones.slice(1).map(p => p.phone).join(', '),
    
    // ===== WEBSITE SIGNALS =====
    hasContactForm: lead.signals.websiteSignals?.hasContactForm || false,
    hasBookingWidget: lead.signals.websiteSignals?.hasBookingWidget || false,
    hasChatWidget: lead.signals.websiteSignals?.hasChatWidget || false,
    scoreReasons: lead.score.reasons.join(', '),
    
    // ===== METADATA =====
    source: getSource(lead.sources),
    collectedAt: lead.raw.collectedAt,
    dedupeId: lead.dedupeId
  };
}

function extractEmailSubject(coldEmail) {
  if (!coldEmail) return '';
  const match = coldEmail.match(/^Subject:\s*(.+?)(?:\n|$)/m);
  return match ? match[1].trim() : '';
}

function extractEmailBody(coldEmail) {
  if (!coldEmail) return '';
  // Remove "Subject: [subject line]" and any leading/trailing whitespace
  const withoutSubject = coldEmail.replace(/^Subject:.*?\n+/m, '').trim();
  return withoutSubject || coldEmail;
}

function getSource(sources) {
  if (sources.googleMaps) return 'Google Maps';
  if (sources.yelp) return 'Yelp';
  if (sources.bbb) return 'BBB';
  if (sources.serp) return 'Google Search';
  return 'Unknown';
}

function extractWebsiteSummary(websiteChunk) {
  if (!websiteChunk) return '';
  
  // Extract key parts from the structured websiteChunk
  const parts = [];
  
  // Get title
  const titleMatch = websiteChunk.match(/TITLE:\s*(.+?)(?:\n|$)/i);
  if (titleMatch) parts.push(titleMatch[1].trim());
  
  // Get description
  const descMatch = websiteChunk.match(/DESCRIPTION:\s*(.+?)(?:\n|$)/i);
  if (descMatch) parts.push(descMatch[1].trim());
  
  // Get main headings
  const headingsMatch = websiteChunk.match(/MAIN HEADINGS:\s*(.+?)(?:\n|$)/i);
  if (headingsMatch) parts.push(`Services: ${headingsMatch[1].trim()}`);
  
  // Get sections
  const sectionsMatch = websiteChunk.match(/SECTIONS:\s*(.+?)(?:\n|$)/i);
  if (sectionsMatch && !headingsMatch) parts.push(`Sections: ${sectionsMatch[1].trim()}`);
  
  // If we got structured data, return it
  if (parts.length > 0) {
    return parts.join(' | ').substring(0, 500);
  }
  
  // Fallback: return first 300 chars of content
  const contentMatch = websiteChunk.match(/CONTENT:\s*([\s\S]+)/i);
  if (contentMatch) {
    return contentMatch[1].trim().substring(0, 300).replace(/\s+/g, ' ');
  }
  
  return websiteChunk.substring(0, 300).replace(/\s+/g, ' ');
}

export function cleanLeadsForDataset(leads) {
  return leads.map(lead => cleanLeadForOutput(lead));
}
