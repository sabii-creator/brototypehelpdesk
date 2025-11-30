import { Button } from "@/components/ui/button";
import { Phone, Menu, ChevronDown, Mail, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import brototypeLogo from "@/assets/brototype-logo.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
const Index = () => {
  const navigate = useNavigate();
  const { t, toggleLanguage } = useLanguage();
  
  return <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border border-border/50 rounded-full mx-4 mt-4 bg-card/80 backdrop-blur-sm animate-fade-in-up">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={brototypeLogo} alt="Brototype Logo" className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <h1 className="text-base font-bold tracking-tight">{t('headerTitle')}</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {t('headerSubtitle')}
                </p>
              </div>
            </div>

            {/* Center Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Button variant="ghost" className="bg-gold/10 text-gold hover:bg-gold/20 rounded-full gap-2 hover-lift">
                <Phone className="w-4 h-4" />
                {t('phoneNumber')}
              </Button>
              
              <button 
                onClick={toggleLanguage}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {t('language')}
                <ChevronDown className="w-3 h-3" />
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button onClick={() => window.location.href = "https://www.brototype.com/brocamp/"} className="hidden md:block bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 hover-lift">
                {t('aboutBrocamp')}
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent className="bg-background/95 backdrop-blur-sm">
                  <SheetHeader className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="w-6 h-6 text-primary" />
                      <div>
                        <SheetTitle className="text-xl">{t('menuTitle')}</SheetTitle>
                        <p className="text-sm text-muted-foreground">{t('menuSubtitle')}</p>
                      </div>
                    </div>
                  </SheetHeader>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-semibold mb-4 text-foreground">{t('forAdmission')}</h3>
                      <div className="space-y-3">
                        <a href="tel:+917034395811" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                          <Phone className="w-4 h-4" />
                          <span>+91 7034 395 811</span>
                        </a>
                        <a href="mailto:admissions@brototype.com" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                          <Mail className="w-4 h-4" />
                          <span>admissions@brototype.com</span>
                        </a>
                      </div>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="text-sm font-semibold mb-4 text-foreground">{t('forJobOpportunities')}</h3>
                      <div className="space-y-3">
                        <a href="tel:+917594846113" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                          <Phone className="w-4 h-4" />
                          <span>+91 7594 846 113</span>
                        </a>
                        <a href="mailto:hr@brototype.com" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                          <Mail className="w-4 h-4" />
                          <span>hr@brototype.com</span>
                        </a>
                      </div>
                    </div>

                    <div className="border-t border-border pt-6">
                      <p className="text-xs text-muted-foreground">{t('companyName')}</p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        {/* Stats Badge */}
        <div className="mb-12">
          
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-bold leading-tight animate-fade-in-up">
              {t('heroTitle')} <br />
              <span className="relative">
                {t('heroTitleBold')}
                <div className="absolute -bottom-2 left-0 w-32 h-1 bg-primary animate-slide-in-left"></div>
              </span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl animate-fade-in-up delay-100">
              {t('heroDescription')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 animate-fade-in-up delay-200">
              <Button size="lg" onClick={() => navigate("/auth/student")} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 hover-lift animate-glow-pulse">
                {t('studentPortal')}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth/admin")} className="border-2 border-border hover:bg-muted rounded-full px-8 hover-lift">
                {t('adminAccess')}
              </Button>
            </div>

            {/* What's Your Background Section */}
            <div className="pt-8">
              
            </div>
          </div>

          {/* Right Column - Award Card */}
          <div className="relative animate-fade-in-up delay-300">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-900/40 to-red-950/40 border border-red-900/30 p-8 backdrop-blur-sm hover-lift animate-float">
              <div className="text-center space-y-4">
                
                <h3 className="text-4xl lg:text-5xl font-bold text-gold leading-tight">
                  {t('awardTitle')}
                </h3>
                <div className="grid grid-cols-3 gap-4 pt-6">
                  <div className="space-y-1 animate-bounce-in delay-100">
                    <p className="text-xs text-muted-foreground">{t('minister')}</p>
                    <p className="text-xs text-muted-foreground">{t('ministerOf')}</p>
                    <p className="text-sm font-semibold">{t('ministerName')}</p>
                  </div>
                  <div className="space-y-1 animate-bounce-in delay-200">
                    <p className="text-xs text-muted-foreground">{t('cmo')}</p>
                    <p className="text-sm font-semibold">{t('cmoName')}</p>
                  </div>
                  <div className="space-y-1 animate-bounce-in delay-300">
                    <p className="text-xs text-muted-foreground">{t('ceo')}</p>
                    <p className="text-sm font-semibold">{t('ceoName')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Platform Section */}
      <section className="container mx-auto px-4 py-16 border-t border-border/50">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in-up">
            <h2 className="text-4xl font-bold">{t('aboutPlatformTitle')}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t('aboutPlatformDesc')}
            </p>
          </div>

          {/* How It Works */}
          <div className="space-y-6 animate-slide-in-left delay-100">
            <h3 className="text-2xl font-bold">{t('howItWorks')}</h3>
            <div className="space-y-4">
              <div className="hover-lift p-4 rounded-lg transition-all hover:bg-card/30">
                <h4 className="font-semibold text-primary mb-2">{t('submitComplaint')}</h4>
                <p className="text-muted-foreground">{t('submitComplaintDesc')}</p>
              </div>
              <div className="hover-lift p-4 rounded-lg transition-all hover:bg-card/30">
                <h4 className="font-semibold text-primary mb-2">{t('tracking')}</h4>
                <p className="text-muted-foreground">{t('trackingDesc')}</p>
              </div>
              <div className="hover-lift p-4 rounded-lg transition-all hover:bg-card/30">
                <h4 className="font-semibold text-primary mb-2">{t('staffResponse')}</h4>
                <p className="text-muted-foreground">{t('staffResponseDesc')}</p>
              </div>
            </div>
          </div>

          {/* Who Can Use It */}
          <div className="space-y-6 animate-slide-in-left delay-200">
            <h3 className="text-2xl font-bold">{t('whoCanUse')}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="hover-lift p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
                <h4 className="font-semibold text-primary mb-2">{t('students')}</h4>
                <p className="text-muted-foreground">{t('studentsDesc')}</p>
              </div>
              <div className="hover-lift p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
                <h4 className="font-semibold text-primary mb-2">{t('staff')}</h4>
                <p className="text-muted-foreground">{t('staffDesc')}</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-6 animate-slide-in-bottom delay-300">
            <h3 className="text-2xl font-bold">{t('keyFeatures')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 hover-lift p-3 rounded-lg transition-all hover:bg-card/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-glow-pulse"></div>
                <p className="text-muted-foreground">{t('feature1')}</p>
              </li>
              <li className="flex items-start gap-3 hover-lift p-3 rounded-lg transition-all hover:bg-card/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-glow-pulse"></div>
                <p className="text-muted-foreground">{t('feature2')}</p>
              </li>
              <li className="flex items-start gap-3 hover-lift p-3 rounded-lg transition-all hover:bg-card/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-glow-pulse"></div>
                <p className="text-muted-foreground">{t('feature3')}</p>
              </li>
              <li className="flex items-start gap-3 hover-lift p-3 rounded-lg transition-all hover:bg-card/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-glow-pulse"></div>
                <p className="text-muted-foreground">{t('feature4')}</p>
              </li>
              <li className="flex items-start gap-3 hover-lift p-3 rounded-lg transition-all hover:bg-card/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-glow-pulse"></div>
                <p className="text-muted-foreground">{t('feature5')}</p>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4 p-6 bg-card/50 rounded-lg border border-border hover-lift animate-fade-in-up delay-400">
            <h3 className="text-2xl font-bold">{t('contactSupport')}</h3>
            <p className="text-muted-foreground">{t('contactSupportDesc')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{t('footerCopyright')}</p>
          <p className="mt-2">{t('footerBuilt')}</p>
        </div>
      </footer>
    </div>;
};
export default Index;