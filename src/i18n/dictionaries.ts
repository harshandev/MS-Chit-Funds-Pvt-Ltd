/**
 * Lightweight i18n. English is the source of truth. Tamil strings below are
 * a DRAFT and must be reviewed by a human translator (and legal for any
 * legal/scheme copy) before launch. Add a language by adding a dictionary.
 */
export const en = {
  "nav.home": "Home", "nav.how": "How It Works", "nav.plans": "Explore Chits", "nav.transparency": "Transparency", "nav.about": "About Us", "nav.contact": "Contact",
  "nav.signin": "Sign In", "nav.explore": "Explore Plans",
  "hero.eyebrow": "THE NEXT CHAPTER OF CHIT FUNDS",
  "hero.title": "Financial journeys, built on trust.",
  "hero.text": "Discover a clearer, more convenient way to participate in chit funds, with transparent scheme information, understandable calculations, and a digital experience designed around you.",
  "hero.cta1": "Explore Chit Plans", "hero.cta2": "Understand How It Works",
  "hero.line": "Clarity at every step. Transparency in every transaction.",
  "footer.legal": "Legal", "footer.explore": "Explore",
} as const;
export type DictKey = keyof typeof en;

export const ta: Record<DictKey, string> = {
  "nav.home": "முகப்பு", "nav.how": "எவ்வாறு செயல்படுகிறது", "nav.plans": "சீட்டு திட்டங்கள்", "nav.transparency": "வெளிப்படைத்தன்மை", "nav.about": "எங்களைப் பற்றி", "nav.contact": "தொடர்புக்கு",
  "nav.signin": "உள்நுழைய", "nav.explore": "திட்டங்களைப் பார்க்க",
  "hero.eyebrow": "சீட்டு நிதியின் அடுத்த அத்தியாயம்",
  "hero.title": "நம்பிக்கையின் மீது கட்டமைக்கப்பட்ட நிதிப் பயணங்கள்.",
  "hero.text": "வெளிப்படையான திட்டத் தகவல்கள், புரிந்துகொள்ளக்கூடிய கணக்கீடுகள் மற்றும் உங்களை மையமாகக் கொண்ட டிஜிட்டல் அனுபவத்துடன் சீட்டு நிதியில் பங்கேற்க தெளிவான, வசதியான வழியைக் கண்டறியுங்கள்.",
  "hero.cta1": "சீட்டு திட்டங்களைப் பார்க்க", "hero.cta2": "எவ்வாறு செயல்படுகிறது என அறிய",
  "hero.line": "ஒவ்வொரு படியிலும் தெளிவு. ஒவ்வொரு பரிவர்த்தனையிலும் வெளிப்படைத்தன்மை.",
  "footer.legal": "சட்டம்", "footer.explore": "பார்வையிட",
};

export const dictionaries = { en, ta } as const;
export type Lang = keyof typeof dictionaries;
export const languages: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ்" },
];
