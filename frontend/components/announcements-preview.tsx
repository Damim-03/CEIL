import Link from "next/link"
import { Button } from "@/components/ui/button"
import { announcements } from "@/lib/data"
import { Bell, ArrowRight, AlertTriangle } from "lucide-react"

export function AnnouncementsPreview() {
  const latestAnnouncements = announcements.slice(0, 3)

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Latest Announcements</h2>
            <p className="mt-2 text-muted-foreground">Stay updated with the latest news from our center</p>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex bg-transparent">
            <Link href="/announcements">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {latestAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`rounded-xl border p-6 transition-colors hover:bg-muted/50 ${
                announcement.important ? "border-warning bg-warning/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    announcement.important ? "bg-warning/10" : "bg-primary/10"
                  }`}
                >
                  {announcement.important ? (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  ) : (
                    <Bell className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                    {announcement.important && (
                      <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                  <p className="text-xs text-muted-foreground">{announcement.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="outline" className="bg-transparent">
            <Link href="/announcements">
              View All Announcements
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
