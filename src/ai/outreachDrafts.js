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
    const leadScore = lead.score?.leadScore || 0;
    const tier = lead.score?.tier || 'D';
    const hasEmail = lead.contacts?.emails?.length > 0;
    const hasContactForm = lead.signals?.websiteSignals?.hasContactForm || false;
    const hasBookingWidget = lead.signals?.websiteSignals?.hasBookingWidget || false;
    const hasChatWidget = lead.signals?.websiteSignals?.hasChatWidget || false;
    const techSignals = lead.signals?.techSignals || {};
    const websiteChunk = lead.signals?.websiteChunk || '';

    const prompt = buildPrompt({
      businessName,
      category,
      location,
      hasWebsite,
      rating,
      reviewCount,
      leadScore,
      tier,
      hasEmail,
      hasContactForm,
      hasBookingWidget,
      hasChatWidget,
      techSignals,
      websiteChunk,
      options
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options?.ai?.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert B2B sales copywriter with 10+ years of experience crafting personalized outreach for local service businesses. You write compelling, value-driven messages that get responses. Your style is professional yet conversational, focusing on specific pain points and concrete benefits rather than generic pitches.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      log.error(`OpenAI API error: ${response.status} ${response.statusText}`);
      return { coldEmail: '', voicemail: '', sms: '' };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Debug: Log raw AI response for troubleshooting
    log.debug(`Raw AI response for ${businessName}:`, content.substring(0, 200));

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

function buildPrompt({
  businessName,
  category,
  location,
  hasWebsite,
  rating,
  reviewCount,
  leadScore,
  tier,
  hasEmail,
  hasContactForm,
  hasBookingWidget,
  hasChatWidget,
  techSignals,
  websiteChunk,
  options
}) {
  const yourName = options?.ai?.yourName || '';
  const yourCompany = options?.ai?.yourCompany?.name || 'Our Agency';
  const yourServices = options?.ai?.yourCompany?.services || 'digital marketing services';
  const yourCompanyDescription = options?.ai?.yourCompany?.description || '';
  const targetAudience = options?.ai?.yourCompany?.targetAudience || 'local service businesses';
  
  // Debug log to verify values are being passed
  log.info('AI Prompt Context', { 
    yourName: yourName || '(empty)', 
    yourCompany, 
    yourServices,
    hasWebsiteChunk: websiteChunk?.length > 0
  });
  
  // Build context about the business
  let businessContext = `Business: ${businessName}
Category: ${category}
Location: ${location}
`;
  
  if (rating > 0) {
    businessContext += `Reputation: ${rating}/5 stars (${reviewCount} reviews) - ${rating >= 4.5 ? 'Excellent' : rating >= 4.0 ? 'Strong' : 'Good'} reputation\n`;
  }
  
  businessContext += `Lead Quality: ${tier} tier (Score: ${leadScore}/100)\n`;
  
  // Website & tech insights
  let techContext = '';
  if (hasWebsite) {
    techContext += `\nWebsite Features:\n`;
    if (hasContactForm) techContext += `- Has contact form\n`;
    if (hasBookingWidget) techContext += `- Has booking widget\n`;
    if (hasChatWidget) techContext += `- Has chat widget\n`;
    
    const hasTech = Object.values(techSignals).some(v => v);
    if (hasTech) {
      techContext += `Marketing Tech: `;
      const activeTech = Object.entries(techSignals)
        .filter(([_, active]) => active)
        .map(([tech, _]) => tech);
      techContext += activeTech.length > 0 ? activeTech.join(', ') : 'None detected';
      techContext += `\n`;
    } else {
      techContext += `Marketing Tech: None detected (opportunity for improvement)\n`;
    }
  } else {
    techContext += `\nWebsite: None found (major opportunity!)\n`;
  }
  
  // Add website content context if available
  let websiteContext = '';
  if (websiteChunk && websiteChunk.length > 50) {
    websiteContext = `\n--- WEBSITE CONTENT (extracted from their homepage) ---
${websiteChunk}
--- END WEBSITE CONTENT ---

Use the above website content to:
- Understand their specific services and offerings
- Reference their unique selling points or specialties
- Identify gaps or opportunities in their current messaging
- Personalize your outreach with specific details from their site
`;
  }
  
  // Build sender context
  let senderContext = `You're reaching out on behalf of ${yourCompany}, which provides ${yourServices} for ${targetAudience}.`;
  if (yourCompanyDescription) {
    senderContext += `\n\nAbout ${yourCompany}: ${yourCompanyDescription}`;
  }
  if (yourName) {
    senderContext += `\n\nThe outreach will be signed by: ${yourName}`;
  }
  
  return `${senderContext}

TARGET BUSINESS:
${businessContext}${techContext}${websiteContext}
Your Task: Create highly personalized outreach that:
1. References specific details about THEIR business (location, reputation, current tech setup)
2. Identifies a relevant pain point or opportunity based on their current situation
3. Positions your services as the solution with concrete benefits
4. Uses their business name naturally (not just in greeting)
5. Includes social proof or credibility elements
6. Has a clear, low-friction call-to-action

Tone: Professional but warm, consultative not salesy, confident but not pushy.

Generate 3 outreach formats:

1. COLD EMAIL (200-250 words)
   - Compelling subject line that mentions their business or a specific insight
   - Personalized opening that shows you researched them
   - 2-3 specific value propositions relevant to their situation
   - Clear CTA with next step
   - Sign off with: ${yourName || '[Your Name]'}, ${yourCompany}

2. VOICEMAIL SCRIPT (45-60 seconds)
   - Natural conversational tone
   - Hook them in first 10 seconds
   - Mention specific detail about their business
   - Clear reason to call back
   - Introduce yourself as: ${yourName || '[Your Name]'} from ${yourCompany}

3. SMS MESSAGE (140-160 characters)
   - Ultra-concise but personalized
   - Include business name
   - One specific hook
   - Clear CTA
   - Sign with first name: ${yourName ? yourName.split(' ')[0] : '[Name]'}

Format EXACTLY as:

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
    // More flexible regex patterns to handle variations in AI output
    const subjectMatch = content.match(/COLD_EMAIL_SUBJECT:\s*\n(.+?)(?=\n\n|COLD_EMAIL_BODY:|$)/s);
    const bodyMatch = content.match(/COLD_EMAIL_BODY:\s*\n([\s\S]+?)(?=\n\nVOICEMAIL:|VOICEMAIL:|$)/);
    const voicemailMatch = content.match(/VOICEMAIL:\s*\n([\s\S]+?)(?=\n\nSMS:|SMS:|$)/);
    const smsMatch = content.match(/SMS:\s*\n([\s\S]+?)$/);

    if (subjectMatch && bodyMatch) {
      const subject = subjectMatch[1].trim();
      const body = bodyMatch[1].trim();
      outreach.coldEmail = `Subject: ${subject}\n\n${body}`;
      log.debug(`Parsed email - Subject length: ${subject.length}, Body length: ${body.length}`);
    } else {
      log.warning('Failed to parse email subject/body from AI response');
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
