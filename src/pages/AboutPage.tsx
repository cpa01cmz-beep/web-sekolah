import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { motion } from 'framer-motion';
import { Building, Target, Eye } from 'lucide-react';
export function AboutPage() {
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
              About Akademia Pro
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground"
            >
              Empowering the next generation through innovative education and technology.
            </motion.p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground">Our History</h2>
              <p className="mt-4 text-muted-foreground">
                Founded in 2024, Akademia Pro was born from a vision to create a seamless, integrated digital ecosystem for educational institutions. We saw the need for a modern, user-friendly platform that connects students, teachers, parents, and administrators, fostering a collaborative and efficient learning environment.
              </p>
              <p className="mt-4 text-muted-foreground">
                Built on cutting-edge, serverless technology from Cloudflare, our platform is designed for reliability, speed, and scalability, ensuring that we can grow with the schools we serve.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" alt="Team collaborating" className="rounded-lg shadow-lg" />
            </motion.div>
          </div>
          <div className="mt-24 grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-start gap-4"
            >
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Our Mission</h3>
                <p className="mt-2 text-muted-foreground">To provide powerful, intuitive, and accessible school management tools that streamline administrative tasks and enhance the educational experience for everyone involved.</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-start gap-4"
            >
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Our Vision</h3>
                <p className="mt-2 text-muted-foreground">To be the leading digital platform for educational institutions, recognized for our commitment to innovation, user-centric design, and the success of our partner schools.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}