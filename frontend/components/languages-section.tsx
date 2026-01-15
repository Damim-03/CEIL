import { languages } from "@/lib/data"
import { LanguageCard } from "./language-card"

export function LanguagesSection() {
  return (
    <section id="languages" className="bg-muted/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Choose Your Language</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            We offer comprehensive courses in six major world languages, each designed to take you from beginner to
            proficient.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {languages.map((language) => (
            <LanguageCard key={language.id} {...language} />
          ))}
        </div>
      </div>
    </section>
  )
}
