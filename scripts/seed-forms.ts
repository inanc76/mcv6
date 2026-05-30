/**
 * Seed Payload Forms collection from forms.yml.
 *
 *   pnpm exec tsx scripts/seed-forms.ts
 *
 * Idempotent: re-running updates existing forms' emails + submitButtonLabel +
 * confirmationMessage + honeypot field (matched by title). User-added fields
 * are preserved on re-run (only the honeypot field is auto-injected/synced).
 *
 * ## forms.yml schema
 *
 * ```yaml
 * # Global defaults (optional)
 * defaultEmailTo: "developer@example.com"      # admin notification target
 * defaultEmailFrom: "noreply@example.com"      # sender (else derived from SERVER_URL)
 * submitterEmailField: "email"                 # form field name to auto-reply to
 *
 * # Auto-reply config (optional) — sent to submitter after submission
 * autoReply:
 *   enabled: true                              # default true if not set
 *   subject: "Formunuz alındı"
 *   message: "Teşekkürler! En kısa sürede size dönüş yapacağız."
 *
 * # Honeypot field auto-injected into every form (set false to disable)
 * honeypot:
 *   enabled: true                              # default true
 *   fieldName: "_honeypot"                     # internal name; hidden in frontend
 *
 * forms:
 *   - title: "İş Başvuru Formu"
 *     emailTo: "hr@example.com"                # optional override
 *     submitLabel: "Gönder"
 *     confirmationMessage: "Form alındı."
 *     fields:                                  # admin'den doldur veya inline:
 *       - { type: text,  name: adsoyad, label: "Ad Soyad", required: true }
 *       - { type: email, name: email,   label: "E-posta",   required: true }
 * ```
 *
 * Email body templating (Payload Form Builder):
 * - `{{*}}` — submitter'ın doldurduğu TÜM field'lar, key: value formatında
 * - `{{fieldName}}` — spesifik field değeri
 * - `{{*:table}}` — HTML tablo formatında tüm field'lar
 *
 * Auto-reply emailTo'da `{{email}}` (veya `submitterEmailField` ne ise) kullanılır
 * — form'da o isimde bir field yoksa email gönderilmez (Form Builder silently skip).
 */

import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import yaml from 'js-yaml'
import { getPayload } from 'payload'
import config from '../src/payload.config'

type FormField = {
  type: string
  name: string
  label?: string
  required?: boolean
  [key: string]: unknown
}
type FormSpec = {
  title: string
  submitLabel?: string
  confirmationMessage?: string
  emailTo?: string
  emailFrom?: string
  fields?: FormField[]
}
type FormsDoc = {
  defaultEmailTo?: string
  defaultEmailFrom?: string
  submitterEmailField?: string
  autoReply?: {
    enabled?: boolean
    subject?: string
    message?: string
  }
  honeypot?: {
    enabled?: boolean
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

const SUBMITTER_FIELD = doc.submitterEmailField ?? 'email'
const AUTO_REPLY_ENABLED = doc.autoReply?.enabled !== false
const HONEYPOT_ENABLED = doc.honeypot?.enabled !== false
const HONEYPOT_FIELD = doc.honeypot?.fieldName ?? '_honeypot'

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

function buildEmails(form: FormSpec) {
  const out: Array<Record<string, unknown>> = []
  const to = form.emailTo ?? doc.defaultEmailTo
  const from = form.emailFrom ?? doc.defaultEmailFrom ?? deriveFromDomain()

  // Admin notification — body contains ALL submitted fields via {{*}}
  if (to) {
    out.push({
      emailTo: to,
      emailFrom: from,
      subject: `Yeni form gönderimi: ${form.title}`,
      message: richText(
        `"${form.title}" formuna yeni bir gönderim geldi:\n\n{{*}}`,
      ),
    })
  }

  // Auto-reply — sent to submitter (requires form has a field named SUBMITTER_FIELD)
  if (AUTO_REPLY_ENABLED) {
    const subject = doc.autoReply?.subject ?? 'Formunuz alındı'
    const message =
      doc.autoReply?.message ??
      `Merhaba,\n\n"${form.title}" formunuz tarafımıza ulaştı. En kısa sürede dönüş yapacağız.\n\nGönderdiğiniz bilgiler:\n{{*}}\n\nTeşekkürler.`
    out.push({
      emailTo: `{{${SUBMITTER_FIELD}}}`,
      emailFrom: from,
      subject,
      message: richText(message),
    })
  }

  return out
}

// Map user-facing `type` (YAML schema) → Form Builder's `blockType` (DB shape).
// Existing fields already in DB keep their blockType — we just ensure honeypot
// field has the correct shape.
function normalizeField(f: FormField & { blockType?: string }): FormField {
  // If field already came from DB (has blockType, no type), leave it alone.
  if (f.blockType && !f.type) return f
  const { type, ...rest } = f as any
  return { ...rest, blockType: type ?? f.blockType ?? 'text' } as any
}

// Honeypot field — bot-only invisible input. Frontend MUST render it
// hidden (display:none veya position:absolute;left:-9999px). Server-side
// hook (src/plugins/index.ts → formSubmissionOverrides.hooks.beforeOperation)
// dolu olarak gelirse submission'ı reject eder.
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
  if (!HONEYPOT_ENABLED) return base
  const hasHoneypot = base.some((f) => f.name === HONEYPOT_FIELD)
  return hasHoneypot ? base : [...base, honeypotField()]
}

const payload = await getPayload({ config })

let created = 0
let updated = 0
for (const form of doc.forms) {
  try {
    const existing = await payload.find({
      collection: 'forms',
      where: { title: { equals: form.title } },
      limit: 1,
      depth: 0,
    })
    const baseData = {
      submitButtonLabel: form.submitLabel ?? 'Gönder',
      confirmationType: 'message',
      confirmationMessage: richText(
        form.confirmationMessage ?? 'Form başarıyla gönderildi. Teşekkürler.',
      ),
      emails: buildEmails(form),
    } as any

    if (existing.docs[0]) {
      // Re-run: update config + ensure honeypot in fields; preserve user-added fields.
      const currentFields = (existing.docs[0].fields ?? []) as FormField[]
      const withHoneypot = mergeFields(currentFields)
      await payload.update({
        collection: 'forms',
        id: existing.docs[0].id,
        data: { ...baseData, fields: withHoneypot },
      })
      updated++
      console.log(
        `  ↻ ${form.title} güncellendi (id=${existing.docs[0].id}, emails=${baseData.emails.length}, honeypot=${HONEYPOT_ENABLED ? 'yes' : 'no'})`,
      )
    } else {
      const c = await payload.create({
        collection: 'forms',
        data: { title: form.title, fields: mergeFields(form.fields), ...baseData } as any,
      })
      created++
      console.log(
        `  ✓ ${form.title} oluşturuldu (id=${c.id}, fields=${mergeFields(form.fields).length}, emails=${baseData.emails.length})`,
      )
    }
  } catch (err: any) {
    console.log(`  ✗ ${form.title} HATA: ${err?.message?.slice(0, 200)}`)
  }
}

console.log(
  `\n✓ Forms seed tamamlandı — created=${created}, updated=${updated}, autoReply=${AUTO_REPLY_ENABLED}, honeypot=${HONEYPOT_ENABLED}`,
)
process.exit(0)
