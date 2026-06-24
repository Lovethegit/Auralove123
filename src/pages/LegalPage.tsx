import { PublicLayout, PageHero } from '../components/Layout';
import { Mail } from 'lucide-react';
import { type ReactNode } from 'react';

type LegalPage = 'privacy' | 'terms' | 'cookies' | 'disclaimer';

const META: Record<LegalPage, { eyebrow: string; title: string; updated: string }> = {
  privacy: { eyebrow: 'Legal', title: 'Privacy Policy', updated: 'Last updated: June 2026' },
  terms: { eyebrow: 'Legal', title: 'Terms of Service', updated: 'Last updated: June 2026' },
  cookies: { eyebrow: 'Legal', title: 'Cookie Policy', updated: 'Last updated: June 2026' },
  disclaimer: { eyebrow: 'Legal', title: 'Disclaimer', updated: 'Last updated: June 2026' },
};

export function LegalPage({ kind }: { kind: LegalPage }) {
  const meta = META[kind];
  return (
    <PublicLayout>
      <PageHero eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.updated} />
      <section className="max-w-3xl mx-auto px-5 md:px-10 pb-24">
        <div className="prose-aura">{CONTENT[kind]}</div>
        <div className="mt-12 glass-card p-5 flex items-center gap-3">
          <Mail size={16} className="text-aura-200" />
          <p className="text-sm text-slate-300">
            Questions about this policy? Email{' '}
            <a href="mailto:officiallovesaura@gmail.com" className="text-aura-200 hover:text-white">officiallovesaura@gmail.com</a>.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}

const ABOUT = (
  <>
    <p>
      Love&rsquo;s Aura (&ldquo;the platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a creative publishing
      platform operated and curated by Love Parekh. The platform hosts original writings, media,
      galleries, events, and quotes — all published under the attribution &ldquo;Published by Love
      Parekh&rdquo;.
    </p>
    <p>
      By accessing or using the platform you agree to the terms described on this page. If you do
      not agree, please discontinue use of the platform.
    </p>
  </>
);

const CONTENT: Record<LegalPage, ReactNode> = {
  privacy: (
    <>
      {ABOUT}
      <h2>1. Information we collect</h2>
      <p>
        Love&rsquo;s Aura is a public, read-only platform for visitors — no account, sign-up, or login
        is required to view any content. We do not collect names, email addresses, or identifiers
        from public visitors.
      </p>
      <p>You may provide personal information in two ways:</p>
      <ul>
        <li>
          <strong>Contact form</strong> — when you submit the contact form on the Contact page, your
          default email application opens pre-addressed to officiallovesaura@gmail.com with your name,
          email, and message. This information is transmitted directly through your email provider,
          not through our servers.
        </li>
        <li>
          <strong>Direct email</strong> — any message you send to officiallovesaura@gmail.com is
          received and stored by us solely to respond to your inquiry.
        </li>
      </ul>

      <h2>2. Public content &amp; uploaded media</h2>
      <p>
        Content published by the administrator — blog posts, music videos, audio, images, events,
        quotes, and creations — is stored in a Supabase-hosted database and file storage. Uploaded
        media files are stored in a publicly readable storage bucket so visitors can view and play
        them. All content is permanently attributed to &ldquo;Published by Love Parekh&rdquo;.
      </p>

      <h2>3. Technical &amp; infrastructure data</h2>
      <p>
        Our backend (Supabase) and hosting infrastructure may automatically log anonymous technical
        data including IP addresses, request timestamps, browser type, and device information. This
        data is used strictly for security, stability, abuse prevention, and service operation. We do
        not sell, rent, or share this data with third parties for marketing purposes.
      </p>

      <h2>4. Admin authentication</h2>
      <p>
        The admin dashboard at <code>/admin</code> is protected by a single set of hardcoded
        credentials. When the administrator logs in, a session token is stored in the browser&rsquo;s
        local storage so the dashboard remains accessible across page reloads. This token is stored
        only on the administrator&rsquo;s device and is never shared.
      </p>

      <h2>5. AI-generated content</h2>
      <p>
        The administrator may use the AI Generation Studio to assist in drafting blog posts, quotes,
        and media descriptions. These drafts may be routed through a third-party AI provider
        (Google Gemini or OpenAI) using API keys stored securely as Supabase secrets. The topic and
        tone you enter are sent to the AI provider; the provider&rsquo;s own privacy policy applies to
        that transmission. All published AI-assisted content is attributed exclusively as
        &ldquo;Published by Love Parekh&rdquo; and is never labeled as AI-generated.
      </p>

      <h2>6. Third-party services</h2>
      <p>The platform interacts with the following third parties:</p>
      <ul>
        <li><strong>Supabase</strong> — database, file storage, and serverless functions.</li>
        <li><strong>Google Gemini / OpenAI</strong> — AI text generation (admin-only, when configured).</li>
        <li>
          <strong>Embedded media providers</strong> (YouTube, Vimeo, SoundCloud, Spotify) — when you
          interact with an embedded player, those providers may set cookies or collect data per their
          own policies.
        </li>
        <li><strong>Google Fonts</strong> — web fonts may expose your IP address to Google&rsquo;s servers.</li>
      </ul>

      <h2>7. Cookies &amp; local storage</h2>
      <p>
        We do not use advertising or tracking cookies. The platform stores only essential local
        data: the admin session token (administrator&rsquo;s device only) and optional UI preferences.
        Embedded third-party players may set their own cookies — see the Cookie Policy for details.
      </p>

      <h2>8. How we use information</h2>
      <ul>
        <li>To respond to messages you send via the contact form or direct email.</li>
        <li>To operate, secure, and maintain the platform.</li>
        <li>To improve content quality and user experience.</li>
      </ul>

      <h2>9. Data retention</h2>
      <p>
        Email correspondence is retained only as long as needed to fulfill the purpose of the
        conversation. Published content remains available until the administrator removes it.
        Anonymous technical logs are retained according to the hosting provider&rsquo;s standard
        retention policy.
      </p>

      <h2>10. Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of any personal data you have shared
        with us by emailing officiallovesaura@gmail.com. We will respond within a reasonable
        timeframe.
      </p>

      <h2>11. Children&rsquo;s privacy</h2>
      <p>
        The platform is intended for a general audience. We do not knowingly collect personal data
        from children under 16. If you believe a child has provided us with personal data, please
        contact us and we will delete it.
      </p>

      <h2>12. International users</h2>
      <p>
        The platform is hosted in the cloud and may be accessed globally. By using it, you
        acknowledge that your technical data may be processed in a country different from your own,
        subject to its data protection laws.
      </p>

      <h2>13. Security</h2>
      <p>
        We implement reasonable technical measures including row-level security on the database,
        server-side validation of admin credentials, and encrypted API key storage. However, no method
        of internet transmission or electronic storage is fully secure.
      </p>

      <h2>14. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be posted on this page with
        a revised date. Continued use of the platform after changes constitutes acceptance.
      </p>

      <h2>15. Contact</h2>
      <p>
        For any privacy questions or requests, email{' '}
        <a href="mailto:officiallovesaura@gmail.com">officiallovesaura@gmail.com</a>.
      </p>
    </>
  ),
  terms: (
    <>
      {ABOUT}
      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Copy, redistribute, or republish content without attribution to Love Parekh.</li>
        <li>Attempt to gain unauthorized access to the admin dashboard or backend systems.</li>
        <li>Use the platform to transmit malware, spam, or unlawful material.</li>
        <li>Scrape or automate collection of content in a way that degrades the service.</li>
      </ul>
      <h2>Intellectual property</h2>
      <p>
        All content published on Love&rsquo;s Aura — including writings, videos, audio, images, and
        quotes — is the original work of Love Parekh and is attributed as &ldquo;Published by Love
        Parekh&rdquo;. Content may not be reproduced or distributed without express written
        permission.
      </p>
      <h2>Disclaimer of warranties</h2>
      <p>The platform is provided &ldquo;as is&rdquo; without warranties of any kind.</p>
      <h2>Limitation of liability</h2>
      <p>
        Love&rsquo;s Aura and Love Parekh shall not be liable for any indirect, incidental, or
        consequential damages arising from use of the platform.
      </p>
      <h2>Automated/AI-assisted content</h2>
      <p>
        The administrator may use AI tools to assist in drafting content. All such content is reviewed
        and published under the attribution &ldquo;Published by Love Parekh&rdquo;. The platform never
        represents AI-assisted content as &ldquo;AI generated&rdquo; to readers.
      </p>
      <h2>External links &amp; embedded media</h2>
      <p>
        The platform embeds content from YouTube, Vimeo, SoundCloud, Spotify, and may link to
        third-party sites. We are not responsible for their content, terms, or practices.
      </p>
      <h2>Contact</h2>
      <p>For any questions regarding these terms, contact officiallovesaura@gmail.com.</p>
    </>
  ),
  cookies: (
    <>
      {ABOUT}
      <h2>What are cookies</h2>
      <p>
        Cookies are small text files stored in your browser. Love&rsquo;s Aura uses only essential,
        first-party storage (such as remembering your local dashboard session if you are the
        administrator). We do not use third-party advertising or tracking cookies.
      </p>
      <h2>Cookies we use</h2>
      <ul>
        <li><strong>Session storage</strong> — used only on the admin dashboard to keep you logged in across reloads. No tracking.</li>
        <li><strong>Local preferences</strong> — optional UI preferences, stored on your device only.</li>
      </ul>
      <h2>Third-party embeds</h2>
      <p>
        Some content embeds third-party players (such as YouTube, Vimeo, SoundCloud, or Spotify).
        These providers may set their own cookies according to their own policies when you interact
        with the embedded player. We encourage you to review their policies.
      </p>
      <h2>Managing cookies</h2>
      <p>You can control or delete cookies through your browser settings at any time.</p>
    </>
  ),
  disclaimer: (
    <>
      {ABOUT}
      <h2>General disclaimer</h2>
      <p>
        All content on Love&rsquo;s Aura is provided for informational, artistic, and entertainment
        purposes. While care is taken to ensure accuracy, no guarantee is made regarding
        completeness or reliability.
      </p>
      <h2>External links</h2>
      <p>
        The platform may contain links to third-party websites or embedded content. We are not
        responsible for the content, accuracy, or practices of any third-party sites.
      </p>
      <h2>Professional disclaimer</h2>
      <p>
        Any opinions or reflections expressed in blog posts or quotes are personal creative
        expression and should not be taken as professional advice of any kind.
      </p>
      <h2>Copyright</h2>
      <p>
        Unless otherwise stated, all content is the original work of Love Parekh and is attributed
        as &ldquo;Published by Love Parekh&rdquo;. Unauthorized use is prohibited.
      </p>
      <h2>Contact</h2>
      <p>For concerns regarding any content, contact officiallovesaura@gmail.com.</p>
    </>
  ),
};
