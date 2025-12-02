import { Link } from "react-router-dom";

function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-(--neutral-500)">Last Updated: November 8, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-(--text)">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-(--neutral-600) leading-relaxed">
              By accessing and using SBorrowHub ("the Service"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to these Terms of Service, please do not use the
              Service.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">2. User Accounts</h2>
            <p className="text-(--neutral-600) leading-relaxed mb-2">
              To use SBorrowHub, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-(--neutral-600) ml-4">
              <li>
                Be a registered student or staff member of the institution
              </li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>
                Be responsible for all activities that occur under your account
              </li>
            </ul>
          </section>

          {/* Borrowing and Lending */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              3. Borrowing and Lending
            </h2>
            <div className="space-y-3 text-(--neutral-600)">
              <p className="leading-relaxed">
                <strong className="text-(--text)">3.1 Item Listings:</strong>{" "}
                Users who lend items are responsible for providing accurate
                descriptions, conditions, and availability of their items.
              </p>
              <p className="leading-relaxed">
                <strong className="text-(--text)">3.2 Borrowing:</strong>{" "}
                Borrowers must return items in the same condition they were
                received, within the agreed-upon timeframe.
              </p>
              <p className="leading-relaxed">
                <strong className="text-(--text)">3.3 Liability:</strong>{" "}
                Borrowers are responsible for any damage, loss, or theft of
                borrowed items during the lending period.
              </p>
              <p className="leading-relaxed">
                <strong className="text-(--text)">3.4 Disputes:</strong>{" "}
                SBorrowHub provides a platform for transactions but is not a
                party to agreements between users. Users are responsible for
                resolving disputes among themselves.
              </p>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              4. Prohibited Activities
            </h2>
            <p className="text-(--neutral-600) leading-relaxed mb-2">
              Users may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-(--neutral-600) ml-4">
              <li>List prohibited, illegal, or hazardous items</li>
              <li>Engage in fraudulent activities or misrepresentation</li>
              <li>Harass, abuse, or harm other users</li>
              <li>
                Attempt to circumvent the platform for direct transactions
              </li>
              <li>
                Use the Service for commercial purposes without permission
              </li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              5. Intellectual Property
            </h2>
            <p className="text-(--neutral-600) leading-relaxed">
              All content, features, and functionality of SBorrowHub, including
              but not limited to text, graphics, logos, and software, are owned
              by SBorrowHub and are protected by copyright, trademark, and other
              intellectual property laws.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Termination</h2>
            <p className="text-(--neutral-600) leading-relaxed">
              We reserve the right to terminate or suspend your account and
              access to the Service at our sole discretion, without notice, for
              conduct that we believe violates these Terms of Service or is
              harmful to other users, us, or third parties, or for any other
              reason.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">
              7. Limitation of Liability
            </h2>
            <p className="text-(--neutral-600) leading-relaxed">
              SBorrowHub is provided "as is" without warranties of any kind. We
              are not liable for any damages arising from the use or inability
              to use the Service, including but not limited to damages for loss
              of items, data, or other intangible losses.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Changes to Terms</h2>
            <p className="text-(--neutral-600) leading-relaxed">
              We reserve the right to modify these Terms of Service at any time.
              We will notify users of any material changes by posting the new
              Terms of Service on this page and updating the "Last Updated"
              date.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Contact Us</h2>
            <p className="text-(--neutral-600) leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us at:{" "}
              <a
                href="mailto:support@sborrowhub.com"
                className="text-(--primary) hover:underline"
              >
                support@sborrowhub.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-(--neutral-200)">
          <p className="text-sm text-(--neutral-500) text-center">
            By using SBorrowHub, you acknowledge that you have read, understood,
            and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
