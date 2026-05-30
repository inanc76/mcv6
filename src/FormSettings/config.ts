import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated'

/**
 * Form Settings — global form behavior toggles.
 *
 * Applies to ALL forms in the Forms collection. Per-form overrides not
 * supported by design; if a project needs different behavior per form,
 * add per-form fields to forms.yml instead.
 *
 * Read by `src/utilities/formSpamGuard.ts` on every submission:
 * - honeypotEnabled → run honeypot check
 * - autoReplyEnabled → seed-forms writes auto-reply email config (build-time)
 * - captchaEnabled + captchaProvider → run captcha verification
 *
 * Captcha provider env vars (set in .env when enabled):
 * - Turnstile:  CLOUDFLARE_TURNSTILE_SECRET_KEY  + NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY
 * - reCAPTCHA:  RECAPTCHA_SECRET_KEY              + NEXT_PUBLIC_RECAPTCHA_SITE_KEY
 */
export const FormSettings: GlobalConfig = {
  slug: 'form-settings',
  label: { tr: 'Form Ayarları', en: 'Form Settings' },
  access: {
    read: () => true,
    update: authenticated,
  },
  admin: {
    group: { tr: 'Formlar', en: 'Forms' },
  },
  fields: [
    {
      name: 'honeypotEnabled',
      type: 'checkbox',
      label: { tr: 'Honeypot Etkin', en: 'Honeypot Enabled' },
      defaultValue: true,
      admin: {
        description: {
          tr: 'Görünmez bir input alanı eklenir. Botlar bu alanı doldurursa form gönderimi reddedilir; gerçek kullanıcılar görmez. Standart spam koruması.',
          en: 'An invisible input field is added. If bots fill it in, the submission is rejected; real users never see it. Standard spam protection.',
        },
      },
    },
    {
      name: 'autoReplyEnabled',
      type: 'checkbox',
      label: { tr: 'Onay Maili Etkin', en: 'Auto-Reply Enabled' },
      defaultValue: true,
      admin: {
        description: {
          tr: 'Form gönderildiğinde, formu dolduran kişiye otomatik teşekkür/onay maili gönderilir. Form içinde "email" adında bir alan bulunmalıdır.',
          en: 'When the form is submitted, an automatic thank-you/confirmation email is sent to the submitter. The form must include a field named "email".',
        },
      },
    },
    {
      name: 'captchaEnabled',
      type: 'checkbox',
      label: { tr: 'Captcha Etkin', en: 'Captcha Enabled' },
      defaultValue: false,
      admin: {
        description: {
          tr: 'Form gönderiminde captcha doğrulaması yapılır. Doğrulama başarısız olursa form gönderilmez. Honeypot\'a ek bir koruma katmanı.',
          en: 'Captcha verification is required on form submission. If verification fails, the submission is rejected. An additional layer on top of honeypot.',
        },
      },
    },
    {
      name: 'captchaProvider',
      type: 'radio',
      label: { tr: 'Captcha Sağlayıcı', en: 'Captcha Provider' },
      defaultValue: 'turnstile',
      options: [
        {
          label: { tr: 'Cloudflare Turnstile', en: 'Cloudflare Turnstile' },
          value: 'turnstile',
        },
        {
          label: { tr: 'Google reCAPTCHA v3', en: 'Google reCAPTCHA v3' },
          value: 'recaptcha-v3',
        },
      ],
      admin: {
        condition: (data) => Boolean(data?.captchaEnabled),
        description: {
          tr: 'Seçtiğin sağlayıcıya göre .env dosyasına SECRET_KEY (server) + SITE_KEY (frontend) ekle. Turnstile: CLOUDFLARE_TURNSTILE_* env\'leri. reCAPTCHA: RECAPTCHA_* env\'leri. Set değilse captcha bypass edilir.',
          en: 'Add SECRET_KEY (server) + SITE_KEY (frontend) to .env based on your provider choice. Turnstile: CLOUDFLARE_TURNSTILE_* envs. reCAPTCHA: RECAPTCHA_* envs. If unset, captcha is bypassed.',
        },
      },
    },
  ],
}
