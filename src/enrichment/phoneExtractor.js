import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export function extractPhones(htmlContent, countryCode = 'US') {
  if (!htmlContent) {
    return [];
  }

  const phones = new Map();
  
  const phonePatterns = [
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /\d{3}[-.\s]\d{3}[-.\s]\d{4}/g,
    /\d{10}/g,
    /1[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
  ];
  
  const cleanText = htmlContent.replace(/<[^>]*>/g, ' ');
  
  for (const pattern of phonePatterns) {
    const matches = cleanText.match(pattern) || [];
    
    for (const match of matches) {
      try {
        let phoneNumber = match.trim();
        
        if (/^\d{10}$/.test(phoneNumber)) {
          phoneNumber = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
        }
        
        if (isValidPhoneNumber(phoneNumber, countryCode)) {
          const parsed = parsePhoneNumber(phoneNumber, countryCode);
          const phoneE164 = parsed.number;
          
          if (!phones.has(phoneE164)) {
            const source = htmlContent.includes(`tel:${phoneNumber}`) || 
                          htmlContent.includes(`href="tel:`) ? 'tel-link' : 'text';
            
            let confidence = 0.7;
            if (source === 'tel-link') confidence = 0.95;
            
            phones.set(phoneE164, {
              phone: parsed.formatNational(),
              phoneE164: phoneE164,
              source: source,
              confidence: confidence
            });
          }
        }
      } catch (error) {
        // Invalid phone number, skip
      }
    }
  }
  
  const phoneArray = Array.from(phones.values());
  
  phoneArray.sort((a, b) => b.confidence - a.confidence);
  
  return phoneArray;
}
