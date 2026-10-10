export interface Faq { q: string; a: string; cat?: string }

export const generalFaqs: Faq[] = [
  { q: "What is a chit fund?", a: "A chit fund is a group arrangement in which members contribute a fixed instalment every month. Each month one member receives the pooled amount (less a discount), and the process repeats until every ticket has had its turn.", cat: "Basics" },
  { q: "Is a chit a deposit or an investment with returns?", a: "No. A chit is a participation arrangement with its own rules; it is not a bank deposit and no return is guaranteed. Any figure on this site is an illustration of arithmetic, not a promise of benefit.", cat: "Basics" },
  { q: "What is an auction discount?", a: "The winning bidder accepts less than the gross chit in exchange for receiving the money earlier. The difference is the discount; after the foreman's commission, the rest is shared with members as a dividend.", cat: "Auctions & dividends" },
  { q: "What is the foreman commission?", a: "It is the amount the chit company retains for running the scheme, set per scheme in the approved agreement. The calculator lets you test different values, but real values come only from the agreement.", cat: "Auctions & dividends" },
  { q: "What is a dividend, and who receives it?", a: "The dividend is the distributable part of the discount (discount minus commission) shared among tickets. Which tickets share it, including whether a prized ticket does, is defined by the agreement.", cat: "Auctions & dividends" },
  { q: "If I win the chit amount, do I stop paying?", a: "No. A winning ticket continues to pay the remaining instalments. Receiving the chit amount early does not remove the obligation to complete the scheme.", cat: "Joining & paying" },
  { q: "Can I join any scheme shown on this site?", a: "No. Only schemes that are Active can proceed to onboarding. Schemes that are under review, approved or awaiting commencement are for information, and you can send an enquiry about them.", cat: "Joining & paying" },
  { q: "Are the schemes on this site real?", a: "This is a demo build. Every scheme, figure, status and auction shown is illustrative and is labelled as such. Real schemes will be shown only after the required approvals.", cat: "This demo site" },
  { q: "What do I need to complete onboarding?", a: "Typically a profile, identity (KYC) verification, bank verification and nominee details, followed by agreement review and e-signature. The exact list depends on the scheme and on regulatory requirements.", cat: "Joining & paying" },
  { q: "Does this site ask for my Aadhaar, PAN or password?", a: "The demo sign-in and registration screens do not ask for passwords, PAN or Aadhaar numbers. Identity verification will be handled by an integrated verification process once it is available.", cat: "Data & support" },
  { q: "What happens if I miss an instalment?", a: "Late-payment and default provisions are defined in each scheme's approved agreement. On scheme pages those sections are placeholders until legal approval; no terms are stated in advance.", cat: "Joining & paying" },
  { q: "How is my data used?", a: "See the Privacy page. It is currently a draft template pending legal review. In demo mode, forms are validated in your browser and are not sent or stored.", cat: "Data & support" },
  { q: "Where can I raise a complaint?", a: "Grievance contact details will be published on the Transparency page once they are verified. Until then, use the contact form to send a message.", cat: "Data & support" },
];

export const schemeFaqs: Faq[] = [
  generalFaqs[2], generalFaqs[5], generalFaqs[6], generalFaqs[10],
];
