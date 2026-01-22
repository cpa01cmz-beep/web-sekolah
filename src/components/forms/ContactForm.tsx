import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { FormSuccess } from '@/components/ui/form-success';
import { useState, useMemo } from 'react';
import { validateName, validateEmail, validateMessage } from '@/utils/validation';
import { logger } from '@/lib/logger';

interface ContactFormProps {
  onSubmit?: (data: { name: string; email: string; message: string }) => Promise<void> | void;
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const nameError = useMemo(() => validateName(name, showValidationErrors), [name, showValidationErrors]);
  const emailError = useMemo(() => validateEmail(email, showValidationErrors), [email, showValidationErrors]);
  const messageError = useMemo(() => validateMessage(message, showValidationErrors), [message, showValidationErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);
    if (nameError || emailError || messageError) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit?.({ name, email, message });
      setIsSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setShowValidationErrors(false);
    } catch (error) {
      logger.error('Contact form submission failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setShowValidationErrors(false);
  };

  if (isSuccess) {
    return (
      <FormSuccess
        title="Message Sent Successfully!"
        description="Thank you for reaching out. We'll get back to you as soon as possible."
        action={{
          label: "Send Another Message",
          onClick: handleReset,
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <FormField
        id="contact-name"
        label="Full Name"
          error={nameError}
        helperText="Enter your full name"
        required
      >
        <Input
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        />
      </FormField>
      <FormField
        id="contact-email"
        label="Email"
          error={emailError}
        helperText="We'll never share your email with anyone else"
        required
      >
        <Input
          type="email"
          placeholder="john.doe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        />
      </FormField>
      <FormField
        id="contact-message"
        label="Message"
        error={messageError}
        helperText="How can we help you? Provide as much detail as possible"
        required
      >
        <Textarea
          placeholder="Your message..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
