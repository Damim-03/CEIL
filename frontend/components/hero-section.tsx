import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Award } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-primary/5 to-background py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Language Training Center Platform
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground lg:text-xl">
              Start your language learning journey today. Register online for professional language courses in English,
              French, German, Spanish, Italian, and Arabic.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#languages">View Languages</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-border pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground lg:text-3xl">6+</div>
                <div className="text-sm text-muted-foreground">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground lg:text-3xl">4</div>
                <div className="text-sm text-muted-foreground">Skill Levels</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground lg:text-3xl">500+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Structured Curriculum</h3>
              <p className="text-sm text-muted-foreground">
                Follow internationally recognized CEFR levels from A1 to B2 with comprehensive learning materials.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Small Group Classes</h3>
              <p className="text-sm text-muted-foreground">
                Learn in intimate groups for maximum interaction and personalized attention from instructors.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Award className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Certified Instructors</h3>
              <p className="text-sm text-muted-foreground">
                Learn from native speakers and certified language professionals with years of experience.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <svg className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Flexible Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Choose from morning, afternoon, evening, or weekend classes that fit your lifestyle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
