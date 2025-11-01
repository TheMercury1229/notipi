import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Mail,
  Code,
  BarChart,
  Shield,
  Rocket,
  LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LandingPage() {
  const { user } = useAuthStore((state) => state);
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">NotiPi</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button variant="outline">Sign Up</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Send Notifications Easily with{" "}
            <span className="text-primary">NotiPi</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Powerful Notification-as-a-Service platform for modern applications.
            Send emails, SMS, and in-app notifications with a simple API.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  <LayoutDashboard className="w-5 h-5" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button size="lg" className="gap-2">
                  <Rocket className="w-5 h-5" />
                  Start Free Trial
                </Button>
              </Link>
            )}

            <Button size="lg" variant="outline">
              View Docs
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to send notifications
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Mail}
            title="Email Templates"
            description="Create beautiful, responsive email templates with our intuitive editor. Support for dynamic variables and HTML customization."
          />
          <FeatureCard
            icon={Code}
            title="Simple API"
            description="RESTful API that's easy to integrate. Full documentation and code examples in multiple languages."
          />
          <FeatureCard
            icon={BarChart}
            title="Analytics Dashboard"
            description="Track delivery rates, open rates, and engagement metrics in real-time with detailed analytics."
          />
          <FeatureCard
            icon={Shield}
            title="Secure & Reliable"
            description="Enterprise-grade security with API key authentication and rate limiting to protect your account."
          />
          <FeatureCard
            icon={Zap}
            title="Lightning Fast"
            description="Built on modern infrastructure to deliver notifications in milliseconds with 99.9% uptime."
          />
          <FeatureCard
            icon={Rocket}
            title="Scale Effortlessly"
            description="From startup to enterprise, our platform scales with your needs. Send millions of notifications."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} NotiPi.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
