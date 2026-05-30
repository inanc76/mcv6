/**
 * Seed Payload Forms collection from forms.yml (multi-locale aware).
 *
 *   pnpm exec tsx scripts/seed-forms.ts
 *
 * Idempotent: re-running updates existing forms' emails + submitButtonLabel +
 * confirmationMessage + honeypot field (matched by default-locale title).
 * User-added fields are preserved on re-run (only the honeypot field is
 * auto-injected/synced).
 *
 * ## forms.yml schema (multi-locale)
 *
 * ```yaml
 * defaultLocale: tr
 * locales: [tr, en]                            # opsiyonel; default = [defaultLocale]
 *
 * # Global defaults
 * defaultEmailTo: "developer@example.com"      # admin notification target
 * defaultEmailFrom: "noreply@example.com"      # sender (else derived from SERVER_URL)
 * submitterEmailField: "email"                 # form field name to auto-reply to
 *
 * # Auto-reply config — per-locale subject + message
 * autoReply:
 *   enabled: true                              # default true
 *   subjects:
 *     tr: "Formunuz alındı"
 *     en: "Your form was received"
 *   messages:
 *     tr: "Merhaba,\nMesajınız tarafımıza ulaştı. En kısa sürede dönüş yapacağız."
 *     en: "Hello,\nYour message has reached us. We will get back to you shortly."
 *
 * # Admin notification — per-locale subject + message
 * adminNotification:
 *   subjects:
 *     tr: "Yeni form gönderimi"                # form title append edilir
 *     en: "New form submission"
 *   messages:
 *     tr: "Bir form gönderimi geldi:\n\n{{*}}"
 *     en: "A form submission was received:\n\n{{*}}"
 *
 * # Honeypot (always inject the field; FormSettings global controls enforcement)
 * honeypot:
 *   fieldName: "_honeypot"
 *
 * forms:
 *   - title: "İş Başvuru Formu"                # default-locale title (zorunlu)
 *     titles:                                  # per-locale titles
 *       tr: "İş Başvuru Formu"
 *       en: "Job Application Form"
 *     emailTo: "hr@example.com"                # opsiyonel override
 *     submitLabels:                            # per-locale submit button
 *       tr: "Gönder"
 *       en: "Submit"
 *     confirmationMessages:                    # per-locale plain text
 *       tr: "Başvurunuz alındı."
 *       en: "Your application was received."
 *     fields:
 *       - { type: text,  name: adsoyad, label: "Ad Soyad", required: true }
 *       - { type: email, name: email,   label: "E-posta",   required: true }
 * ```
 *
 * Email body templating (Payload Form Builder):
 * - `{{*}}` — submitter'ın doldurduğu TÜM field'lar, key: value formatında
 * - `{{fieldName}}` — spesifik field değeri
 *
 * Note: `autoReply.enabled` config sadece seed sırasında etkisini gösterir
 * (false ise auto-reply email config'i yazılmaz). Runtime davranışı için
 * FormSettings global'inin `autoReplyEnabled` toggle'ı kullanılır
 * (admin'den anlık değiştirilebilir; ama email config zaten DB'de olmazsa
 * runtime toggle anlamsız — false bırakırsan kullanıcı sonradan enable
 * etmek istediğinde re-seed'lemen gerekir).
 */

import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import yaml from 'js-yaml'
import { getPayload } from 'payload'
import config from '../src/payload.config'

type FormField = {
  type?: string
  blockType?: string
  name: string
  label?: string | Record<string, string>
  required?: boolean
  [key: string]: unknown
}
type FormSpec = {
  title: string
  titles?: Record<string, string>
  submitLabel?: string
  submitLabels?: Record<string, string>
  confirmationMessage?: string
  confirmationMessages?: Record<string, string>
  emailTo?: string
  emailFrom?: string
  fields?: FormField[]
}
type FormsDoc = {
  defaultLocale?: string
  locales?: string[]
  defaultEmailTo?: string
  defaultEmailFrom?: string
  submitterEmailField?: string
  autoReply?: {
    enabled?: boolean
    subjects?: Record<string, string>
    messages?: Record<string, string>
  }
  adminNotification?: {
    subjects?: Record<string, string>
    messages?: Record<string, string>
  }
  honeypot?: {
    fieldName?: string
  }
  forms: FormSpec[]
}

const FORMS_PATH = path.resolve(process.cwd(), 'forms.yml')

const raw = await fs.readFile(FORMS_PATH, 'utf8').catch(() => {
  console.error(`✗ forms.yml not found at ${FORMS_PATH}`)
  process.exit(1)
})
const doc = yaml.load(raw) as FormsDoc

if (!doc?.forms?.length) {
  console.error('✗ forms.yml has no forms')
  process.exit(1)
}

const DEFAULT_LOCALE = doc.defaultLocale ?? 'tr'
const ALL_LOCALES = doc.locales?.length ? doc.locales : [DEFAULT_LOCALE]
const SUBMITTER_FIELD = doc.submitterEmailField ?? 'email'
const AUTO_REPLY_SEED = doc.autoReply?.enabled !== false
const HONEYPOT_FIELD = doc.honeypot?.fieldName ?? '_honeypot'

// Default bilingual content if forms.yml leaves them blank
const DEFAULT_ADMIN_SUBJECTS: Record<string, string> = {
  tr: 'Yeni form gönderimi',
  en: 'New form submission',
}
const DEFAULT_ADMIN_MESSAGES: Record<string, string> = {
  tr: 'Bir form gönderimi geldi:\n\n{{*}}',
  en: 'A form submission was received:\n\n{{*}}',
}
const DEFAULT_AUTOREPLY_SUBJECTS: Record<string, string> = {
  tr: 'Formunuz alındı',
  en: 'Your form was received',
}
const DEFAULT_AUTOREPLY_MESSAGES: Record<string, string> = {
  tr: 'Merhaba,\nFormunuz tarafımıza ulaştı. En kısa sürede dönüş yapacağız.\n\nGönderdiğiniz bilgiler:\n{{*}}\n\nTeşekkürler.',
  en: 'Hello,\nYour form has reached us. We will get back to you shortly.\n\nInformation you submitted:\n{{*}}\n\nThank you.',
}

function richText(text: string) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph',
          format: '' as const,
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          textFormat: 0,
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

function deriveFromDomain(): string {
  const url = process.env.NEXT_PUBLIC_SERVER_URL ?? ''
  try {
    const host = new URL(url).hostname
    return `noreply@${host || 'localhost'}`
  } catch {
    return 'noreply@localhost'
  }
}

function titleFor(form: FormSpec, locale: string): string {
  return form.titles?.[locale] ?? (locale === DEFAULT_LOCALE ? form.title : form.title)
}
function submitLabelFor(form: FormSpec, locale: string): string {
  return form.submitLabels?.[locale] ?? form.submitLabel ?? (locale === 'en' ? 'Submit' : 'Gönder')
}
function confirmationFor(form: FormSpec, locale: string): string {
  return (
    form.confirmationMessages?.[locale] ??
    form.confirmationMessage ??
    (locale === 'en' ? 'Form received. Thank you.' : 'Form alındı. Teşekkürler.')
  )
}
function adminSubjectFor(form: FormSpec, locale: string): string {
  const base = doc.adminNotification?.subjects?.[locale] ?? DEFAULT_ADMIN_SUBJECTS[locale] ?? DEFAULT_ADMIN_SUBJECTS.en
  return `${base}: ${titleFor(form, locale)}`
}
function adminMessageFor(_form: FormSpec, locale: string): string {
  return (
    doc.adminNotification?.messages?.[locale] ??
    DEFAULT_ADMIN_MESSAGES[locale] ??
    DEFAULT_ADMIN_MESSAGES.en
  )
}
function autoReplySubjectFor(_form: FormSpec, locale: string): string {
  return (
    doc.autoReply?.subjects?.[locale] ??
    DEFAULT_AUTOREPLY_SUBJECTS[locale] ??
    DEFAULT_AUTOREPLY_SUBJECTS.en
  )
}
function autoReplyMessageFor(_form: FormSpec, locale: string): string {
  return (
    doc.autoReply?.messages?.[locale] ??
    DEFAULT_AUTOREPLY_MESSAGES[locale] ??
    DEFAULT_AUTOREPLY_MESSAGES.en
  )
}

function buildEmailsForLocale(form: FormSpec, locale: string) {
  const out: Array<Record<string, unknown>> = []
  const to = form.emailTo ?? doc.defaultEmailTo
  const from = form.emailFrom ?? doc.defaultEmailFrom ?? deriveFromDomain()

  // Admin notification
  if (to) {
    out.push({
      emailTo: to,
      emailFrom: from,
      subject: adminSubjectFor(form, locale),
      message: richText(adminMessageFor(form, locale)),
    })
  }
  // Auto-reply (only if enabled at seed time)
  if (AUTO_REPLY_SEED) {
    out.push({
      emailTo: `{{${SUBMITTER_FIELD}}}`,
      emailFrom: from,
      subject: autoReplySubjectFor(form, locale),
      message: richText(autoReplyMessageFor(form, locale)),
    })
  }
  return out
}

// Map user-facing `type` (YAML schema) → Form Builder's `blockType` (DB shape).
function normalizeField(f: FormField): FormField {
  if (f.blockType && !f.type) return f
  const { type, ...rest } = f as any
  return { ...rest, blockType: type ?? f.blockType ?? 'text' } as any
}

function honeypotField(): FormField {
  return normalizeField({
    type: 'text',
    name: HONEYPOT_FIELD,
    label: '(do not fill — spam trap)',
    required: false,
  })
}

function mergeFields(userFields: FormField[] | undefined): FormField[] {
  const base = (userFields ?? []).map(normalizeField)
  // Always inject honeypot (enforcement controlled by FormSettings global at runtime).
  const hasHoneypot = base.some((f) => f.name === HONEYPOT_FIELD)
  return hasHoneypot ? base : [...base, honeypotField()]
}

const payload = await getPayload({ config })

let created = 0
let updated = 0
let localeWrites = 0

for (const form of doc.forms) {
  try {
    const defaultTitle = titleFor(form, DEFAULT_LOCALE)
    const existing = await payload.find({
      collection: 'forms',
      where: { title: { equals: defaultTitle } },
      limit: 1,
      depth: 0,
      locale: DEFAULT_LOCALE,
    })

    let formId: number | string
    if (existing.docs[0]) {
      // Update existing (preserve user-added fields except honeypot reconciliation)
      const currentFields = (existing.docs[0].fields ?? []) as FormField[]
      await payload.update({
        collection: 'forms',
        id: existing.docs[0].id,
        data: {
          title: defaultTitle,
          fields: mergeFields(currentFields),
          submitButtonLabel: submitLabelFor(form, DEFAULT_LOCALE),
          confirmationType: 'message',
          confirmationMessage: richText(confirmationFor(form, DEFAULT_LOCALE)),
          emails: buildEmailsForLocale(form, DEFAULT_LOCALE),
        } as any,
        locale: DEFAULT_LOCALE,
      })
      formId = existing.docs[0].id
      updated++
      console.log(`  ↻ ${defaultTitle} güncellendi [${DEFAULT_LOCALE}] (id=${formId})`)
    } else {
      const c = await payload.create({
        collection: 'forms',
        data: {
          title: defaultTitle,
          fields: mergeFields(form.fields),
          submitButtonLabel: submitLabelFor(form, DEFAULT_LOCALE),
          confirmationType: 'message',
          confirmationMessage: richText(confirmationFor(form, DEFAULT_LOCALE)),
          emails: buildEmailsForLocale(form, DEFAULT_LOCALE),
        } as any,
        locale: DEFAULT_LOCALE,
      })
      formId = c.id
      created++
      console.log(`  ✓ ${defaultTitle} oluşturuldu [${DEFAULT_LOCALE}] (id=${formId})`)
    }

    // Write other locales (title, submitButtonLabel, confirmationMessage, emails are localized:true)
    for (const locale of ALL_LOCALES) {
      if (locale === DEFAULT_LOCALE) continue
      await payload.update({
        collection: 'forms',
        id: formId,
        data: {
          title: titleFor(form, locale),
          submitButtonLabel: submitLabelFor(form, locale),
          confirmationMessage: richText(confirmationFor(form, locale)),
          emails: buildEmailsForLocale(form, locale),
        } as any,
        locale,
      })
      localeWrites++
      console.log(`      ↳ [${locale}] title="${titleFor(form, locale)}"`)
    }
  } catch (err: any) {
    console.log(`  ✗ ${form.title} HATA: ${err?.message?.slice(0, 200)}`)
  }
}

console.log(
  `\n✓ Forms seed tamamlandı — created=${created}, updated=${updated}, locale writes=${localeWrites}, autoReply(seeded)=${AUTO_REPLY_SEED}`,
)
console.log(
  `  Reminder: Runtime davranışı için admin → Form Ayarları (FormSettings global) toggle'larını kontrol et`,
)
process.exit(0)
