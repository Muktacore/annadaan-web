import { ShieldCheck, FileText, Mail } from "lucide-react"
import { InfoPage, InfoCard, LegalBody, LegalSection, RelatedLinks } from "@/components/InfoPage"
import { APP_NAME, LAST_UPDATED, PRIVACY_EMAIL } from "@/lib/appInfo"

export default function Privacy() {
  return (
    <InfoPage
      eyebrow={`Last updated ${LAST_UPDATED}`}
      title="Privacy Policy"
      intro={`Your privacy matters. This explains what ${APP_NAME} collects, why, and the choices you have.`}
      icon={ShieldCheck}
    >
      <InfoCard>
        <LegalBody>
          <LegalSection n={1} title="What we collect">
            <ul>
              <li><strong>Account details:</strong> your name, email address and profile photo (from Google if you use Google sign-in).</li>
              <li><strong>Donation and request details:</strong> food type, quantity, preparation time, pickup location, status, and any photo you upload.</li>
              <li><strong>Location:</strong> your device's approximate or precise location, only if you give permission, to show nearby food on the map.</li>
              <li><strong>Technical data:</strong> basic device and usage information needed to keep the app secure and working.</li>
            </ul>
          </LegalSection>

          <LegalSection n={2} title="How we use it">
            <ul>
              <li>To create and secure your account and let you sign in.</li>
              <li>To show, match and manage donations and requests.</li>
              <li>To show food near you on the map.</li>
              <li>To respond to your support requests and keep the community safe.</li>
              <li>To improve the app.</li>
            </ul>
            <p>We do not sell your personal information.</p>
          </LegalSection>

          <LegalSection n={3} title="What other users can see">
            <p>When you post a donation, other signed-in users can see the food details, your display name and the pickup location you provide. Please avoid putting sensitive information in descriptions or photos. Your email address is not shown on public listings.</p>
          </LegalSection>

          <LegalSection n={4} title="Services we rely on">
            <p>We use trusted providers to run the app:</p>
            <ul>
              <li><strong>Google Firebase</strong> for sign-in, database and hosting of your data.</li>
              <li><strong>Google Sign-In</strong> if you choose to continue with Google.</li>
              <li><strong>Cloudinary</strong> to store donation photos you upload.</li>
              <li><strong>OpenStreetMap / Leaflet</strong> to draw map tiles.</li>
            </ul>
            <p>These providers process data on our behalf under their own privacy terms and may store it on servers outside India.</p>
          </LegalSection>

          <LegalSection n={5} title="How long we keep it">
            <p>We keep your information while your account is active. If you ask us to delete your account we remove your profile and personal details within a reasonable period, except where we must keep some records to meet legal obligations or resolve disputes.</p>
          </LegalSection>

          <LegalSection n={6} title="Your choices and rights">
            <ul>
              <li>Edit your name and details from your Profile.</li>
              <li>Turn off location access any time in your device settings.</li>
              <li>Request a copy of your data, a correction, or deletion of your account by emailing us.</li>
              <li>Withdraw consent where we rely on it. This will not affect past use.</li>
            </ul>
          </LegalSection>

          <LegalSection n={7} title="Security">
            <p>We use industry-standard protections, including encrypted connections and access rules on our database. No system is perfectly secure, so please use a strong password and keep it private.</p>
          </LegalSection>

          <LegalSection n={8} title="Children">
            <p>{APP_NAME} is not meant for children under 13, and we do not knowingly collect their data. Younger users should only use the app with a parent or guardian.</p>
          </LegalSection>

          <LegalSection n={9} title="Changes to this policy">
            <p>If we change this policy we will update the date above and, for significant changes, let you know in the app.</p>
          </LegalSection>

          <LegalSection n={10} title="Contact us">
            <p>For privacy questions or requests, email <a className="font-semibold text-primary underline-offset-2 hover:underline" href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.</p>
          </LegalSection>
        </LegalBody>
      </InfoCard>

      <RelatedLinks
        links={[
          { to: "/terms", label: "Terms & Conditions", icon: FileText, color: "bg-[#E3E9D9] text-[#526C53] dark:bg-[#293D30] dark:text-[#A7C6A5]" },
          { to: "/contact", label: "Contact us", icon: Mail, color: "bg-[#F9E7C9] text-[#9A6B25] dark:bg-[#493A26] dark:text-[#E7C17C]" },
        ]}
      />
    </InfoPage>
  )
}
