function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-(--neutral-200) px-6 md:px-8 py-4 md:py-6 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-(--text)">
              Privacy Policy
            </h1>
            <p className="text-xs md:text-sm text-(--neutral-500) mt-1">
              Last Updated: November 8, 2025
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-(--neutral-100) rounded-full transition-colors shrink-0"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-(--neutral-600)"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-4 md:py-6">
          <div className="space-y-4 md:space-y-6 text-(--text)">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-(--neutral-600) leading-relaxed">
                Welcome to SBorrowHub. We respect your privacy and are committed
                to protecting your personal data. This Privacy Policy explains
                how we collect, use, disclose, and safeguard your information
                when you use our borrowing and lending platform.
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
                  We automatically collect certain information when you access
                  our Service:
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
                <li>
                  Sending notifications about your account and transactions
                </li>
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
                  <strong className="text-(--text)">
                    4.1 With Other Users:
                  </strong>{" "}
                  Your name, department, and profile information may be visible
                  to other users when you list items or make borrowing requests.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-(--text)">
                    4.2 Service Providers:
                  </strong>{" "}
                  We may share information with third-party service providers
                  who assist us in operating the platform (e.g., hosting,
                  analytics).
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
                access, alteration, disclosure, or destruction. However, no
                method of transmission over the Internet is 100% secure, and we
                cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
              <p className="text-(--neutral-600) leading-relaxed">
                We retain your personal information for as long as your account
                is active or as needed to provide you services. You may request
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
                We use cookies and similar tracking technologies to track
                activity on our Service and hold certain information. Cookies
                help us remember your preferences and improve your user
                experience. You can instruct your browser to refuse cookies or
                alert you when cookies are being sent.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-3">
                9. Children's Privacy
              </h2>
              <p className="text-(--neutral-600) leading-relaxed">
                Our Service is intended for use by students and staff of
                educational institutions. We do not knowingly collect
                information from children under 13 years of age. If you believe
                we have collected such information, please contact us
                immediately.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
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
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-(--neutral-200) px-6 md:px-8 py-3 md:py-4 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-(--primary) text-white py-2.5 md:py-3 rounded-xl font-semibold hover:bg-(--primary-dark) transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyModal;
