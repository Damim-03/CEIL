import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface LanguageCardProps {
  id: string;
  name: string;
  flag: string;
  description: string;
  color: string;
}

export function LanguageCard({
  id,
  name,
  flag,
  description,
  color,
}: LanguageCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg">
      {/* SVG Flag Background */}
      {flag && (
        <div className="pointer-events-none absolute inset-0 opacity-[0.2]">
          <Image
            src={flag}
            alt=""
            fill
            className="object-contain object-center"
            priority={false}
          />
        </div>
      )}

      {/* Top Accent Bar */}
      <div className={`relative z-10 h-2 ${color}`} />

      {/* Content */}
      <div className="relative z-10 p-6">
        <h3 className="mb-2 text-xl font-semibold text-foreground">{name}</h3>

        <p className="mb-6 text-sm text-muted-foreground">{description}</p>

        <Button
          asChild
          variant="outline"
          className="w-full bg-transparent group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <Link href={`/languages/${id}`}>
            View Levels
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
