// ============================================================================
//  EmailJS — apni 3 IDs yahan daalo (emailjs.com se). Ye teenon PUBLIC/safe hain.
//  Private Key yahan MAT daalna.
//
//  1) SERVICE_ID  → EmailJS → Email Services  (jaise "service_ab12cd")
//  2) TEMPLATE_ID → EmailJS → Email Templates (jaise "template_xy34")
//  3) PUBLIC_KEY  → EmailJS → Account → Public Key (jaise "AbC123XyZ")
// ============================================================================
export const EMAILJS = {
  SERVICE_ID: 'service_3djbsvn',
  TEMPLATE_ID: 'template_j5zvjx7',
  PUBLIC_KEY: 'uk5OjdO_Vt_n3kd_0',
}

// Configured hai ya nahi (placeholders abhi tak nahi badle) — code isi se check karta hai.
export const emailReady = () =>
  EMAILJS.SERVICE_ID !== 'YOUR_SERVICE_ID' &&
  EMAILJS.TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
  EMAILJS.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' &&
  !!EMAILJS.SERVICE_ID && !!EMAILJS.TEMPLATE_ID && !!EMAILJS.PUBLIC_KEY
