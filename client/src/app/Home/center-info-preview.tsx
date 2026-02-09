import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  GraduationCap,
  Target,
  Heart,
  UserPlus,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { useAuthRedirect } from "../../lib/utils/auth-redirect";

export function CenterInfoPreview() {
  const { isLoggedIn, role, getRegisterHref } = useAuthRedirect();

  const getCtaConfig = () => {
    if (!isLoggedIn) {
      return {
        label: "Register Now",
        icon: <LogIn className="ml-2 h-4 w-4" />,
        href: getRegisterHref(),
      };
    }
    if (role === "STUDENT") {
      return {
        label: "Register Now",
        icon: <UserPlus className="ml-2 h-4 w-4" />,
        href: getRegisterHref(),
      };
    }
    return {
      label: "Go to Dashboard",
      icon: <LayoutDashboard className="ml-2 h-4 w-4" />,
      href: getRegisterHref(),
    };
  };

  const cta = getCtaConfig();

  return (
    <section className="py-20 lg:py-28 bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 items-center mb-20">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-teal-dark/8 border border-brand-teal/15 px-4 py-2 text-xs font-semibold text-brand-teal-dark tracking-wide uppercase mb-6">
              About Our Center
            </div>

            <h2
              className="text-3xl font-bold text-brand-black sm:text-4xl mb-6 leading-tight"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Where Languages{" "}
              <span className="text-brand-teal-dark">Come to Life</span>
            </h2>

            <p className="text-brand-black/55 leading-relaxed mb-4 text-base">
              Our Language Training Center has been dedicated to providing
              high-quality language education since its establishment. We
              believe that learning a new language opens doors to new cultures,
              opportunities, and perspectives.
            </p>
            <p className="text-brand-black/55 leading-relaxed mb-8 text-base">
              With certified instructors, modern teaching methods, and a
              supportive learning environment, we help students achieve their
              language goals efficiently and enjoyably.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <ValueCard
                icon={<GraduationCap className="h-5 w-5" />}
                title="Our Mission"
                description="Empowering through language education"
                color="teal"
              />
              <ValueCard
                icon={<Target className="h-5 w-5" />}
                title="Our Vision"
                description="Leading language center in the region"
                color="mustard"
              />
              <ValueCard
                icon={<Heart className="h-5 w-5" />}
                title="Our Values"
                description="Excellence, integrity, inclusivity"
                color="brown"
              />
            </div>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="rounded-2xl border border-brand-beige bg-brand-gray p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mustard/5 rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-teal/5 rounded-tr-full" />

              <div className="relative">
                <h3
                  className="text-xl font-bold text-brand-black mb-6"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Contact Us
                </h3>

                <div className="space-y-5">
                  <ContactRow
                    icon={<MapPin className="h-5 w-5 text-brand-teal-dark" />}
                    bg="bg-brand-teal-dark/10"
                    title="Address"
                    value="123 Education Street, Learning City, LC 12345"
                  />
                  <ContactRow
                    icon={<Phone className="h-5 w-5 text-brand-mustard-dark" />}
                    bg="bg-brand-mustard/10"
                    title="Phone"
                    value="+1 (555) 123-4567"
                  />
                  <ContactRow
                    icon={<Mail className="h-5 w-5 text-brand-teal" />}
                    bg="bg-brand-teal/10"
                    title="Email"
                    value="contact@ltc-platform.com"
                  />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-brown/15 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-brand-brown" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-black">
                        Working Hours
                      </p>
                      <p className="text-sm text-brand-black/55 mt-0.5">
                        Sun – Thu: 8:00 AM – 8:00 PM
                      </p>
                      <p className="text-sm text-brand-black/55">
                        Fri – Sat: 9:00 AM – 5:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full mt-8 bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white border-0 rounded-xl h-12 text-base font-semibold"
                >
                  <Link to="/about-us">
                    Learn More About Us
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA Banner ── */}
        <div
          className="rounded-2xl overflow-hidden relative animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="bg-linear-to-r from-brand-teal-dark to-brand-teal p-10 sm:p-14 text-center relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-4 left-10 w-20 h-20 border-2 border-white rounded-full" />
              <div className="absolute bottom-4 right-10 w-32 h-32 border-2 border-white rounded-full" />
              <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-white rounded-full" />
            </div>

            <div className="relative">
              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-4"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Ready to Start Your Language Journey?
              </h2>
              <p className="text-white/75 max-w-lg mx-auto mb-8 text-base">
                Join hundreds of students who have already transformed their
                lives through language learning. Registration is quick and easy.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-brand-mustard hover:bg-brand-mustard-dark text-white border-0 shadow-lg shadow-black/20 px-8 rounded-xl h-13 text-base font-semibold"
                >
                  <Link to={cta.href}>
                    {cta.label}
                    {cta.icon}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/30 text-white hover:bg-white/10 rounded-xl h-13 text-base"
                >
                  <Link to="/about-us">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "teal" | "mustard" | "brown";
}) {
  const colorMap = {
    teal: { bg: "bg-brand-teal-dark/5", icon: "bg-brand-teal-dark/10" },
    mustard: { bg: "bg-brand-mustard/5", icon: "bg-brand-mustard/10" },
    brown: { bg: "bg-brand-brown/5", icon: "bg-brand-brown/10" },
  };
  const c = colorMap[color];
  return (
    <div
      className={`flex flex-col items-center text-center p-5 rounded-xl ${c.bg} transition-all hover:shadow-sm`}
    >
      <div
        className={`w-10 h-10 rounded-lg ${c.icon} flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <h4
        className="text-sm font-semibold text-brand-black mb-1"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {title}
      </h4>
      <p className="text-xs text-brand-black/50">{description}</p>
    </div>
  );
}

function ContactRow({
  icon,
  bg,
  title,
  value,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-brand-black">{title}</p>
        <p className="text-sm text-brand-black/55 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
