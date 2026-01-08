import { PublicLayout } from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { SlideUp, SlideLeft, SlideRight } from '@/components/animations';
import { Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { FormField } from '@/components/ui/form-field';
import { useState } from 'react';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const getNameError = () => {
    if (name === '') return showValidationErrors ? 'Name is required' : undefined;
    if (name.length < 2) return 'Name must be at least 2 characters';
    return undefined;
  };

  const getEmailError = () => {
    if (email === '') return showValidationErrors ? 'Email is required' : undefined;
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const getMessageError = () => {
    if (message === '') return showValidationErrors ? 'Message is required' : undefined;
    if (message.length < 10) return 'Message must be at least 10 characters';
    return undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);
    if (getNameError() || getEmailError() || getMessageError()) {
      return;
    }
    toast.success("Thank you for your message! We'll get back to you soon.");
    setName('');
    setEmail('');
    setMessage('');
    setShowValidationErrors(false);
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
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <FormField
                    id="contact-name"
                    label="Full Name"
                    error={getNameError()}
                    helperText="Enter your full name"
                    required
                  >
                    <Input
                      id="contact-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      aria-required="true"
                      aria-invalid={!!getNameError()}
                      aria-describedby={getNameError() ? 'contact-name-error' : 'contact-name-helper'}
                    />
                  </FormField>
                  <FormField
                    id="contact-email"
                    label="Email"
                    error={getEmailError()}
                    helperText="We'll never share your email with anyone else"
                    required
                  >
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      aria-required="true"
                      aria-invalid={!!getEmailError()}
                      aria-describedby={getEmailError() ? 'contact-email-error' : 'contact-email-helper'}
                    />
                  </FormField>
                  <FormField
                    id="contact-message"
                    label="Message"
                    error={getMessageError()}
                    helperText="How can we help you? Provide as much detail as possible"
                    required
                  >
                    <Textarea
                      id="contact-message"
                      placeholder="Your message..."
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      aria-required="true"
                      aria-invalid={!!getMessageError()}
                      aria-describedby={getMessageError() ? 'contact-message-error' : 'contact-message-helper'}
                    />
                  </FormField>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </SlideRight>
        </div>
      </div>
    </PublicLayout>
  );
}
