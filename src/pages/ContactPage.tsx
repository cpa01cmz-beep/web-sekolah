import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
export function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for your message! We'll get back to you soon.");
    (e.target as HTMLFormElement).reset();
  };
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-primary"
            >
              Get in Touch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground"
            >
              We'd love to hear from you. Whether you have a question about features, trials, or anything else, our team is ready to answer all your questions.
            </motion.p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground">Contact Information</h2>
              <p className="mt-4 text-muted-foreground">
                Fill up the form and our team will get back to you within 24 hours.
              </p>
              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-primary" />
                  <span>(021) 123-4567</span>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <span>info@akademia.pro</span>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="h-6 w-6 text-primary" />
                  <span>Jl. Pendidikan No. 123, Jakarta, Indonesia</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john.doe@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Your message..." rows={5} required />
                    </div>
                    <Button type="submit" className="w-full">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}