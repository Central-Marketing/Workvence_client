import { TempMailClient } from './temp-mail.provider';

export interface OtpResult {
  otp: string;
  subject: string;
  from: string;
  receivedAt: string;
  elapsedSeconds: number;
  polls: number;
}

export interface WaitForOtpOptions {
  timeoutMs?: number;
  pollIntervalMs?: number;
  resendCallback?: () => Promise<void>;
  expectedLength?: number;
}

/**
 * Robust regex OTP extractor that searches through text and HTML for verification codes.
 * Supports 4, 5, 6, and 8 digit OTPs, prioritizing Workvence-specific templates.
 */
export function extractOtpFromContent(textContent: string, htmlContent: string, subject = '', expectedLength = 6): string | null {
  const combined = `${subject}\n${textContent}\n${htmlContent}`;

  // 1. Workvence specific structured patterns
  const specificPatterns = [
    /OTP Verification Code is:\s*(\d{4,8})/i,
    /verification code is:\s*(\d{4,8})/i,
    /code to complete your email verification:\s*<\/p>\s*<div[^>]*>\s*(\d{4,8})/i,
    /letter-spacing:\s*5px;[^>]*>\s*(\d{4,8})\s*<\/div>/i,
    /\bOTP:\s*(\d{4,8})\b/i,
    /\bcode:\s*(\d{4,8})\b/i,
    /password reset code is:\s*(\d{4,8})/i,
    /your verification code:\s*(\d{4,8})/i
  ];

  for (const pattern of specificPatterns) {
    const match = combined.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // 2. Scoped fallback: match numbers matching expected length (default 6 digits)
  const regexExact = new RegExp(`\\b\\d{${expectedLength}}\\b`, 'g');
  const exactMatches = combined.match(regexExact) || [];
  if (exactMatches.length > 0 && exactMatches[0]) {
    // Return first match that isn't a current year (e.g. 202600)
    return exactMatches[0];
  }

  // 3. Broad fallback: match any 4-8 digit isolated number
  const broadMatches = combined.match(/\b\d{4,8}\b/g) || [];
  if (broadMatches.length > 0 && broadMatches[0]) {
    return broadMatches[0];
  }

  return null;
}

/**
 * Polls the temporary mailbox API until an OTP message arrives or timeout expires.
 */
export async function waitForOtp(
  client: TempMailClient,
  options: WaitForOtpOptions = {}
): Promise<OtpResult> {
  if (!client.provider || !client.email) {
    throw new Error('TempMail inbox not initialized. Call createInbox first.');
  }

  const timeoutMs = options.timeoutMs || parseInt(process.env.E2E_TIMEOUT || '75000', 10);
  const intervalMs = options.pollIntervalMs || 2500;
  const startTime = Date.now();
  let pollCount = 0;
  let resendTriggered = false;

  console.log(`  ⏳ [OTP Engine] Polling inbox (${client.provider.name}) for: ${client.email}...`);

  while (Date.now() - startTime < timeoutMs) {
    pollCount++;
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

    try {
      const messages = await client.provider.fetchMessages();

      if (messages && messages.length > 0) {
        for (const msg of messages) {
          const detail = await client.provider.fetchMessageDetail(msg.id);
          const otp = extractOtpFromContent(detail.text, detail.html, detail.subject, options.expectedLength || 6);

          if (otp) {
            console.log(`  ✅ [OTP Engine] OTP Code Received in ${elapsedSec}s (Poll #${pollCount}): ${client.debugOtp ? otp : '******'}`);
            return {
              otp,
              subject: detail.subject,
              from: detail.from,
              receivedAt: detail.date,
              elapsedSeconds: parseFloat(elapsedSec),
              polls: pollCount
            };
          }
        }
      }
    } catch (pollErr: any) {
      console.warn(`  ⚠️ [OTP Engine] Poll #${pollCount} error (retrying): ${pollErr.message}`);
    }

    // Trigger UI Resend OTP halfway through if provided
    if (!resendTriggered && (Date.now() - startTime) > 25000 && typeof options.resendCallback === 'function') {
      resendTriggered = true;
      console.log(`  🔄 [OTP Engine] Triggering UI Resend OTP after ${elapsedSec}s...`);
      try {
        await options.resendCallback();
      } catch (resendErr: any) {
        console.warn(`  ⚠️ [OTP Engine] Resend callback failed: ${resendErr.message}`);
      }
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(`[OTP Engine] Timed out waiting for OTP email on ${client.email} (${client.provider.name}) after ${Math.round(timeoutMs / 1000)}s (${pollCount} polls).`);
}
