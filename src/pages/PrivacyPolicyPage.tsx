import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { SkipLink } from '@/components/SkipLink';
import { SlideUp } from '@/components/animations';
import { formatDate } from '@/utils/date';

export function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SkipLink targetId="main-content" />
      <SiteHeader />
      <main id="main-content" className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                Privacy Policy
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Last updated: {formatDate(new Date(), 'long')}
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="prose dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Welcome to Akademia Pro. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our school management system.
            </p>
            <h2>1. Information We Collect</h2>
            <p>
              We may collect personal information from you such as your name, email address, role (student, teacher, parent, admin), and other information necessary for functioning of school portal.
            </p>
            <h2>2. How We Use Your Information</h2>
            <p>
              We use information we collect to:
            </p>
            <ul>
              <li>Provide, operate, and maintain our services.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Understand and analyze how you use our services.</li>
              <li>Communicate with you, either directly or through one of our partners.</li>
              <li>For compliance purposes, including enforcing our Terms of Service, or other legal rights.</li>
            </ul>
            <h2>3. Sharing Your Information</h2>
            <p>
              We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
            </p>
            <h2>4. Data Security</h2>
            <p>
              We implement a variety of security measures to maintain safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep information confidential.
            </p>
            <h2>5. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at info@akademia.pro.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
