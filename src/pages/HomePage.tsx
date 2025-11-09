import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { CheckCircle, BookOpen, Users, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
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
export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <SiteHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0D47A1] to-[#00ACC1] text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold tracking-tight"
            >
              Welcome to Akademia Pro
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-blue-100"
            >
              The all-in-one school management system designed for the modern educational era.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex justify-center gap-4"
            >
              <Button asChild size="lg" className="bg-white text-[#0D47A1] hover:bg-gray-100 transition-transform hover:scale-105">
                <Link to="/login">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10 transition-transform hover:scale-105">
                <Link to="/about">Learn More</Link>
              </Button>
            </motion.div>
          </div>
        </section>
        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Why Choose Akademia Pro?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to manage your school, in one place.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="text-center h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    <CardHeader>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00ACC1]">
                        {feature.icon}
                      </div>
                      <CardTitle className="mt-4">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        {/* Values Section */}
        <section className="py-16 md:py-24 bg-[#F5F7FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Core Values</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We are committed to empowering educational institutions through technology, guided by our core principles.
              </p>
              <ul className="mt-8 space-y-4">
                {values.map((value) => (
                  <li key={value.title} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-[#00ACC1] mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden md:block">
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" alt="Students collaborating" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}