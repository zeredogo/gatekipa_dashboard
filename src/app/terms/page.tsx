import React from "react";
import { ShieldCheck, CalendarClock, Mail, AlertTriangle } from "lucide-react";
import styles from "./terms.module.css";

export default function TermsAndConditions() {
  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className={styles.title}>Terms and Conditions</h1>
          <p className={styles.date}>
            <CalendarClock size={16} /> Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className={`gk-card ${styles.content}`}>
        <section className={styles.section}>
          <p>
            These Terms and Conditions (“Terms”) govern your access to and use of the
            <strong className={styles.strongText}> GATEKIPA</strong> application and services (“Gatekipa”, “we”, “us”, or “our”).
          </p>
          <div className={styles.alertBox}>
            <AlertTriangle className={styles.alertIcon} size={20} />
            <p className={styles.alertText}>
              By accessing or using Gatekipa, you agree to be legally bound by these Terms and
              Conditions (“Terms”). If you do not agree, please do not use the Service.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>1.</span> Service Description
          </h2>
          <div className={styles.sectionContent}>
            <p><strong className={styles.strongText}>1.1</strong> Gatekipa is a subscription management and payment control platform, that enables users to manage recurring payments across third party services.</p>
            <p><strong className={styles.strongText}>1.2</strong> Gatekipa allows users to:</p>
            <ul className={styles.list}>
              <li>Create virtual payment cards linked to subscriptions</li>
              <li>Define spending limits, usage rules, and expiration dates</li>
              <li>Generate one-time cards for free trials</li>
              <li>Track and organize subscriptions (personal, client, or business)</li>
              <li>Enable or disable cards in real time</li>
              <li>Receive notifications for billing and subscription events</li>
              <li>Collaborate with team members on subscription management</li>
            </ul>
            <p><strong className={styles.strongText}>1.3 Non-Banking Status:</strong> Gatekipa is not a bank or deposit by taking institution and does not hold customer funds.</p>
            <p><strong className={styles.strongText}>1.4 Payment Infrastructure:</strong> All payment processing services are provided through licensed third-party financial institutions and payment processors, including but not limited to Paystack.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>2.</span> Regulatory Compliance
          </h2>
          <div className={styles.sectionContent}>
            <p><strong className={styles.strongText}>2.1</strong> Gatekipa operates in compliance with applicable Nigerian laws, including:</p>
            <ul className={styles.list}>
              <li>Nigeria Data Protection Regulation (NDPR)</li>
              <li>Consumer protection laws</li>
              <li>Applicable Central Bank of Nigeria (CBN) guidelines</li>
            </ul>
            <p><strong className={styles.strongText}>2.2</strong> Where applicable, international data protection and security standards are observed in line with global best practices.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>3.</span> Eligibility and Onboarding
          </h2>
          <div className={styles.sectionContent}>
            <p><strong className={styles.strongText}>3.1</strong> You must:</p>
            <ul className={styles.list}>
              <li>Be at least 18 years old</li>
              <li>Possess legal capacity to contract</li>
              <li>Provide accurate, complete, and verifiable information</li>
            </ul>
            <p><strong className={styles.strongText}>3.2</strong> Gatekipa reserves the right to conduct identity verification (KYC) where required by law or its partners.</p>
            <p><strong className={styles.strongText}>3.3</strong> Businesses must ensure that only authorized representatives act on their behalf.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>4.</span> User Obligations
          </h2>
          <div className={styles.gridBox}>
            <div className={styles.successBox}>
              <h3 className={styles.successTitle}>You agree to:</h3>
              <ul className={`${styles.list} ${styles.smallList}`}>
                <li>Use the Service only for lawful purposes</li>
                <li>Maintain the confidentiality of your credentials</li>
                <li>Ensure that your card configurations reflect your intended usage</li>
                <li>Promptly update account information</li>
              </ul>
            </div>
            <div className={styles.dangerBox}>
              <h3 className={styles.dangerTitle}>You shall not:</h3>
              <ul className={`${styles.list} ${styles.smallList}`}>
                <li>Use the platform for fraudulent or unlawful transaction</li>
                <li>Attempt to bypass system controls or security features</li>
                <li>Misrepresent your identity or authority</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>5.</span> Virtual Cards and Payment Controls
          </h2>
          <div className={styles.sectionContent}>
            <p><strong className={styles.strongText}>5.1</strong> Gatekipa enables users to create and manage virtual cards subject to user-defined controls.</p>
            <p><strong className={styles.strongText}>5.2</strong> Users retain full responsibility for:</p>
            <ul className={styles.list}>
              <li>Configured limits and restrictions</li>
              <li>Subscription obligations to third-party providers</li>
            </ul>
            <p><strong className={styles.strongText}>5.3</strong> Gatekipa will act on your instructions but does not control third-party billing practices.</p>
            <p><strong className={styles.strongText}>5.4</strong> Disabling a card may not reverse already authorized transactions.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>6.</span> Payments and Third-Party Services
          </h2>
          <div className={styles.sectionContent}>
            <p><strong className={styles.strongText}>6.1</strong> Payment transactions are processed exclusively by licensed third-party providers.</p>
            <p><strong className={styles.strongText}>6.2</strong> By using Gatekipa, you agree to comply with:</p>
            <ul className={styles.list}>
              <li>The terms of such payment providers</li>
              <li>Applicable card network rules</li>
            </ul>
            <p><strong className={styles.strongText}>6.3</strong> Gatekipa:</p>
            <ul className={styles.list}>
              <li>Does not store sensitive card data except in tokenized form</li>
              <li>Does not guarantee uninterrupted payment processing</li>
              <li>Shall not be liable for third-party system failures</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>7.</span> Failed Transactions
          </h2>
          <div className={styles.sectionContent}>
            <p><strong className={styles.strongText}>7.1</strong> Transactions may fail due to:</p>
            <ul className={styles.list}>
              <li>Insufficient funds</li>
              <li>User-imposed restrictions</li>
              <li>Technical or network errors</li>
              <li>Security flags by payment partners</li>
            </ul>
            <p><strong className={styles.strongText}>7.2</strong> Gatekipa shall not be liable for:</p>
            <ul className={styles.list}>
              <li>Subscription cancellations or penalties resulting from failed payments</li>
              <li>Losses arising from third-party actions</li>
            </ul>
            <p><strong className={styles.strongText}>7.3</strong> Users will receive notifications of failed transactions where possible.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>8.</span> Refund Policy
          </h2>
          <div className={styles.sectionContent}>
            <p><strong className={styles.strongText}>8.1</strong> Gatekipa does not issue refunds for payments made to third-party service providers.</p>
            <p><strong className={styles.strongText}>8.2</strong> All subscription related refund requests must be directed to the relevant service provider.</p>
            <p><strong className={styles.strongText}>8.3</strong> Where a transaction error is attributable to Gatekipa or its partners, investigations will be conducted, and any applicable reversals will be handled in accordance with partner policies and applicable law.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>9.</span> Disputes and Chargebacks
          </h2>
          <div className={styles.sectionContent}>
            <p><strong className={styles.strongText}>9.1</strong> Users must first contact Gatekipa support for dispute resolution.</p>
            <p><strong className={styles.strongText}>9.2</strong> Chargebacks initiated without prior engagement may result in:</p>
            <ul className={styles.list}>
              <li>Account suspension</li>
              <li>Restriction of services</li>
              <li>Recovery actions where applicable</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>10.</span> Team Access and Permissions
          </h2>
          <div className={styles.sectionContent}>
            <p><strong className={styles.strongText}>10.1</strong> Users may invite team members to manage subscriptions.</p>
            <p><strong className={styles.strongText}>10.2</strong> The primary account holder assumes full responsibility for:</p>
            <ul className={styles.list}>
              <li>Permissions granted</li>
              <li>Actions performed by team members</li>
            </ul>
            <p><strong className={styles.strongText}>10.3</strong> Gatekipa shall not be liable for misuse arising from shared access.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>11.</span> Notifications and Alerts
          </h2>
          <div className={styles.sectionContent}>
            <p><strong className={styles.strongText}>11.1</strong> Gatekipa provides system generated notifications relating to:</p>
            <ul className={styles.list}>
              <li>Upcoming charges</li>
              <li>Failed or successful transactions</li>
              <li>Subscription activity</li>
            </ul>
            <p><strong className={styles.strongText}>11.2</strong> Delivery is not guaranteed and may be affected by external factors.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>12-18.</span> Legal and Compliance
          </h2>
          <div className={styles.sectionContent}>
            <div>
              <h3 className={styles.strongText}>12. Data Protection and Privacy</h3>
              <p>Gatekipa employs industry-standard safeguards (encryption, auth, access controls). Personal data is processed in accordance with NDPR and international principles. Users consent to data processing necessary for service delivery.</p>
            </div>
            <div>
              <h3 className={styles.strongText}>13. Intellectual Property</h3>
              <p>All intellectual property rights in the Service remain vested in Gatekipa or its licensors. Unauthorized reproduction, distribution, or modification is strictly prohibited.</p>
            </div>
            <div>
              <h3 className={styles.strongText}>14. Limitation of Liability</h3>
              <p>To the maximum extent permitted by law, Gatekipa shall not be liable for indirect, incidental, or consequential damages; loss of revenue, profits, or data; third-party service failures; or user misconfiguration of card controls.</p>
            </div>
            <div>
              <h3 className={styles.strongText}>15. Disclaimer</h3>
              <p>The Service is provided on an “as is” and “as available” basis without warranties of any kind, whether express or implied.</p>
            </div>
            <div>
              <h3 className={styles.strongText}>16. Termination and Suspension</h3>
              <p>Gatekipa reserves the right to suspend or terminate access where there is a breach of these Terms, required by law/regulatory directive, or suspicious/fraudulent activity is detected. You may stop using the Service at any time.</p>
            </div>
            <div>
              <h3 className={styles.strongText}>17. Governing Law and Dispute Resolution</h3>
              <p>These Terms shall be governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved through initial good-faith negotiation, failing which, submission to competent courts in Nigeria.</p>
            </div>
            <div>
              <h3 className={styles.strongText}>18. Amendments</h3>
              <p>We may revise these Terms at any time. Continued use constitutes acceptance of the updated Terms.</p>
            </div>
          </div>
        </section>

        <div className={styles.contactSection}>
          <div className={styles.contactIconWrapper}>
            <Mail color="hsl(var(--primary))" size={28} />
          </div>
          <div>
            <h3 className={styles.strongText}>19. Contact Us</h3>
            <p>For support or inquiries, kindly send us an email at</p>
            <a href="mailto:hello@gatekipa.com" className={styles.contactEmail}>
              hello@gatekipa.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
