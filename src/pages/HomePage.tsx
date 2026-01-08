import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicLayout } from '@/components/PublicLayout';
import { CheckCircle, BookOpen, Users, BarChart, MapPin, Phone, Mail } from 'lucide-react';
import { SlideUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { THEME_COLORS } from '@/theme/colors';
const features = [
  {
    icon: <BookOpen className="h-8 w-8 text-white" />,
    title: 'Unified Portal',
    description: 'One platform for students, teachers, parents, and admins.',
  },
  {
    icon: <BarChart className="h-8 w-8 text-white" />,
    title: 'RDM Integration',
    description: 'Seamlessly connect with Rapor Digital Madrasah for grade reporting.',
  },
  {
    icon: <Users className="h-8 w-8 text-white" />,
    title: 'Digital Student Cards',
    description: 'Generate and manage official digital student identification cards.',
  },
];
const values = [
  { title: 'Excellence', description: 'Striving for the highest standards in education and technology.' },
  { title: 'Collaboration', description: 'Fostering a connected community between all school stakeholders.' },
  { title: 'Innovation', description: 'Continuously improving the educational experience with modern tools.' },
];
const contactInfo = [
  { icon: <MapPin className="h-5 w-5" />, text: 'Jl. Raya No. 123, Jakarta, Indonesia' },
  { icon: <Phone className="h-5 w-5" />, text: '(021) 123-4567' },
  { icon: <Mail className="h-5 w-5" />, text: 'info@akademiapro.sch.id' },
];
export function HomePage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section aria-labelledby="hero-heading">
        <div className="relative text-white" style={{ background: `linear-gradient(to bottom right, ${THEME_COLORS.PRIMARY}, ${THEME_COLORS.SECONDARY})` }}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" aria-hidden="true"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative">
            <SlideUp>
              <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold tracking-tight">
                Welcome to Akademia Pro
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-blue-100">
                The all-in-one school management system designed for modern educational era.
              </p>
            </SlideUp>
            <SlideUp delay={0.4}>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg" className="hover:bg-gray-100 transition-transform hover:scale-105" style={{ backgroundColor: 'white', color: THEME_COLORS.PRIMARY }}>
                  <Link to="/login">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10 transition-transform hover:scale-105">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </SlideUp>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section aria-labelledby="features-heading" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-foreground">Why Choose Akademia Pro?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to manage your school, in one place.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <SlideUp key={feature.title} delay={prefersReducedMotion ? 0 : index * 0.1}>
                <Card className="text-center h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                  <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: THEME_COLORS.SECONDARY }}>
                      {feature.icon}
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>
      {/* Values Section */}
      <section aria-labelledby="values-heading" className="py-16 md:py-24" style={{ backgroundColor: THEME_COLORS.BACKGROUND }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 id="values-heading" className="text-3xl md:text-4xl font-bold text-foreground">Our Core Values</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We are committed to empowering educational institutions through technology, guided by our core principles.
            </p>
            <ul className="mt-8 space-y-4">
              {values.map((value) => (
                <li key={value.title} className="flex items-start">
                  <CheckCircle className="h-6 w-6 mr-3 mt-1 flex-shrink-0" style={{ color: THEME_COLORS.SECONDARY }} aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-foreground">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden md:block">
            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" alt="Students collaborating in a classroom" className="rounded-lg shadow-lg" />
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section aria-labelledby="contact-heading" className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="contact-heading" className="text-3xl md:text-4xl font-bold text-foreground">Contact Our School</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get in touch with us for more information about our programs and services.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {contactInfo.map((info, index) => (
              <SlideUp key={info.text} delay={prefersReducedMotion ? 0 : index * 0.1}>
                <div className="flex items-center justify-center gap-3 p-4 bg-card rounded-lg shadow-sm">
                  <span aria-hidden="true">{info.icon}</span>
                  <span className="text-muted-foreground">{info.text}</span>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}