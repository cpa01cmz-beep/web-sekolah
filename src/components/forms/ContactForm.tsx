import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { useState, useMemo } from 'react';
import { validateName, validateEmail, validateMessage } from '@/utils/validation';

interface ContactFormProps {
  onSubmit?: (data: { name: string; email: string; message: string }) => void;
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const nameError = useMemo(() => validateName(name, showValidationErrors), [name, showValidationErrors]);
  const emailError = useMemo(() => validateEmail(email, showValidationErrors), [email, showValidationErrors]);
  const messageError = useMemo(() => validateMessage(message, showValidationErrors), [message, showValidationErrors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);
    if (nameError || emailError || messageError) {
      return;
    }
    onSubmit?.({ name, email, message });
    setName('');
    setEmail('');
    setMessage('');
    setShowValidationErrors(false);
  };

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
          id="contact-name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          aria-required="true"
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'contact-name-error' : 'contact-name-helper'}
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
          id="contact-email"
          type="email"
          placeholder="john.doe@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-required="true"
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'contact-email-error' : 'contact-email-helper'}
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
          id="contact-message"
          placeholder="Your message..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          aria-required="true"
          aria-invalid={!!messageError}
          aria-describedby={messageError ? 'contact-message-error' : 'contact-message-helper'}
        />
      </FormField>
      <Button type="submit" className="w-full">
        Send Message
      </Button>
    </form>
  );
}
