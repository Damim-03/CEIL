import { useState } from "react";
import { Bell, Calendar, AlertCircle, Info } from "lucide-react";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import maintenanceImg from "../../assets/announcement-maintenance.jpg";
import spanishImg from "../../assets/announcement-spanish.jpg";
import englishImg from "../../assets/announcement-english.jpg";

type AnnouncementType = "GENERAL" | "URGENT" | "EVENT";

const ANNOUNCEMENT_TYPES: Record<
  AnnouncementType,
  {
    label: string;
    icon: typeof Info;
    colorClass: string;
    badgeVariant: "default" | "destructive" | "secondary" | "outline";
  }
> = {
  GENERAL: {
    label: "General",
    icon: Info,
    colorClass: "bg-info",
    badgeVariant: "secondary",
  },
  URGENT: {
    label: "Urgent",
    icon: AlertCircle,
    colorClass: "bg-destructive",
    badgeVariant: "destructive",
  },
  EVENT: {
    label: "Event",
    icon: Calendar,
    colorClass: "bg-success",
    badgeVariant: "default",
  },
};

interface Announcement {
  id: number;
  type: AnnouncementType;
  title: string;
  content: string;
  date: string;
  author: string;
  image: string;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    type: "URGENT",
    title: "System Maintenance Scheduled",
    content:
      "Our platform will undergo scheduled maintenance on January 25th from 2:00 AM to 6:00 AM UTC. During this time, some services may be temporarily unavailable. We apologize for any inconvenience and appreciate your patience.",
    date: "2026-01-22",
    author: "Admin Team",
    image: maintenanceImg,
  },
  {
    id: 2,
    type: "EVENT",
    title: "Free Spanish Conversation Workshop",
    content:
      "Join us for a free Spanish conversation workshop on January 28th at 5:00 PM. This interactive session is perfect for intermediate learners looking to practice their speaking skills in a friendly environment.",
    date: "2026-01-21",
    author: "Spanish Department",
    image: spanishImg,
  },
  {
    id: 3,
    type: "GENERAL",
    title: "New Course Materials Available",
    content:
      "We've added new interactive materials to our English B2 course. These include video lessons, practice exercises, and downloadable resources to enhance your learning experience.",
    date: "2026-01-20",
    author: "English Department",
    image: englishImg,
  },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AnnouncementsPage() {
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedAnnouncement(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Bell className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Announcements
            </h1>
          </div>

          <p className="mx-auto text-lg text-muted-foreground max-w-2xl">
            Stay updated with the latest news, events, and important
            information.
          </p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 mx-auto max-w-7xl px-4 py-12 w-full">
        <div className="space-y-6">
          {ANNOUNCEMENTS.map((announcement) => {
            const config = ANNOUNCEMENT_TYPES[announcement.type];
            const Icon = config.icon;

            return (
              <Card
                key={announcement.id}
                onClick={() => openModal(announcement)}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-64 h-48 md:h-auto shrink-0">
                      <img
                        src={announcement.image}
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex gap-4">
                        <div
                          className={`${config.colorClass} p-3 rounded-lg shrink-0 h-fit`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Badge variant={config.badgeVariant} className="mb-2">
                            {config.label}
                          </Badge>
                          <h2 className="text-xl font-semibold mb-2 text-foreground">
                            {announcement.title}
                          </h2>
                          <p className="text-muted-foreground line-clamp-2">
                            {announcement.content}
                          </p>

                          <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(announcement.date)} •{" "}
                            {announcement.author}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden text-white">
          {selectedAnnouncement && (
            <>
              {/* Modal Image */}
              <div className="w-full h-48 md:h-64">
                <img
                  src={selectedAnnouncement.image}
                  alt={selectedAnnouncement.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className={`${ANNOUNCEMENT_TYPES[selectedAnnouncement.type].colorClass} p-3 rounded-lg shrink-0`}
                    >
                      {(() => {
                        const Icon =
                          ANNOUNCEMENT_TYPES[selectedAnnouncement.type].icon;
                        return <Icon className="h-6 w-6 text-white" />;
                      })()}
                    </div>
                    <div>
                      <Badge
                        variant={
                          ANNOUNCEMENT_TYPES[selectedAnnouncement.type]
                            .badgeVariant
                        }
                        className="mb-2"
                      >
                        {ANNOUNCEMENT_TYPES[selectedAnnouncement.type].label}
                      </Badge>
                      <DialogTitle className="text-2xl">
                        {selectedAnnouncement.title}
                      </DialogTitle>
                    </div>
                  </div>
                </DialogHeader>

                <p className="text-muted-foreground leading-relaxed mt-4">
                  {selectedAnnouncement.content}
                </p>

                <div className="flex justify-between text-sm text-muted-foreground mt-6 pt-4 border-t">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedAnnouncement.date)}
                  </span>
                  <span>Posted by {selectedAnnouncement.author}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
