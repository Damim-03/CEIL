import { Award, Heart, Target, Users } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";

const VALUES = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To provide accessible, high-quality language education that empowers learners to connect with the world.",
  },
  {
    icon: Heart,
    title: "Our Values",
    description:
      "We believe in fostering a supportive community where every learner can thrive and achieve their goals.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We are committed to delivering exceptional learning experiences through innovative methods and dedicated instructors.",
  },
];

const TEAM = [
  { name: "Sarah Johnson", role: "Founder & CEO", initials: "SJ" },
  { name: "Michael Chen", role: "Head of Education", initials: "MC" },
  { name: "Elena Rodriguez", role: "Spanish Department Lead", initials: "ER" },
  { name: "David Williams", role: "English Department Lead", initials: "DW" },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">About Us</h1>
          </div>
          <p className="mx-auto text-lg text-muted-foreground max-w-2xl">
            Learn more about our story, mission, and the passionate team behind
            our language learning platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mx-auto max-w-7xl px-4 py-12 w-full">
        {/* Story */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Our Story
          </h2>
          <div className="prose prose-lg text-muted-foreground max-w-none">
            <p className="mb-4">
              Founded in 2020, our platform was born from a simple idea:
              language learning should be accessible, engaging, and effective for
              everyone. What started as a small online community has grown into a
              thriving educational platform serving thousands of learners
              worldwide.
            </p>
            <p>
              We combine cutting-edge technology with proven teaching
              methodologies to create an immersive learning experience. Our team
              of experienced educators and language enthusiasts work tirelessly
              to develop courses that make learning a new language both enjoyable
              and rewarding.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            What Drives Us
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <Card
                  key={value.title}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="bg-primary p-3 rounded-lg w-fit mb-4">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Meet Our Team
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <Card
                key={member.name}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {member.initials}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;