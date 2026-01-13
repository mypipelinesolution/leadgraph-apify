export function validateInput(input) {
  if (!input.locations || input.locations.length === 0) {
    throw new Error('At least one location is required');
  }
  
  if (input.seedType === 'keyword' && (!input.keywords || input.keywords.length === 0)) {
    throw new Error('At least one keyword is required when using keyword search');
  }
  
  if (input.seedType === 'customUrls' && (!input.customUrls || input.customUrls.length === 0)) {
    throw new Error('At least one custom URL is required when using custom URLs');
  }
  
  return true;
}
