/**
 * Spam protection for Form Builder submissions.
 *
 * Two layers, run in formSubmissionOverrides.hooks.beforeOperation:
 *   1. Honeypot — invisible field bot fills (seed-forms.ts injects _honeypot
 *      field; frontend renders it hidden). Non-empty value → reject.
 *   2. Cloudflare Turnstile — server-side token validation. Skipped in dev
 *      (when CLOUDFLARE_TURNSTILE_SECRET_KEY is not set).
 *
 * Both checks strip their internal fields from submissionData BEFORE save,
 * so admin's Form Yanıtları view doesn't show honeypot/_turnstileToken noise.
 *
 * Frontend integration:
 * - Honeypot: render an `<input type="text" name="_honeypot" />` styled with
 *   `style="position:absolute;left:-9999px;opacity:0"` (or aria-hidden + tabindex=-1).
 * - Turnstile: render the Cloudflare Turnstile widget with NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
 *   capture the token, include it in form submission as a field named `_turnstileToken`.
 */

const HONEYPOT_FIELD = '_honeypot'
const TURNSTILE_FIELD = '_turnstileToken'
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

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
    const result = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
    return result?.success === true
  } catch {
    // Network failure → fail open (don't block users on Cloudflare downtime)
    // but log. Production should monitor this.
    return true
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

  // 1. Honeypot — non-empty value = bot
  const honeypotValue = findValue(submissionData, HONEYPOT_FIELD)
  if (honeypotValue && honeypotValue.trim() !== '') {
    // Silent reject: throw early with generic message; logs detail.
    req?.payload?.logger?.warn?.(
      `[spam-guard] Honeypot triggered — submission rejected (form=${args.data?.form})`,
    )
    throw new Error('Submission rejected.')
  }

  // 2. Cloudflare Turnstile — verify token if secret key is configured
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY
  if (secretKey) {
    const token = findValue(submissionData, TURNSTILE_FIELD)
    if (!token) {
      req?.payload?.logger?.warn?.(
        `[spam-guard] Turnstile token missing — submission rejected (form=${args.data?.form})`,
      )
      throw new Error('Captcha required.')
    }
    const remoteIp =
      req?.headers?.get?.('cf-connecting-ip') ??
      req?.headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() ??
      undefined
    const ok = await verifyTurnstile(token, secretKey, remoteIp)
    if (!ok) {
      req?.payload?.logger?.warn?.(
        `[spam-guard] Turnstile verification failed — submission rejected (form=${args.data?.form})`,
      )
      throw new Error('Captcha verification failed.')
    }
  }

  // 3. Strip internal fields from stored submissionData
  args.data.submissionData = stripInternalFields(submissionData, [HONEYPOT_FIELD, TURNSTILE_FIELD])

  return args
}
