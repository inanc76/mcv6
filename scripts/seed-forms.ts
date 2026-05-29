/**
 * Seed Payload Forms collection from forms.yml.
 *
 *   pnpm exec tsx scripts/seed-forms.ts
 *
 * Idempotent: re-running updates existing forms' emails + submitButtonLabel +
 * confirmationMessage (matched by title). Fields are NOT overwritten on
 * re-run (so user's admin-side field edits survive).
 *
 * ## forms.yml schema
 *
 * ```yaml
 * # Global defaults (optional) — applied to every form unless overridden
 * defaultEmailTo: "developer@example.com"    # form gönderiminde bildirim
 * defaultEmailFrom: "noreply@example.com"    # gönderen adres
 *
 * forms:
 *   - title: "İş Başvuru Formu"
 *     emailTo: "hr@example.com"              # opsiyonel override
 *     submitLabel: "Gönder"                  # opsiyonel
 *     confirmationMessage: "Form alındı."    # plain text
 *     fields: []      # admin'den doldur veya inline:
 *     # fields:
 *     #   - { type: text,  name: adsoyad, label: "Ad Soyad",  required: true }
 *     #   - { type: email, name: email,   label: "E-posta",   required: true }
 * ```
 *
 * Email davranışı:
 * - `defaultEmailTo` set ise her form için bir email notification config'i yazılır
 * - `emailTo` form-spesifik override (örn. İK formu için ik@..., Şikayet için
 *   musteri@...)
 * - emailFrom yoksa noreply@<NEXT_PUBLIC_SERVER_URL'in domain'i> kullanılır
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
  const to = form.emailTo ?? doc.defaultEmailTo
  if (!to) return [] // no email destination → skip notification config
  const from = form.emailFrom ?? doc.defaultEmailFrom ?? deriveFromDomain()
  return [
    {
      emailTo: to,
      emailFrom: from,
      subject: `Yeni form gönderimi: ${form.title}`,
      message: richText(
        `"${form.title}" formuna yeni bir gönderim geldi. Detaylar için admin panelden Form Yanıtları bölümüne bakın.`,
      ),
    },
  ]
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
      await payload.update({
        collection: 'forms',
        id: existing.docs[0].id,
        data: baseData, // fields KORUNUR (admin tarafında düzenleme süreklilik kazansın)
      })
      updated++
      console.log(`  ↻ ${form.title} güncellendi (id=${existing.docs[0].id}, emails=${baseData.emails.length})`)
    } else {
      const c = await payload.create({
        collection: 'forms',
        data: { title: form.title, fields: form.fields ?? [], ...baseData } as any,
      })
      created++
      console.log(
        `  ✓ ${form.title} oluşturuldu (id=${c.id}, fields=${(form.fields ?? []).length}, emails=${baseData.emails.length})`,
      )
    }
  } catch (err: any) {
    console.log(`  ✗ ${form.title} HATA: ${err?.message?.slice(0, 160)}`)
  }
}

console.log(`\n✓ Forms seed tamamlandı — created=${created}, updated=${updated}`)
process.exit(0)
