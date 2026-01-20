import { PublicLayout } from '@/components/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { SlideUp, SlideLeft, SlideRight } from '@/components/animations';
import { Phone, Mail, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';

export function ContactPage() {
  const handleSubmit = async (data: { name: string; email: string; message: string }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <PublicLayout>
      <div className="bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <SlideUp>
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Get in Touch
            </h1>
          </SlideUp>
          <SlideUp delay={0.2}>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              We'd love to hear from you. Whether you have a question about features, trials, or anything else, our team is ready to answer all your questions.
            </p>
          </SlideUp>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-16">
          <SlideLeft>
            <section aria-labelledby="contact-info-heading">
              <h2 id="contact-info-heading" className="text-3xl font-bold text-foreground">Contact Information</h2>
              <p className="mt-4 text-muted-foreground">
                Fill up form and our team will get back to you within 24 hours.
              </p>
              <address className="mt-8 space-y-6 not-italic">
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-primary" aria-hidden="true" />
                  <a href="tel:+62211234567" className="text-foreground hover:text-primary transition-colors">(021) 123-4567</a>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
                  <a href="mailto:info@akademia.pro" className="text-foreground hover:text-primary transition-colors">info@akademia.pro</a>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-primary" aria-hidden="true" />
                  <span>Jl. Pendidikan No. 123, Jakarta, Indonesia</span>
                </div>
              </address>
            </section>
          </SlideLeft>
          <SlideRight>
            <Card>
              <CardContent className="p-6">
                <ContactForm onSubmit={handleSubmit} />
              </CardContent>
            </Card>
          </SlideRight>
        </div>
      </div>
    </PublicLayout>
  );
}
