import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-linear-to-br from-(--background) via-(--neutral-50) to-(--secondary-light) py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/auth/signup"
            className="text-(--primary) hover:text-(--primary-dark) text-sm font-medium mb-4 inline-block"
          >
            ← Back to Sign Up
          </Link>
          <h1 className="text-4xl font-bold text-(--text) mb-2">
            Privacy Policy
          </h1>
          <p className="text-(--neutral-500)">Last Updated: November 8, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-(--text)">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-(--neutral-600) leading-relaxed">
              Welcome to SBorrowHub. We respect your privacy and are committed
              to protecting your personal data. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you
              use our borrowing and lending platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              2. Information We Collect
            </h2>
            <div className="space-y-3 text-(--neutral-600)">
              <p className="leading-relaxed">
                <strong className="text-(--text)">
                  2.1 Personal Information:
                </strong>{" "}
                When you register for an account, we collect:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>First and Last Name</li>
                <li>Student ID Number</li>
                <li>Email Address</li>
                <li>Phone Number</li>
                <li>College and Department</li>
                <li>Password (encrypted)</li>
              </ul>

              <p className="leading-relaxed mt-4">
                <strong className="text-(--text)">
                  2.2 Transaction Information:
                </strong>{" "}
                We collect information about your borrowing and lending
                activities, including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Items listed for lending</li>
                <li>Borrowing requests and history</li>
                <li>Reviews and ratings</li>
                <li>Messages between users</li>
              </ul>

              <p className="leading-relaxed mt-4">
                <strong className="text-(--text)">
                  2.3 Usage Information:
                </strong>{" "}
                We automatically collect certain information when you access our
                Service:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and time spent</li>
                <li>Search queries</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              3. How We Use Your Information
            </h2>
            <p className="text-(--neutral-600) leading-relaxed mb-2">
              We use the collected information for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-(--neutral-600) ml-4">
              <li>Providing and maintaining the Service</li>
              <li>Processing borrowing and lending transactions</li>
              <li>Sending notifications about your account and transactions</li>
              <li>Improving user experience and Service functionality</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Complying with legal obligations</li>
              <li>Communicating updates, promotions, and new features</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              4. Information Sharing and Disclosure
            </h2>
            <div className="space-y-3 text-(--neutral-600)">
              <p className="leading-relaxed">
                <strong className="text-(--text)">4.1 With Other Users:</strong>{" "}
                Your name, department, and profile information may be visible to
                other users when you list items or make borrowing requests.
              </p>
              <p className="leading-relaxed">
                <strong className="text-(--text)">
                  4.2 Service Providers:
                </strong>{" "}
                We may share information with third-party service providers who
                assist us in operating the platform (e.g., hosting, analytics).
              </p>
              <p className="leading-relaxed">
                <strong className="text-(--text)">
                  4.3 Legal Requirements:
                </strong>{" "}
                We may disclose your information if required by law or to
                protect our rights, safety, or property.
              </p>
              <p className="leading-relaxed">
                <strong className="text-(--text)">
                  4.4 With Your Consent:
                </strong>{" "}
                We may share your information for other purposes with your
                explicit consent.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
            <p className="text-(--neutral-600) leading-relaxed">
              We implement appropriate technical and organizational security
              measures to protect your personal information from unauthorized
              access, alteration, disclosure, or destruction. However, no method
              of transmission over the Internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-(--neutral-600) leading-relaxed">
              We retain your personal information for as long as your account is
              active or as needed to provide you services. You may request
              deletion of your account and data at any time, subject to legal
              obligations to retain certain information.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
            <p className="text-(--neutral-600) leading-relaxed mb-2">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-(--neutral-600) ml-4">
              <li>Access and review your personal information</li>
              <li>Update or correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Restrict or object to certain data processing</li>
              <li>Request a copy of your data in a portable format</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              8. Cookies and Tracking
            </h2>
            <p className="text-(--neutral-600) leading-relaxed">
              We use cookies and similar tracking technologies to track activity
              on our Service and hold certain information. Cookies help us
              remember your preferences and improve your user experience. You
              can instruct your browser to refuse cookies or alert you when
              cookies are being sent.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              9. Children's Privacy
            </h2>
            <p className="text-(--neutral-600) leading-relaxed">
              Our Service is intended for use by students and staff of
              educational institutions. We do not knowingly collect information
              from children under 13 years of age. If you believe we have
              collected such information, please contact us immediately.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-(--neutral-600) leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last Updated" date. You are advised to review
              this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Contact Us</h2>
            <p className="text-(--neutral-600) leading-relaxed">
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <div className="mt-3 space-y-1 text-(--neutral-600)">
              <p>
                Email:{" "}
                <a
                  href="mailto:privacy@sborrowhub.com"
                  className="text-(--primary) hover:underline"
                >
                  privacy@sborrowhub.com
                </a>
              </p>
              <p>
                Support:{" "}
                <a
                  href="mailto:support@sborrowhub.com"
                  className="text-(--primary) hover:underline"
                >
                  support@sborrowhub.com
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-(--neutral-200)">
          <p className="text-sm text-(--neutral-500) text-center">
            By using SBorrowHub, you acknowledge that you have read and
            understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
