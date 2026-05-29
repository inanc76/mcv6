/**
 * Seed Payload Forms collection from forms.yml.
 *
 *   pnpm exec tsx scripts/seed-forms.ts
 *
 * Idempotent (find by title, create if missing). Fields can be left empty
 * to create a stub the user fills from admin or via design-to-form extraction.
 *
 * ## forms.yml schema
 *
 * ```yaml
 * forms:
 *   - title: "İş Başvuru Formu"
 *     submitLabel: "Gönder"                                  # optional
 *     confirmationMessage: "Form başarıyla gönderildi."      # plain text
 *     fields: []      # populate from admin; or define inline:
 *     # fields:
 *     #   - type: text
 *     #     name: adsoyad
 *     #     label: "Adınız Soyadınız"
 *     #     required: true
 *     #   - type: email
 *     #     name: email
 *     #     label: "E-posta"
 *     #     required: true
 * ```
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
  fields?: FormField[]
}
type FormsDoc = { forms: FormSpec[] }

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

const payload = await getPayload({ config })

for (const form of doc.forms) {
  try {
    const existing = await payload.find({
      collection: 'forms',
      where: { title: { equals: form.title } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      console.log(`  ↻ ${form.title} zaten var (id=${existing.docs[0].id})`)
      continue
    }
    const created = await payload.create({
      collection: 'forms',
      data: {
        title: form.title,
        fields: form.fields ?? [],
        submitButtonLabel: form.submitLabel ?? 'Gönder',
        confirmationType: 'message',
        confirmationMessage: richText(
          form.confirmationMessage ?? 'Form başarıyla gönderildi. Teşekkürler.',
        ),
      } as any,
    })
    console.log(`  ✓ ${form.title} oluşturuldu (id=${created.id}, fields=${(form.fields ?? []).length})`)
  } catch (err: any) {
    console.log(`  ✗ ${form.title} HATA: ${err?.message?.slice(0, 160)}`)
  }
}

console.log('\n✓ Forms seed tamamlandı')
process.exit(0)
