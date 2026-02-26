import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { SkipLink } from '@/components/SkipLink'
import { SlideUp } from '@/components/animations'
import { ContentCard } from '@/components/ContentCard'
import {
  EXTRACURRICULAR_ACTIVITIES,
  EXTRACURRICULAR_PAGE_CONTENT,
} from '@/constants/extracurricular'

export function ProfileExtracurricularPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SkipLink targetId="main-content" />
      <SiteHeader />
      <main id="main-content" className="flex-grow">
        <div className="bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
            <SlideUp>
              <h1 className="text-4xl md:text-5xl font-bold text-primary">
                {EXTRACURRICULAR_PAGE_CONTENT.title}
              </h1>
            </SlideUp>
            <SlideUp delay={0.2}>
              <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                {EXTRACURRICULAR_PAGE_CONTENT.subtitle}
              </p>
            </SlideUp>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EXTRACURRICULAR_ACTIVITIES.map((activity, index) => (
              <SlideUp key={activity.id} delay={index * 0.1}>
                <ContentCard
                  gradient={activity.gradient}
                  title={activity.title}
                  description={activity.description}
                  tags={activity.tags as string[]}
                  badgeColor={activity.badgeColor}
                />
              </SlideUp>
            ))}
          </div>

          <SlideUp>
            <div className="mt-24 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {EXTRACURRICULAR_PAGE_CONTENT.joiningSection.title}
              </h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                {EXTRACURRICULAR_PAGE_CONTENT.joiningSection.description}
              </p>
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {EXTRACURRICULAR_PAGE_CONTENT.joiningSection.ctaText}
              </button>
            </div>
          </SlideUp>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
