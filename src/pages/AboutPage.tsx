import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { SkipLink } from '@/components/SkipLink'
import { SlideUp } from '@/components/animations'
import { Building, Target, Eye } from 'lucide-react'
export function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SkipLink targetId="main-content" />
      <SiteHeader />
      <main id="main-content" className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp delay={0}>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">About Akademia Pro</h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Empowering the next generation through innovative education and technology.
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <SlideUp delay={0}>
              <h2 className="text-3xl font-bold text-foreground">Our History</h2>
              <p className="mt-4 text-muted-foreground">
                Founded in 2024, Akademia Pro was born from a vision to create a seamless,
                integrated digital ecosystem for educational institutions. We saw the need for a
                modern, user-friendly platform that connects students, teachers, parents, and
                administrators, fostering a collaborative and efficient learning environment.
              </p>
              <p className="mt-4 text-muted-foreground">
                Built on cutting-edge, serverless technology from Cloudflare, our platform is
                designed for reliability, speed, and scalability, ensuring that we can grow with the
                schools we serve.
              </p>
            </SlideUp>
            <SlideUp delay={0}>
              <img
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop"
                alt="Team collaborating"
                className="rounded-lg shadow-lg"
                loading="lazy"
              />
            </SlideUp>
          </div>
          <div className="mt-24 grid md:grid-cols-2 gap-12">
            <SlideUp delay={0.2}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground">
                  <Target className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Our Mission</h3>
                  <p className="mt-2 text-muted-foreground">
                    To provide powerful, intuitive, and accessible school management tools that
                    streamline administrative tasks and enhance the educational experience for
                    everyone involved.
                  </p>
                </div>
              </div>
            </SlideUp>
            <SlideUp delay={0.4}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground">
                  <Eye className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Our Vision</h3>
                  <p className="mt-2 text-muted-foreground">
                    To be the leading digital platform for educational institutions, recognized for
                    our commitment to innovation, user-centric design, and the success of our
                    partner schools.
                  </p>
                </div>
              </div>
            </SlideUp>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
