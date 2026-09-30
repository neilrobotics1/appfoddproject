/**
 * Security & Content Moderation Module
 * Ethical Hacker Hardening for Fodd Landing Page
 */

// Comprehensive normalization table for anti-evasion (leetspeak & visual homoglyphs)
const LEET_MAP = {
  '0': 'o',
  '1': 'i',
  '2': 'z',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '6': 'g',
  '7': 't',
  '8': 'b',
  '9': 'g',
  '@': 'a',
  '$': 's',
  '!': 'i',
  '|': 'i',
  '+': 't',
  '(': 'c',
  '[': 'c',
  '{': 'c',
};

// High-severity hate speech, racial/ethnic/religious slurs, neo-nazi symbols, and abusive terms
const HATE_SPEECH_PATTERNS = [
  // Racial and ethnic slurs (exact and phonetic roots)
  /n+i+g+g+[e3a4r]+/i,
  /n+i+g+a+/i,
  /n+e+g+r+o+/i,
  /k+y+k+e+|k+i+k+e+/i,
  /c+h+i+n+k+/i,
  /g+o+o+k+/i,
  /s+p+i+c+|s+p+i+k+/i,
  /w+e+t+b+a+c+k+/i,
  /b+e+a+n+e+r+/i,
  /c+o+o+n+/i,
  /r+a+g+h+e+a+d+/i,
  /t+o+w+e+l+h+e+a+d+/i,
  /p+a+k+i+/i,
  /z+i+p+p+e+r+h+e+a+d+/i,
  /j+a+p+s?/i,
  /k+r+a+u+t+/i,
  /p+o+l+a+c+k+|p+o+l+a+k+/i,
  /g+y+p+s+y+|g+y+p+p+o+/i,
  /d+a+r+k+i+e+|d+a+r+k+y+/i,
  /s+a+m+b+o+/i,
  /p+i+c+a+n+i+n+n+y+/i,
  /t+a+r+b+a+b+y+/i,

  // Neo-nazi / White supremacist & hate symbols
  /1+4+8+8+/i,
  /k+k+k+/i,
  /k+u+k+l+u+x+/i,
  /h+i+t+l+e+r+/i,
  /n+a+z+i+/i,
  /s+w+a+s+t+i+k+a+/i,
  /h+e+i+l+/i,
  /w+h+i+t+e+p+o+w+e+r+/i,
  /w+h+i+t+e+p+r+i+d+e+/i,
  /s+u+p+r+e+m+a+c+y+|s+u+p+r+e+m+a+c+i+s+t+/i,
  /g+a+s+c+h+a+m+b+e+r+/i,
  /h+o+l+o+c+a+u+s+t+/i,
  /g+e+n+o+c+i+d+e+/i,
  /l+y+n+c+h+/i,
  /a+r+y+a+n+/i,
  /z+y+k+l+o+n+/i,

  // Homophobic & transphobic slurs
  /f+a+g+g+o+t+|f+a+g+s?/i,
  /d+y+k+e+/i,
  /t+r+a+n+n+y+/i,

  // Explicit severe profanity & insults
  /f+u+c+k+/i,
  /s+h+i+t+/i,
  /b+i+t+c+h+/i,
  /c+u+n+t+/i,
  /d+i+c+k+h+e+a+d+/i,
  /p+u+s+s+y+/i,
  /w+h+o+r+e+/i,
  /s+l+u+t+/i,
  /b+a+s+t+a+r+d+/i,
  /a+s+s+h+o+l+e+/i,
  /r+e+t+a+r+d+/i,
  /k+i+l+l+y+o+u+r+s+e+l+f+/i,
  /d+i+e+/i,
];

// Helper to normalize strings for inspection (decodes leetspeak and strips separators)
function normalizeText(text) {
  if (!text) return '';
  let str = text.toLowerCase();

  // Strip zero-width & invisible Unicode characters
  str = str.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '');

  // Substitute leetspeak characters
  let decoded = '';
  for (let char of str) {
    decoded += LEET_MAP[char] || char;
  }

  // Remove whitespace and common delimiter characters used to bypass word boundaries
  const stripped = decoded.replace(/[\s\-_.,+*~`'":;/\\#?!()&$%^=<>{}[\]]/g, '');

  // Collapse repeated characters to 1 (e.g. "nniiigggeerr" -> "niger")
  const collapsed = stripped.replace(/(.)\1+/g, '$1');

  return { original: str, decoded, stripped, collapsed };
}

/**
 * Validates whether an email contains racist terms, hate speech, or offensive content
 * @param {string} email
 * @returns {boolean} true if hate speech or profanity is detected
 */
export function containsHateSpeechOrProfanity(email) {
  if (!email || typeof email !== 'string') return false;

  const [localPart, domainPart = ''] = email.toLowerCase().split('@');
  const targets = [
    email,
    localPart,
    domainPart,
    ...Object.values(normalizeText(email)),
    ...Object.values(normalizeText(localPart)),
  ];

  for (const text of targets) {
    if (!text) continue;
    for (const pattern of HATE_SPEECH_PATTERNS) {
      if (pattern.test(text)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Sanitizes and cleans the email input
 * @param {string} input
 * @returns {string} cleaned email
 */
export function sanitizeEmail(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .toLowerCase()
    // Strip control characters, quotes, HTML brackets, null bytes, backticks
    .replace(/[\u0000-\u001F\u007F-\u009F<>"`'\\]/g, '');
}

/**
 * Strict RFC & security email validation
 * @param {string} email
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Please enter your email address.' };
  }

  const cleaned = sanitizeEmail(email);

  if (cleaned.length < 5) {
    return { valid: false, error: 'Email is too short.' };
  }

  if (cleaned.length > 100) {
    return { valid: false, error: 'Email exceeds maximum allowed length.' };
  }

  // RFC standard compliant regex preventing injection & malformed formats
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
  if (!emailRegex.test(cleaned)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  // Extra check: Disallow consecutive dots or leading/trailing dots in local-part
  const localPart = cleaned.split('@')[0];
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { valid: false, error: 'Please enter a valid email address format.' };
  }

  // Check for hate speech, racism, and severe profanity
  if (containsHateSpeechOrProfanity(cleaned)) {
    return { valid: false, error: 'Please enter an appropriate email address.' };
  }

  return { valid: true, email: cleaned };
}

/**
 * Client-side Rate Limiting & Cooldown Protection
 * Prevents automated scripts / bots from spamming the Supabase database
 */
const RATE_LIMIT_KEY = 'fodd_waitlist_attempts';
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_MS = 3 * 1000; // 3 seconds between clicks

export function checkRateLimit() {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    let history = raw ? JSON.parse(raw) : [];

    // Filter out attempts older than window
    history = history.filter((timestamp) => now - timestamp < WINDOW_MS);

    if (history.length > 0) {
      const lastAttempt = history[history.length - 1];
      if (now - lastAttempt < COOLDOWN_MS) {
        return { allowed: false, message: 'Please wait a moment before trying again.' };
      }
    }

    if (history.length >= MAX_ATTEMPTS) {
      return { allowed: false, message: 'Too many attempts. Please try again in a few minutes.' };
    }

    return { allowed: true };
  } catch (err) {
    // If sessionStorage is disabled, allow safely
    return { allowed: true };
  }
}

export function recordAttempt() {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    let history = raw ? JSON.parse(raw) : [];
    history = history.filter((timestamp) => now - timestamp < WINDOW_MS);
    history.push(now);
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(history));
  } catch (err) {
    // Ignore storage issues
  }
}
