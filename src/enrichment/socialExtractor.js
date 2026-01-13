export function extractSocials(htmlContent) {
  if (!htmlContent) {
    return {};
  }

  const socials = {
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    x: ''
  };

  const patterns = {
    facebook: [
      /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9._-]+)/gi,
      /(?:https?:\/\/)?(?:www\.)?fb\.com\/([a-zA-Z0-9._-]+)/gi
    ],
    instagram: [
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/gi
    ],
    linkedin: [
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/company\/([a-zA-Z0-9-]+)/gi,
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/gi
    ],
    youtube: [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c\/|channel\/|user\/)?([a-zA-Z0-9_-]+)/gi,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/gi
    ],
    tiktok: [
      /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9._]+)/gi
    ],
    x: [
      /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/gi
    ]
  };

  for (const [platform, regexList] of Object.entries(patterns)) {
    for (const regex of regexList) {
      const matches = htmlContent.matchAll(regex);
      for (const match of matches) {
        const url = match[0];
        
        if (url.includes('/share') || 
            url.includes('/sharer') || 
            url.includes('/intent') ||
            url.includes('/widgets')) {
          continue;
        }
        
        if (!socials[platform]) {
          socials[platform] = normalizeUrl(url);
          break;
        }
      }
      if (socials[platform]) break;
    }
  }

  return socials;
}

function normalizeUrl(url) {
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.href.split('?')[0].split('#')[0];
  } catch (e) {
    return url;
  }
}
