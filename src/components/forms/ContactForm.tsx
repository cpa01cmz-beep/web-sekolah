import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { useState } from 'react';

interface ContactFormProps {
  onSubmit?: (data: { name: string; email: string; message: string }) => void;
}

export function ContactForm({ onSubmit }: ContactFormProps) {
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
  );
}
