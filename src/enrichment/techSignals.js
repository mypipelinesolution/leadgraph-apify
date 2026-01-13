export function detectTechSignals(htmlContent) {
  if (!htmlContent) {
    return {
      googleAnalytics: false,
      googleTagManager: false,
      facebookPixel: false,
      hubspot: false,
      mailchimp: false
    };
  }

  const signals = {
    googleAnalytics: false,
    googleTagManager: false,
    facebookPixel: false,
    hubspot: false,
    mailchimp: false
  };

  const lowerHtml = htmlContent.toLowerCase();

  if (lowerHtml.includes('google-analytics.com/analytics.js') ||
      lowerHtml.includes('googletagmanager.com/gtag/js') ||
      lowerHtml.includes('ga(') ||
      lowerHtml.includes('gtag(') ||
      lowerHtml.includes('_gaq') ||
      lowerHtml.includes('ua-') && lowerHtml.includes('analytics')) {
    signals.googleAnalytics = true;
  }

  if (lowerHtml.includes('googletagmanager.com/gtm.js') ||
      lowerHtml.includes('gtm-') ||
      lowerHtml.includes('google tag manager')) {
    signals.googleTagManager = true;
  }

  if (lowerHtml.includes('connect.facebook.net') ||
      lowerHtml.includes('fbq(') ||
      lowerHtml.includes('facebook pixel') ||
      lowerHtml.includes('_fbp')) {
    signals.facebookPixel = true;
  }

  if (lowerHtml.includes('hubspot') ||
      lowerHtml.includes('hs-analytics') ||
      lowerHtml.includes('_hsq') ||
      lowerHtml.includes('js.hs-scripts.com')) {
    signals.hubspot = true;
  }

  if (lowerHtml.includes('mailchimp') ||
      lowerHtml.includes('mc.us') ||
      lowerHtml.includes('list-manage.com') ||
      lowerHtml.includes('chimpstatic.com')) {
    signals.mailchimp = true;
  }

  return signals;
}
