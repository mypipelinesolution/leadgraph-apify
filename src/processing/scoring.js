export function scoreLead(lead, weightsPreset = 'localService') {
  const score = calculateScore(lead, weightsPreset);
  const tier = assignTier(score);
  const reasons = generateReasons(lead, score);
  
  return { leadScore: score, tier, reasons };
}

function calculateScore(lead, weightsPreset) {
  let score = 0;
  
  const reviewCount = lead.signals?.reviews?.reviewCount || 0;
  const rating = lead.signals?.reviews?.rating || 0;
  
  if (reviewCount > 0 && rating > 0) {
    const reviewScore = Math.min((reviewCount / 50) * 15, 15);
    const ratingScore = (rating / 5) * 15;
    score += reviewScore + ratingScore;
  }
  
  if (lead.online?.website) {
    score += 20;
  }
  
  const hasEmail = lead.contacts?.emails?.length > 0;
  const hasPhone = lead.contacts?.phones?.length > 0;
  const hasContactForm = lead.contacts?.contactFormUrl;
  
  if (hasEmail) score += 10;
  if (hasPhone) score += 5;
  if (hasContactForm) score += 5;
  
  const techSignals = lead.signals?.techSignals || {};
  const techCount = Object.values(techSignals).filter(Boolean).length;
  score += Math.min(techCount * 3, 15);
  
  return Math.round(Math.min(score, 100));
}

function assignTier(score) {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

function generateReasons(lead, score) {
  const reasons = [];
  
  if (score >= 80) {
    reasons.push('High-quality lead with strong signals');
  }
  
  if (lead.signals?.reviews?.reviewCount > 20) {
    reasons.push('Well-reviewed business');
  }
  
  if (lead.online?.website) {
    reasons.push('Has active website');
  }
  
  if (lead.contacts?.emails?.length > 0) {
    reasons.push('Email contact available');
  }
  
  const techSignals = lead.signals?.techSignals || {};
  if (Object.values(techSignals).some(Boolean)) {
    reasons.push('Uses marketing technology');
  }
  
  return reasons;
}
