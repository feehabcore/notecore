export function isPhonePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;

  // Prefer UA-CH when available.
  const uaData = navigator.userAgentData as undefined | { mobile?: boolean; platform?: string };
  const platform = (uaData?.platform || '').toLowerCase();
  if (uaData?.mobile && (platform.includes('android') || platform.includes('ios'))) return true;

  const ua = (navigator.userAgent || '').toLowerCase();

  // iPhone / iPod are phones; iPad is explicitly not.
  if (ua.includes('ipad')) return false;
  if (ua.includes('iphone') || ua.includes('ipod')) return true;

  // Android phones typically include "mobile" in the UA; tablets usually don't.
  if (ua.includes('android')) return ua.includes('mobile');

  return false;
}

