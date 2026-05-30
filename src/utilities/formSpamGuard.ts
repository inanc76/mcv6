/**
 * Spam protection for Form Builder submissions.
 *
 * Behavior driven by FormSettings global (slug: 'form-settings'):
 *   1. honeypotEnabled  → check _honeypot field; non-empty = reject
 *   2. captchaEnabled   → verify token with selected provider:
 *      - 'turnstile'     → Cloudflare Turnstile siteverify
 *      - 'recaptcha-v3'  → Google reCAPTCHA v3 siteverify (score >= 0.5)
 *   3. autoReplyEnabled → not enforced here; seed-forms uses it at build time
 *
 * If a captcha provider's secret key env var is missing, that provider's
 * check is SKIPPED with a warning (dev-mode safety). Production must
 * verify env vars are set.
 *
 * Internal fields (`_honeypot`, `_turnstileToken`, `_recaptchaToken`)
 * are stripped from submissionData BEFORE save, so Form Yanıtları
 * admin view stays clean.
 *
 * Frontend integration: see README "Form Settings" + "forms.yml schema"
 * sections.
 */

const HONEYPOT_FIELD = '_honeypot'
const TURNSTILE_FIELD = '_turnstileToken'
const RECAPTCHA_FIELD = '_recaptchaToken'
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
const RECAPTCHA_MIN_SCORE = 0.5

type SubmissionEntry = { field?: string; value?: unknown }

function findValue(submissionData: SubmissionEntry[] | undefined, fieldName: string): string {
  if (!Array.isArray(submissionData)) return ''
  const match = submissionData.find((d) => d?.field === fieldName)
  return typeof match?.value === 'string' ? match.value : ''
}

function stripInternalFields(
  submissionData: SubmissionEntry[] | undefined,
  fields: string[],
): SubmissionEntry[] {
  if (!Array.isArray(submissionData)) return []
  return submissionData.filter((d) => !fields.includes(d?.field ?? ''))
}

async function verifyTurnstile(
  token: string,
  secretKey: string,
  remoteIp?: string,
): Promise<boolean> {
  try {
    const body: Record<string, string> = { secret: secretKey, response: token }
    if (remoteIp) body.remoteip = remoteIp
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const result = (await res.json()) as { success?: boolean }
    return result?.success === true
  } catch {
    // Network failure → fail open (Cloudflare downtime shouldn't block users)
    return true
  }
}

async function verifyRecaptchaV3(
  token: string,
  secretKey: string,
  remoteIp?: string,
): Promise<boolean> {
  try {
    const params = new URLSearchParams({ secret: secretKey, response: token })
    if (remoteIp) params.set('remoteip', remoteIp)
    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    const result = (await res.json()) as { success?: boolean; score?: number }
    if (!result?.success) return false
    // v3 returns a score 0.0-1.0; treat below threshold as likely bot
    return (result.score ?? 0) >= RECAPTCHA_MIN_SCORE
  } catch {
    return true
  }
}

async function loadFormSettings(req: any): Promise<{
  honeypotEnabled: boolean
  captchaEnabled: boolean
  captchaProvider: 'turnstile' | 'recaptcha-v3' | null
}> {
  // Defaults if global not initialized yet (first boot before user opens admin)
  const fallback = {
    honeypotEnabled: true,
    captchaEnabled: false,
    captchaProvider: null as 'turnstile' | 'recaptcha-v3' | null,
  }
  try {
    const settings = await req?.payload?.findGlobal?.({ slug: 'form-settings', depth: 0 })
    if (!settings) return fallback
    return {
      honeypotEnabled: settings.honeypotEnabled !== false,
      captchaEnabled: settings.captchaEnabled === true,
      captchaProvider: settings.captchaProvider ?? null,
    }
  } catch {
    return fallback
  }
}

/**
 * Use in src/plugins/index.ts:
 *   formSubmissionOverrides: {
 *     hooks: { beforeOperation: [spamGuardBeforeOperation] },
 *     ...
 *   }
 */
export const spamGuardBeforeOperation = async ({
  args,
  operation,
  req,
}: {
  args: any
  operation: string
  req?: any
}) => {
  if (operation !== 'create') return args

  const submissionData: SubmissionEntry[] = args?.data?.submissionData ?? []
  const settings = await loadFormSettings(req)

  // 1. Honeypot
  if (settings.honeypotEnabled) {
    const honeypotValue = findValue(submissionData, HONEYPOT_FIELD)
    if (honeypotValue && honeypotValue.trim() !== '') {
      req?.payload?.logger?.warn?.(
        `[spam-guard] Honeypot triggered — rejected (form=${args.data?.form})`,
      )
      throw new Error('Submission rejected.')
    }
  }

  // 2. Captcha
  if (settings.captchaEnabled && settings.captchaProvider) {
    const remoteIp =
      req?.headers?.get?.('cf-connecting-ip') ??
      req?.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() ??
      undefined

    if (settings.captchaProvider === 'turnstile') {
      const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY
      if (!secretKey) {
        req?.payload?.logger?.warn?.(
          `[spam-guard] captchaEnabled=turnstile ama CLOUDFLARE_TURNSTILE_SECRET_KEY env yok — bypass`,
        )
      } else {
        const token = findValue(submissionData, TURNSTILE_FIELD)
        if (!token) {
          req?.payload?.logger?.warn?.(
            `[spam-guard] Turnstile token missing — rejected (form=${args.data?.form})`,
          )
          throw new Error('Captcha required.')
        }
        const ok = await verifyTurnstile(token, secretKey, remoteIp)
        if (!ok) {
          req?.payload?.logger?.warn?.(
            `[spam-guard] Turnstile verification failed — rejected (form=${args.data?.form})`,
          )
          throw new Error('Captcha verification failed.')
        }
      }
    } else if (settings.captchaProvider === 'recaptcha-v3') {
      const secretKey = process.env.RECAPTCHA_SECRET_KEY
      if (!secretKey) {
        req?.payload?.logger?.warn?.(
          `[spam-guard] captchaEnabled=recaptcha-v3 ama RECAPTCHA_SECRET_KEY env yok — bypass`,
        )
      } else {
        const token = findValue(submissionData, RECAPTCHA_FIELD)
        if (!token) {
          req?.payload?.logger?.warn?.(
            `[spam-guard] reCAPTCHA token missing — rejected (form=${args.data?.form})`,
          )
          throw new Error('Captcha required.')
        }
        const ok = await verifyRecaptchaV3(token, secretKey, remoteIp)
        if (!ok) {
          req?.payload?.logger?.warn?.(
            `[spam-guard] reCAPTCHA verification failed — rejected (form=${args.data?.form})`,
          )
          throw new Error('Captcha verification failed.')
        }
      }
    }
  }

  // 3. Strip internal fields from stored submissionData
  args.data.submissionData = stripInternalFields(submissionData, [
    HONEYPOT_FIELD,
    TURNSTILE_FIELD,
    RECAPTCHA_FIELD,
  ])

  return args
}
