import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Phone, Mail, ArrowRight } from "lucide-react"

export function CenterInfoPreview() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">About Our Center</h2>
          <p className="mt-2 text-muted-foreground">Professional language training in the heart of Algeria</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Location</h3>
            <p className="text-sm text-muted-foreground">University Campus, Main Building, Algiers</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Working Hours</h3>
            <p className="text-sm text-muted-foreground">Sun-Thu: 8:00 - 20:00</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Phone</h3>
            <p className="text-sm text-muted-foreground">+213 21 XX XX XX</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Email</h3>
            <p className="text-sm text-muted-foreground">contact@ltc-platform.dz</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="bg-transparent">
            <Link href="/center-info">
              Learn More About Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
