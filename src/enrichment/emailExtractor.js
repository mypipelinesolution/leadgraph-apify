import { validate } from 'email-validator';

export function extractEmails(htmlContent, domain) {
  if (!htmlContent) {
    return [];
  }

  const emails = new Map();
  
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = htmlContent.match(emailRegex) || [];
  
  for (const email of matches) {
    const cleanEmail = email.toLowerCase().trim();
    
    if (!validate(cleanEmail)) {
      continue;
    }
    
    if (cleanEmail.includes('example.com') || 
        cleanEmail.includes('test.com') ||
        cleanEmail.includes('placeholder')) {
      continue;
    }
    
    const isRoleBased = isRoleBasedEmail(cleanEmail);
    const emailDomain = cleanEmail.split('@')[1];
    const matchesDomain = domain && emailDomain === domain;
    
    let confidence = 0.5;
    if (matchesDomain) confidence += 0.3;
    if (!isRoleBased) confidence += 0.2;
    
    const source = htmlContent.includes(`mailto:${cleanEmail}`) ? 'mailto' : 'text';
    if (source === 'mailto') confidence += 0.1;
    
    confidence = Math.min(confidence, 1.0);
    
    if (!emails.has(cleanEmail)) {
      emails.set(cleanEmail, {
        email: cleanEmail,
        source: source,
        confidence: confidence,
        isRoleBased: isRoleBased,
        isValidated: false
      });
    }
  }
  
  const emailArray = Array.from(emails.values());
  
  emailArray.sort((a, b) => b.confidence - a.confidence);
  
  return emailArray;
}

function isRoleBasedEmail(email) {
  const roleBased = [
    'info@',
    'contact@',
    'hello@',
    'support@',
    'sales@',
    'admin@',
    'office@',
    'service@',
    'help@',
    'mail@',
    'team@',
    'noreply@',
    'no-reply@'
  ];
  
  return roleBased.some(prefix => email.startsWith(prefix));
}
