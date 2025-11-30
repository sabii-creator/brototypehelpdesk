import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import brototypeLogo from "@/assets/brototype-logo.png";

const Brocamp = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <img
                src={brototypeLogo}
                alt="Brototype Logo"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-base font-bold tracking-tight">BROCAMP</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  by Brototype
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Video/Image Placeholder */}
          <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden border border-border">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-8 border-l-primary border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
                </div>
                <p className="text-muted-foreground">What is BROCAMP?</p>
              </div>
            </div>
          </div>

          {/* CTA Content */}
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Get a High Paying Job or<br />
              <span className="text-primary">Get 100% Money Back.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              From Zero to a High-Paid Software Engineer in Just 12 Months.
            </p>
            <div className="space-y-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
              >
                Apply Now
              </Button>
              <p className="text-sm text-muted-foreground">
                *Terms and Conditions Apply
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12">Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-4">Win like an army</h4>
              <p className="text-muted-foreground">
                We work as a team because we get paid only when you get paid.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-4">
                You are the Student and the Teacher
              </h4>
              <p className="text-muted-foreground">
                "We have learnt from others. You will learn from us. And someone
                else will learn from you"
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-4">No one size fit all classes</h4>
              <p className="text-muted-foreground">
                Freely explore the different areas of programming. Find what you're
                passionate about. And get after it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-12">
            How Brocamp Works
          </h3>
          <div className="aspect-video bg-muted rounded-2xl border border-border flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-8 border-l-primary border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
              </div>
              <p className="text-muted-foreground">How Brocamp Works Video</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Brototype. All rights reserved.</p>
          <p className="mt-2">Built with care for the Brototype community</p>
        </div>
      </footer>
    </div>
  );
};

export default Brocamp;
