import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  LayoutDashboard,
  ListTodo,
  Trello,
  Calendar,
  BarChart3,
  Tag,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  CheckCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/hooks/use-auth";

const features = [
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: "Smart Dashboard",
    description:
      "Get a bird's-eye view of your productivity with live charts, completion rates, and daily progress summaries.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: <ListTodo className="w-6 h-6" />,
    title: "Task Management",
    description:
      "Create, prioritize, and organize tasks with custom categories, due dates, and priority levels.",
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: <Trello className="w-6 h-6" />,
    title: "Kanban Board",
    description:
      "Visualize your workflow with a drag-and-drop Kanban board. Move tasks through stages effortlessly.",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Daily Planner",
    description:
      "Block time for deep work with an interactive daily planner. Schedule tasks and stay in flow.",
    color: "bg-green-500/10 text-green-500",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Statistics & Analytics",
    description:
      "Track your productivity trends, completion rates, and time spent across categories over time.",
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    icon: <Tag className="w-6 h-6" />,
    title: "Categories",
    description:
      "Organize tasks into color-coded categories for cleaner filtering and better focus.",
    color: "bg-teal-500/10 text-teal-500",
  },
];

const highlights = [
  { icon: <Zap className="w-5 h-5" />, text: "Fast & responsive" },
  { icon: <Shield className="w-5 h-5" />, text: "Secure accounts" },
  { icon: <Clock className="w-5 h-5" />, text: "Time blocking" },
  { icon: <CheckCheck className="w-5 h-5" />, text: "Progress tracking" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary" data-testid="link-logo">
            <CheckCircle className="w-6 h-6" />
            TaskMaster
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard" data-testid="link-go-to-app">
                <Button size="sm">
                  Go to App <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth" data-testid="link-login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/auth?tab=register" data-testid="link-signup">
                  <Button size="sm">Get started free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
        >
          <Badge variant="secondary" className="mb-6 px-3 py-1 text-sm font-medium" data-testid="badge-tagline">
            Your all-in-one productivity workspace
          </Badge>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          data-testid="text-hero-headline"
        >
          Get more done, <br className="hidden sm:block" />
          <span className="text-primary">every single day.</span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          data-testid="text-hero-subheadline"
        >
          TaskMaster combines task management, Kanban boards, time blocking, and
          productivity analytics into one beautifully simple app.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
        >
          {user ? (
            <Link href="/dashboard" data-testid="link-hero-cta-app">
              <Button size="lg" className="px-8">
                Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth?tab=register" data-testid="link-hero-cta-register">
                <Button size="lg" className="px-8">
                  Start for free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth" data-testid="link-hero-cta-login">
                <Button size="lg" variant="outline" className="px-8">
                  Log in
                </Button>
              </Link>
            </>
          )}
        </motion.div>

        {/* Highlights strip */}
        <motion.div
          className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
        >
          {highlights.map((h, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-muted-foreground"
              data-testid={`text-highlight-${i}`}
            >
              <span className="text-primary">{h.icon}</span>
              {h.text}
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30" id="features">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-features-heading">
              Everything you need to stay on track
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Six powerful tools unified in one workspace to help you plan,
              execute, and reflect.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                data-testid={`card-feature-${i}`}
              >
                <div className={`inline-flex rounded-lg p-2.5 mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center bg-primary/5 border border-primary/20 rounded-2xl p-10 sm:p-14"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-cta-heading">
            Ready to take control of your day?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join TaskMaster and turn your to-do list into real results.
          </p>
          {user ? (
            <Link href="/dashboard" data-testid="link-cta-app">
              <Button size="lg" className="px-10">
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/auth?tab=register" data-testid="link-cta-register">
              <Button size="lg" className="px-10">
                Create your free account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <CheckCircle className="w-4 h-4 text-primary" />
            TaskMaster
          </div>
          <p data-testid="text-footer-copy">
            &copy; {new Date().getFullYear()} TaskMaster. Built for focused people.
          </p>
        </div>
      </footer>
    </div>
  );
}
