import { log } from 'crawlee';

export async function generateOutreach(lead, options) {
  if (!options?.ai?.enabled) {
    return {
      coldEmail: '',
      voicemail: '',
      sms: ''
    };
  }

  const apiKey = options?.ai?.openaiApiKey || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    log.warning('OpenAI API key not provided - skipping AI outreach generation');
    return {
      coldEmail: '',
      voicemail: '',
      sms: ''
    };
  }

  try {
    const businessName = lead.business.name;
    const category = lead.business.category;
    const location = lead.business.address.city || lead.business.address.formatted;
    const website = lead.online.website;
    const hasWebsite = !!website;
    const rating = lead.signals?.reviews?.rating || 0;
    const reviewCount = lead.signals?.reviews?.reviewCount || 0;

    const prompt = buildPrompt(businessName, category, location, hasWebsite, rating, reviewCount, options);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options?.ai?.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional sales copywriter specializing in B2B outreach for local service businesses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      log.error(`OpenAI API error: ${response.status} ${response.statusText}`);
      return { coldEmail: '', voicemail: '', sms: '' };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    const outreach = parseOutreachResponse(content);

    log.info(`Generated AI outreach for ${businessName}`);
    return outreach;

  } catch (error) {
    log.error('AI outreach generation failed:', error.message);
    return {
      coldEmail: '',
      voicemail: '',
      sms: ''
    };
  }
}

function buildPrompt(businessName, category, location, hasWebsite, rating, reviewCount, options) {
  const yourCompany = options?.ai?.yourCompanyName || '[Your Company]';
  const yourService = options?.ai?.yourServiceOffering || 'digital marketing services';
  
  return `Generate personalized outreach content for a ${category} business:

Business: ${businessName}
Location: ${location}
Has Website: ${hasWebsite ? 'Yes' : 'No'}
Rating: ${rating > 0 ? `${rating}/5 (${reviewCount} reviews)` : 'Unknown'}

Your company: ${yourCompany}
Your offering: ${yourService}

Generate 3 types of outreach:

1. COLD EMAIL (subject + body, 150-200 words)
2. VOICEMAIL SCRIPT (30-45 seconds when read aloud)
3. SMS MESSAGE (160 characters max)

Make it:
- Personalized to their business
- Value-focused (not salesy)
- Include a clear call-to-action
- Professional but friendly tone

Format your response EXACTLY like this:

COLD_EMAIL_SUBJECT:
[subject line]

COLD_EMAIL_BODY:
[email body]

VOICEMAIL:
[voicemail script]

SMS:
[sms message]`;
}

function parseOutreachResponse(content) {
  const outreach = {
    coldEmail: '',
    voicemail: '',
    sms: ''
  };

  try {
    const subjectMatch = content.match(/COLD_EMAIL_SUBJECT:\s*\n(.+?)(?=\n\n|COLD_EMAIL_BODY:)/s);
    const bodyMatch = content.match(/COLD_EMAIL_BODY:\s*\n(.+?)(?=\n\n|VOICEMAIL:)/s);
    const voicemailMatch = content.match(/VOICEMAIL:\s*\n(.+?)(?=\n\n|SMS:)/s);
    const smsMatch = content.match(/SMS:\s*\n(.+?)$/s);

    if (subjectMatch && bodyMatch) {
      const subject = subjectMatch[1].trim();
      const body = bodyMatch[1].trim();
      outreach.coldEmail = `Subject: ${subject}\n\n${body}`;
    }

    if (voicemailMatch) {
      outreach.voicemail = voicemailMatch[1].trim();
    }

    if (smsMatch) {
      outreach.sms = smsMatch[1].trim();
    }

  } catch (error) {
    log.warning('Failed to parse AI response:', error.message);
  }

  return outreach;
}
