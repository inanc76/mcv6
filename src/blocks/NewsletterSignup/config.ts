import type { Block } from 'payload'

export const NewsletterSignup: Block = {
  slug: 'newsletterSignup',
  interfaceName: 'NewsletterSignupBlock',
  labels: {
    singular: { en: 'Newsletter Signup', tr: 'Bülten Kaydı' },
    plural: { en: 'Newsletter Signups', tr: 'Bülten Kayıtları' },
  },
  fields: [
    { name: 'title', type: 'text', localized: true, label: { en: 'Title', tr: 'Başlık' } },
    { name: 'subtitle', type: 'text', localized: true, label: { en: 'Subtitle', tr: 'Alt başlık' } },
    {
      name: 'placeholder',
      type: 'text',
      localized: true,
      defaultValue: 'email@example.com',
      label: { en: 'Input placeholder', tr: 'Input placeholder' },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      localized: true,
      required: true,
      label: { en: 'Button Label', tr: 'Buton metni' },
    },
    {
      name: 'submitUrl',
      type: 'text',
      required: true,
      label: { en: 'Submit Endpoint URL', tr: 'Submit Endpoint URL' },
      admin: { description: { en: 'POST endpoint that accepts { email }', tr: '{ email } kabul eden POST endpoint' } },
    },
    {
      name: 'successMessage',
      type: 'text',
      localized: true,
      label: { en: 'Success Message', tr: 'Başarı Mesajı' },
    },
    {
      name: 'consentText',
      type: 'textarea',
      localized: true,
      label: { en: 'Consent / Privacy Text', tr: 'Aydınlatma / Gizlilik Metni' },
    },
  ],
}
