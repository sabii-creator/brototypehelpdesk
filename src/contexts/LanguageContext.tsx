import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ml';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    headerTitle: 'BROTOTYPE',
    headerSubtitle: 'Brother you never had',
    phoneNumber: '+91 7034 395 811',
    aboutBrocamp: 'About Brocamp',
    heroTitle: 'Want to Raise a Complaint as a',
    heroTitleBold: 'Brototype Student?',
    heroDescription: 'If you encounter any issue during your course, you can submit a complaint. The staff will review your submission and provide a resolution based on the details you provide.',
    studentPortal: 'Student Portal',
    adminAccess: 'Admin Access',
    awardTitle: 'NO.1 IT TRAINING INSTITUTE IN KERALA',
    minister: 'MINISTER',
    ministerOf: 'OF LAW OF KERALA',
    ministerName: 'P. RAJEEV',
    cmo: 'CMO & Co-Founder',
    cmoName: 'FAZAL FAKRUDEEN',
    ceo: 'CEO & Founder',
    ceoName: 'NIKHIL KILAVAYIL',
    footerCopyright: '© 2025 Brototype. All rights reserved.',
    footerBuilt: 'Built with care for the Brototype community',
    menuTitle: 'Reach out to us',
    menuSubtitle: 'Build your career with us',
    forAdmission: 'For Admission',
    forJobOpportunities: 'For Job Opportunities',
    companyName: 'Packspeer Academy Pvt Ltd',
    language: 'English',
    aboutPlatformTitle: 'About This Platform',
    aboutPlatformDesc: 'This portal empowers Brototype students to raise complaints or report issues directly to the staff. The goal is to make the resolution process transparent, efficient, and supportive throughout your learning journey.',
    howItWorks: 'How It Works',
    submitComplaint: 'Submit a Complaint:',
    submitComplaintDesc: 'Log in to your account and fill out a detailed complaint form. Attach files or evidence if needed and specify the department or staff involved.',
    tracking: 'Tracking:',
    trackingDesc: 'Monitor your complaint\'s status in real-time: Open, In Progress, Resolved, or Closed.',
    staffResponse: 'Staff Response:',
    staffResponseDesc: 'Staff members review each submission, provide status updates, and post resolutions or comments for clarification.',
    whoCanUse: 'Who Can Use It',
    students: 'Students:',
    studentsDesc: 'All registered Brototype students can submit, view, and track complaints.',
    staff: 'Staff:',
    staffDesc: 'Responsible for managing, assigning, and resolving student complaints.',
    keyFeatures: 'Key Features',
    feature1: 'Simple & secure complaint submission',
    feature2: 'Status notifications for every update',
    feature3: 'Option to submit anonymously',
    feature4: 'Staff dashboard for managing all cases',
    feature5: 'Transparent, auditable history of every action',
    contactSupport: 'Contact & Support',
    contactSupportDesc: 'For any questions or help using the platform, email: support@brototype.com',
  },
  ml: {
    headerTitle: 'ബ്രോടോടൈപ്പ്',
    headerSubtitle: 'നിങ്ങൾക്കില്ലാത്ത സഹോദരൻ',
    phoneNumber: '+91 7034 395 811',
    aboutBrocamp: 'ബ്രോകാമ്പിനെക്കുറിച്ച്',
    heroTitle: 'ഒരു പരാതി ഉന്നയിക്കണോ',
    heroTitleBold: 'ബ്രോടോടൈപ്പ് വിദ്യാർത്ഥി?',
    heroDescription: 'നിങ്ങളുടെ കോഴ്‌സ് സമയത്ത് എന്തെങ്കിലും പ്രശ്‌നം നേരിട്ടാൽ, നിങ്ങൾക്ക് ഒരു പരാതി സമർപ്പിക്കാം. നിങ്ങൾ നൽകുന്ന വിശദാംശങ്ങളുടെ അടിസ്ഥാനത്തിൽ സ്റ്റാഫ് നിങ്ങളുടെ സമർപ്പണം അവലോകനം ചെയ്യുകയും പരിഹാരം നൽകുകയും ചെയ്യും.',
    studentPortal: 'വിദ്യാർത്ഥി പോർട്ടൽ',
    adminAccess: 'അഡ്മിൻ ആക്‌സസ്',
    awardTitle: 'കേരളത്തിലെ ഒന്നാം നമ്പർ ഐടി പരിശീലന സ്ഥാപനം',
    minister: 'മന്ത്രി',
    ministerOf: 'കേരള നിയമവകുപ്പ്',
    ministerName: 'പി. രജീവ്',
    cmo: 'സിഎംഒ & കോ-ഫൗണ്ടർ',
    cmoName: 'ഫസൽ ഫഖ്റുദീൻ',
    ceo: 'സിഇഒ & ഫൗണ്ടർ',
    ceoName: 'നിഖിൽ കിലാവയിൽ',
    footerCopyright: '© 2025 ബ്രോടോടൈപ്പ്. എല്ലാ അവകാശങ്ങളും സംരക്ഷിച്ചിരിക്കുന്നു.',
    footerBuilt: 'ബ്രോടോടൈപ്പ് കമ്മ്യൂണിറ്റിക്കായി ശ്രദ്ധയോടെ നിർമ്മിച്ചത്',
    menuTitle: 'ഞങ്ങളെ ബന്ധപ്പെടുക',
    menuSubtitle: 'ഞങ്ങളോടൊപ്പം നിങ്ങളുടെ കരിയർ വളർത്തുക',
    forAdmission: 'പ്രവേശനത്തിനായി',
    forJobOpportunities: 'ജോലി അവസരങ്ങൾക്കായി',
    companyName: 'പാക്സ്പീർ അക്കാദമി പ്രൈ. ലിമിറ്റഡ്',
    language: 'മലയാളം',
    aboutPlatformTitle: 'ഈ പ്ലാറ്റ്ഫോമിനെക്കുറിച്ച്',
    aboutPlatformDesc: 'ബ്രോടോടൈപ്പ് വിദ്യാർത്ഥികളെ പരാതികൾ ഉന്നയിക്കാനോ പ്രശ്‌നങ്ങൾ സ്റ്റാഫിന് നേരിട്ട് റിപ്പോർട്ട് ചെയ്യാനോ ഈ പോർട്ടൽ ശാക്തീകരിക്കുന്നു. നിങ്ങളുടെ പഠന യാത്രയിലുടനീളം പരിഹാര പ്രക്രിയയെ സുതാര്യവും കാര്യക്ഷമവും പിന്തുണയുള്ളതുമാക്കുക എന്നതാണ് ലക്ഷ്യം.',
    howItWorks: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു',
    submitComplaint: 'പരാതി സമർപ്പിക്കുക:',
    submitComplaintDesc: 'നിങ്ങളുടെ അക്കൗണ്ടിലേക്ക് ലോഗിൻ ചെയ്ത് വിശദമായ പരാതി ഫോം പൂരിപ്പിക്കുക. ആവശ്യമെങ്കിൽ ഫയലുകളോ തെളിവുകളോ അറ്റാച്ച് ചെയ്യുക, ഉൾപ്പെട്ട വകുപ്പ് അല്ലെങ്കിൽ സ്റ്റാഫ് വ്യക്തമാക്കുക.',
    tracking: 'ട്രാക്കിംഗ്:',
    trackingDesc: 'നിങ്ങളുടെ പരാതിയുടെ സ്റ്റാറ്റസ് തത്സമയം നിരീക്ഷിക്കുക: തുറന്നത്, പുരോഗമിക്കുന്നു, പരിഹരിച്ചു, അല്ലെങ്കിൽ അടച്ചു.',
    staffResponse: 'സ്റ്റാഫ് പ്രതികരണം:',
    staffResponseDesc: 'സ്റ്റാഫ് അംഗങ്ങൾ ഓരോ സമർപ്പണവും അവലോകനം ചെയ്യുന്നു, സ്റ്റാറ്റസ് അപ്‌ഡേറ്റുകൾ നൽകുന്നു, വ്യക്തതയ്‌ക്കായി പരിഹാരങ്ങളോ അഭിപ്രായങ്ങളോ പോസ്റ്റ് ചെയ്യുന്നു.',
    whoCanUse: 'ആർക്കൊക്കെ ഉപയോഗിക്കാം',
    students: 'വിദ്യാർത്ഥികൾ:',
    studentsDesc: 'എല്ലാ രജിസ്റ്റർ ചെയ്ത ബ്രോടോടൈപ്പ് വിദ്യാർത്ഥികൾക്കും പരാതികൾ സമർപ്പിക്കാനും കാണാനും ട്രാക്ക് ചെയ്യാനും കഴിയും.',
    staff: 'സ്റ്റാഫ്:',
    staffDesc: 'വിദ്യാർത്ഥി പരാതികൾ നിയന്ത്രിക്കാനും നിയമിക്കാനും പരിഹരിക്കാനും ഉത്തരവാദിത്തമുള്ളവർ.',
    keyFeatures: 'പ്രധാന സവിശേഷതകൾ',
    feature1: 'ലളിതവും സുരക്ഷിതവുമായ പരാതി സമർപ്പണം',
    feature2: 'ഓരോ അപ്ഡേറ്റിനും സ്റ്റാറ്റസ് അറിയിപ്പുകൾ',
    feature3: 'അജ്ഞാതമായി സമർപ്പിക്കാനുള്ള ഓപ്ഷൻ',
    feature4: 'എല്ലാ കേസുകളും നിയന്ത്രിക്കാനുള്ള സ്റ്റാഫ് ഡാഷ്ബോർഡ്',
    feature5: 'ഓരോ പ്രവർത്തനത്തിന്റെയും സുതാര്യവും ഓഡിറ്റ് ചെയ്യാവുന്നതുമായ ചരിത്രം',
    contactSupport: 'ബന്ധപ്പെടുക & പിന്തുണ',
    contactSupportDesc: 'ഏതെങ്കിലും ചോദ്യങ്ങൾക്കോ പ്ലാറ്റ്ഫോം ഉപയോഗിക്കുന്നതിന് സഹായത്തിനോ, ഇമെയിൽ ചെയ്യുക: support@brototype.com',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ml' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
