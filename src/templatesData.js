// Built-in campaign templates — each holds an email, LinkedIn and Instagram version.
// Copy follows the house style: plain, lead with the numbers, one CTA "Request the OM".
// Merge fields ({{property}}, {{price}} …) are filled from the deal in previews and at send time.
// Teams can add their own templates on top of these (stored in distribution/<team>/templates).
export const TEMPLATE_LIBRARY = [
  {
    id: 'jl', name: 'Just Listed', is_system: true,
    email: {
      subject: 'Just Listed: {{property}} — {{city}}, {{state}}',
      body: "We're pleased to bring {{property}} to market in {{city}}, {{state}}.\n\n• Price: {{price}}\n• Cap rate: {{cap_rate}}\n• Tenant: {{tenant}}\n\nFull financials and the offering memorandum are available on request.\n\nRequest the OM: {{link}}",
    },
    linkedin: { text: "Just listed: {{property}} in {{city}}, {{state}} — {{price}} at a {{cap_rate}} cap.\n\nTenant, lease term and financials are in the OM. Link below.\n\n{{link}}\n\n#CRE #NetLease #Investment #RealEstate" },
    instagram: { caption: "Just listed — {{property}}, {{city}} {{state}}. {{price}}.\n\nFull details in the OM. Link in bio." },
  },
  {
    id: 'cs', name: 'Coming Soon', is_system: true,
    email: {
      subject: 'Coming Soon: {{property}} — {{city}}, {{state}}',
      body: "{{property}} in {{city}}, {{state}} is coming to market soon.\n\n• Guide price: {{price}}\n• Tenant: {{tenant}}\n\nWe're previewing this ahead of the launch. Reply to be on the early list, or request the OM when it's ready.\n\n{{link}}",
    },
    linkedin: { text: "Coming soon: {{property}} in {{city}}, {{state}}.\n\nWe're releasing this {{price}} opportunity to our list first. Comment or message to get the OM at launch.\n\n{{link}}\n\n#CRE #ComingSoon #NetLease" },
    instagram: { caption: "Coming soon — {{property}}, {{city}} {{state}}.\n\nBe first to see it. Link in bio." },
  },
  {
    id: 'pr', name: 'Price Reduced', is_system: true,
    email: {
      subject: 'Price Reduced: {{property}} — now {{price}}',
      body: "The pricing on {{property}} ({{city}}, {{state}}) has been adjusted to {{price}}.\n\n• Cap rate: {{cap_rate}}\n• Tenant: {{tenant}}\n\nFull financials and the OM are available on request.\n\nRequest the OM: {{link}}",
    },
    linkedin: { text: "Price adjusted: {{property}} in {{city}}, {{state}} is now {{price}} ({{cap_rate}} cap).\n\nThe OM has the full picture — link below.\n\n{{link}}\n\n#CRE #NetLease #Investment" },
    instagram: { caption: "Price reduced — {{property}}, {{city}} {{state}}. Now {{price}}.\n\nDetails in the OM. Link in bio." },
  },
  {
    id: 'uc', name: 'Under Contract', is_system: true,
    email: {
      subject: 'Under Contract: {{property}} — {{city}}, {{state}}',
      body: "{{property}} in {{city}}, {{state}} is now under contract.\n\nThank you to everyone who looked at it. If you have a similar requirement, we'd welcome a conversation — we often have off-market product that fits.\n\n{{link}}",
    },
    linkedin: { text: "Under contract: {{property}} in {{city}}, {{state}}.\n\nStrong interest on this one. If you're looking for similar {{tenant}}-style net lease product, let's talk.\n\n#CRE #NetLease #Investment" },
    instagram: { caption: "Under contract — {{property}}, {{city}} {{state}}.\n\nLooking for similar? Link in bio." },
  },
  {
    id: 'cfo', name: 'Call for Offers', is_system: true,
    email: {
      subject: 'Call for Offers: {{property}} — {{city}}, {{state}}',
      body: "We're calling for offers on {{property}} in {{city}}, {{state}}.\n\n• Guide price: {{price}}\n• Cap rate: {{cap_rate}}\n• Tenant: {{tenant}}\n\nPlease review the OM and submit your best offer by the deadline.\n\nRequest the OM: {{link}}",
    },
    linkedin: { text: "Call for offers: {{property}} in {{city}}, {{state}} — {{price}} at a {{cap_rate}} cap.\n\nReview the OM and submit by the deadline. Link below.\n\n{{link}}\n\n#CRE #NetLease #CallForOffers" },
    instagram: { caption: "Call for offers — {{property}}, {{city}} {{state}}. {{price}}.\n\nReview the OM. Link in bio." },
  },
  {
    id: 'sd', name: 'Sold', is_system: true,
    email: {
      subject: 'Sold: {{property}} — {{city}}, {{state}}',
      body: "We're pleased to announce the successful sale of {{property}} in {{city}}, {{state}}.\n\nThank you to everyone who participated. If you have a similar {{tenant}}-style requirement, we'd welcome a conversation.\n\n{{link}}",
    },
    linkedin: { text: "Sold: {{property}} in {{city}}, {{state}}.\n\nThank you to all parties. If you're buying or selling similar net lease product, let's connect.\n\n#CRE #NetLease #Sold #Investment" },
    instagram: { caption: "Sold — {{property}}, {{city}} {{state}}.\n\nHave a similar property? Link in bio." },
  },
]

// A blank template skeleton for "New template".
export const BLANK_TEMPLATE = {
  name: '',
  email: { subject: '', body: '' },
  linkedin: { text: '' },
  instagram: { caption: '' },
}
