import { FileText, ShieldCheck, Mail } from "lucide-react"
import { InfoPage, InfoCard, LegalBody, LegalSection, RelatedLinks } from "@/components/InfoPage"
import { APP_NAME, LAST_UPDATED, SUPPORT_EMAIL } from "@/lib/appInfo"

export default function Terms() {
  return (
    <InfoPage
      eyebrow={`Last updated ${LAST_UPDATED}`}
      title="Terms & Conditions"
      intro={`Please read these terms before using ${APP_NAME}. By creating an account or using the app you agree to them.`}
      icon={FileText}
    >
      <InfoCard>
        <LegalBody>
          <LegalSection n={1} title="About the service">
            <p>{APP_NAME} is a platform that helps people share surplus food with others nearby. We connect donors and receivers; we do not prepare, inspect, store, transport or deliver food, and we are not a party to any exchange between users.</p>
          </LegalSection>

          <LegalSection n={2} title="Eligibility and your account">
            <ul>
              <li>You must be at least 18 years old, or use the app with a parent or guardian's supervision.</li>
              <li>Give accurate information and keep your login details secure.</li>
              <li>You are responsible for activity on your account. Tell us if you suspect misuse.</li>
            </ul>
          </LegalSection>

          <LegalSection n={3} title="Food safety: donors">
            <p>If you donate food you confirm that it:</p>
            <ul>
              <li>was prepared, handled and stored hygienically and is safe to eat;</li>
              <li>is not expired, spoiled, contaminated or previously served;</li>
              <li>is described honestly, including the preparation time and any common allergens you know of (for example nuts, dairy, gluten, egg).</li>
            </ul>
            <p>Freshness badges in the app are guidance based on general food-safety rules. They are <strong>not</strong> a certification or guarantee of safety.</p>
          </LegalSection>

          <LegalSection n={4} title="Food safety: receivers">
            <p>Check the food yourself before eating it and do not consume anything that looks, smells or tastes off. If you have allergies or medical conditions, ask the donor about ingredients first. You accept food at your own risk.</p>
          </LegalSection>

          <LegalSection n={5} title="Pickups and meeting people">
            <p>Pickups are arranged directly between users. We recommend meeting in public, well-lit places, collecting food promptly and telling someone where you are going. {APP_NAME} is not responsible for what happens during or after a meeting.</p>
          </LegalSection>

          <LegalSection n={6} title="Acceptable use">
            <p>You agree not to:</p>
            <ul>
              <li>sell food or ask for payment, or use the app for commercial advertising;</li>
              <li>post false, misleading, offensive or unlawful content or photos;</li>
              <li>harass, discriminate against or threaten anyone;</li>
              <li>scrape, reverse-engineer or interfere with the app or its security;</li>
              <li>create fake accounts or listings.</li>
            </ul>
          </LegalSection>

          <LegalSection n={7} title="Your content">
            <p>You keep ownership of what you post (such as descriptions and photos). You give {APP_NAME} a non-exclusive, royalty-free licence to display it within the app so the service can work. You promise you have the right to share it.</p>
          </LegalSection>

          <LegalSection n={8} title="Suspension and removal">
            <p>We may remove content, or suspend or close accounts, that break these terms or put others at risk. You may stop using the app and ask us to delete your account at any time.</p>
          </LegalSection>

          <LegalSection n={9} title="Disclaimers and liability">
            <p>The app is provided “as is” and “as available”. To the fullest extent permitted by law, {APP_NAME} and its team are not liable for illness, injury, loss or damage arising from food shared through the app, from meetings between users, or from interruptions to the service. Nothing here limits liability that cannot be excluded by law.</p>
          </LegalSection>

          <LegalSection n={10} title="Changes to these terms">
            <p>We may update these terms from time to time. We will change the date above and, for important changes, tell you in the app. Continuing to use {APP_NAME} means you accept the updated terms.</p>
          </LegalSection>

          <LegalSection n={11} title="Governing law">
            <p>These terms are governed by the laws of India. Disputes will be subject to the courts of Mumbai, Maharashtra, unless the law requires otherwise.</p>
          </LegalSection>

          <LegalSection n={12} title="Contact">
            <p>Questions about these terms? Write to <a className="font-semibold text-primary underline-offset-2 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
          </LegalSection>
        </LegalBody>
      </InfoCard>

      <RelatedLinks
        links={[
          { to: "/privacy", label: "Privacy Policy", icon: ShieldCheck, color: "bg-[#E3E9D9] text-[#526C53] dark:bg-[#293D30] dark:text-[#A7C6A5]" },
          { to: "/contact", label: "Contact us", icon: Mail, color: "bg-[#F9E7C9] text-[#9A6B25] dark:bg-[#493A26] dark:text-[#E7C17C]" },
        ]}
      />
    </InfoPage>
  )
}
