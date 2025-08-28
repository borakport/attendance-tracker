import crypto from 'crypto';

/**
 * Generate a secure service token for connecting to realtime service
 */
export function generateServiceToken(serviceName: string, apiKey: string): string {
  const timestamp = Date.now();
  const data = `${serviceName}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', apiKey)
    .update(data)
    .digest('hex');
  
  const token = Buffer.from(JSON.stringify({
    service: serviceName,
    timestamp,
    signature
  })).toString('base64');
  
  console.log('🔑 Generating service token:', {
    serviceName,
    timestamp,
    dataString: data,
    signatureLength: signature.length,
    tokenLength: token.length
  });
  
  return token;
}
