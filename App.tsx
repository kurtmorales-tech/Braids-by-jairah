
import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Sparkles, Scissors, Calendar, User, ChevronRight, MessageSquare, Menu, X, ArrowRight, 
  Flower2, Star, Instagram, Twitter, PhoneCall, Quote, Sun, Moon, Lock, AlertCircle, 
  CreditCard, ShieldCheck, BookOpen, HelpCircle, Info, ChevronDown, Check, Send, 
  MapPin, Clock, Facebook
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from './components/Button';
import { GlassCard } from './components/GlassCard';
import { MOCK_SERVICES, MOCK_BOOKINGS, BLOG_POSTS, FAQ_ITEMS, TESTIMONIALS, GALLERY_IMAGES } from './constants';
import { Service, BookingStep, Booking, BlogPost } from './types';
import { getStylingAdvice } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { LegalModal } from './components/LegalModals';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'gallery' | 'resources' | 'faq' | 'about' | 'consult' | 'admin'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [legalModal, setLegalModal] = useState<{ open: boolean, type: 'terms' | 'privacy' | 'refund' }>({ open: false, type: 'terms' });
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Gemini Consultation State
  const [consultInput, setConsultInput] = useState("");
  const [consultChat, setConsultChat] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isConsultLoading, setIsConsultLoading] = useState(false);

  // Data State
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS as any);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Booking State
  const [step, setStep] = useState<BookingStep>(BookingStep.SERVICE_SELECT);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Read Tracking for terms
  const [readPolicies, setReadPolicies] = useState({ terms: false, privacy: false, refund: false });
  const allPoliciesRead = readPolicies.terms && readPolicies.privacy && readPolicies.refund;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && activeTab === 'admin') setActiveTab('home');
    });

    fetchData();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const { data: svcData } = await supabase.from('services').select('*');
      if (svcData && svcData.length > 0) setServices(svcData);

      const { data: bkgData } = await supabase.from('bookings').select('*').order('date', { ascending: false });
      if (bkgData && bkgData.length > 0) setBookings(bkgData);
    } catch (err) {
      console.error("Data fetch error", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const resetBooking = () => {
    setStep(BookingStep.SERVICE_SELECT);
    setSelectedService(null);
    setBookingDate("");
    setClientInfo({ name: '', email: '', phone: '' });
    setIsSubmitting(false);
    setAgreedToTerms(false);
    setReadPolicies({ terms: false, privacy: false, refund: false });
  };

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultInput.trim() || isConsultLoading) return;

    const userMsg = consultInput;
    setConsultInput("");
    setConsultChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsConsultLoading(true);

    const history = consultChat.map(c => ({ role: c.role, parts: [{ text: c.text }] }));
    const advice = await getStylingAdvice(userMsg, history);
    
    setConsultChat(prev => [...prev, { role: 'model', text: advice || "I am unable to provide advice at this moment, darling." }]);
    setIsConsultLoading(false);
  };

  const handlePayment = async (method: 'stripe' | 'paypal') => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2500));

    const newBooking = {
      date: bookingDate,
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientPhone: clientInfo.phone,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentAmount: 3000, 
      serviceId: selectedService?.id || ''
    };

    const { data } = await supabase.from('bookings').insert([newBooking]).select();
    if (data) setBookings(prev => [data[0], ...prev]);

    setStep(BookingStep.CONFIRMATION);
    setIsSubmitting(false);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'book', label: 'Book' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'resources', label: 'Journal' },
    { id: 'faq', label: 'FAQ' },
    { id: 'about', label: 'Sanctuary' },
    { id: 'consult', label: 'Consult' },
  ];

  if (activeTab === 'admin' && session) {
    return (
      <Dashboard 
        services={services} 
        bookings={bookings} 
        onUpdateService={async (svc) => {
          await supabase.from('services').upsert(svc);
          fetchData();
        }}
        onLogout={async () => {
          await supabase.auth.signOut();
          setActiveTab('home');
        }}
        onRefresh={fetchData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-braid-bg dark:bg-braid-dark-bg text-braid-text dark:text-braid-dark-text flex flex-col relative overflow-x-hidden transition-colors duration-500">
      
      <LegalModal 
        isOpen={legalModal.open} 
        type={legalModal.type} 
        onClose={() => setLegalModal(prev => ({ ...prev, open: false }))} 
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setActiveTab('admin');
        }}
      />

      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-10">
        <div className="bg-dots absolute inset-0" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] border border-braid-primary/10 rounded-full flex items-center justify-center"
        >
          <div className="w-[80%] h-[80%] border border-braid-primary/5 rounded-full" />
        </motion.div>
      </div>

      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-[60] bg-white/80 dark:bg-braid-dark-bg/80 backdrop-blur-2xl border-b border-braid-primary/5 dark:border-white/5">
        <div className="container mx-auto px-8 py-5 flex justify-between items-center">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => { setActiveTab('home'); resetBooking(); }}
          >
            <div className="w-11 h-11 bg-braid-primary rounded-full flex items-center justify-center shadow-soft text-white">
              <Flower2 size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-semibold italic leading-tight">Jaira</span>
              <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-braid-primary">Artistry</span>
            </div>
          </motion.div>

          <div className="hidden xl:flex items-center gap-8 text-[9px] font-bold tracking-[0.15em] uppercase">
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); resetBooking(); }}
                className={`transition-all duration-300 relative group flex items-center gap-1.5 ${activeTab === tab.id ? 'text-braid-primary' : 'text-braid-muted dark:text-braid-dark-muted hover:text-braid-text'}`}
              >
                {tab.id === 'consult' && <Sparkles size={12} className="text-braid-primary" />}
                {tab.label}
                <motion.span 
                  layoutId="navUnderline"
                  className={`absolute -bottom-1.5 left-0 w-full h-[1.5px] bg-braid-primary transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-3 rounded-full bg-braid-primary/5 dark:bg-white/5 text-braid-primary hover:scale-110 transition-transform">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Button variant="embossed" className="hidden sm:flex" onClick={() => { setActiveTab('book'); resetBooking(); }}>
              Book Protocol
            </Button>
            <button onClick={() => setIsMenuOpen(true)} className="xl:hidden p-3 text-braid-primary">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-[100] bg-braid-bg dark:bg-braid-dark-bg p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-16">
               <span className="font-serif italic text-2xl">Menu</span>
               <button onClick={() => setIsMenuOpen(false)} className="p-2"><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-8">
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setIsMenuOpen(false); resetBooking(); }}
                  className={`text-4xl font-serif italic text-left ${activeTab === item.id ? 'text-braid-primary' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow z-10 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home" 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-32 pb-32"
            >
              {/* Hero Section */}
              <section className="min-h-[85vh] flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="space-y-8 max-w-5xl"
                >
                  <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-braid-primary/5 text-[10px] font-bold text-braid-primary uppercase tracking-[0.3em] border border-braid-primary/10">
                    <Sparkles size={14} className="animate-pulse" /> Protective Artistry Redefined
                  </div>
                  <h1 className="text-7xl md:text-[160px] font-black tracking-tighter leading-[0.85] text-braid-text dark:text-braid-dark-text uppercase">
                    LUXURY <br />
                    <span className="font-serif italic text-braid-primary font-light normal-case">Experience.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-braid-muted max-w-2xl mx-auto font-light leading-relaxed">
                    A sanctuary dedicated to high-performance protective styling, restorative hair health, and timeless aesthetic precision.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
                     <Button variant="primary" className="h-14 px-12" onClick={() => setActiveTab('book')}>Secure Your Slot</Button>
                     <Button variant="outline" className="h-14 px-12" onClick={() => setActiveTab('gallery')}>The Archive</Button>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer text-braid-primary/30"
                  onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
                >
                   <ChevronDown size={32} />
                </motion.div>
              </section>

              {/* Philosophy / About Sneak Peek */}
              <section className="container mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="relative group">
                   <div className="absolute -top-10 -left-10 w-full h-full border border-braid-primary/10 rounded-[4rem] group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-700" />
                   <div className="absolute -bottom-10 -right-10 w-full h-full border border-braid-secondary/10 rounded-[4rem] group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-700" />
                   <img 
                    src="https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=800&auto=format&fit=crop" 
                    className="rounded-[3.5rem] shadow-2xl relative z-10 w-full grayscale hover:grayscale-0 transition-all duration-1000" 
                    alt="Sanctuary vibe" 
                   />
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-braid-primary">Our Philosophy</span>
                    <h2 className="text-5xl md:text-7xl font-serif italic leading-tight">Beyond the <br /> Braid.</h2>
                  </div>
                  <p className="text-xl text-braid-muted font-light leading-relaxed">
                    We believe protective styling should be a ritual of restoration. Every protocol in Jaira's sanctuary is engineered to maintain hair density, scalp hydration, and aesthetic excellence.
                  </p>
                  <ul className="space-y-4 pt-4">
                    {["Low-tension protocols", "Sustainably sourced fibers", "Precision parting logic"].map((feat, i) => (
                      <li key={i} className="flex items-center gap-4 text-braid-text dark:text-braid-dark-text">
                        <div className="w-6 h-6 rounded-full bg-braid-primary/10 flex items-center justify-center text-braid-primary">
                          <Check size={14} />
                        </div>
                        <span className="font-medium tracking-wide text-sm uppercase">{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" className="px-0 group" onClick={() => setActiveTab('about')}>
                    The Story Behind Jaira <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </Button>
                </div>
              </section>

              {/* Featured Services */}
              <section className="bg-braid-primary/5 dark:bg-black/20 py-32 px-8">
                <div className="container mx-auto space-y-16">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="space-y-4">
                      <span className="text-xs font-bold uppercase tracking-[0.3em] text-braid-primary">Featured Styles</span>
                      <h2 className="text-5xl md:text-7xl font-serif italic">Sanctuary <br /> Protocols</h2>
                    </div>
                    <Button variant="outline" onClick={() => setActiveTab('book')}>View All Services</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {services.slice(0, 3).map(service => (
                      <GlassCard key={service.id} hoverable className="p-0 overflow-hidden flex flex-col group" onClick={() => { setSelectedService(service); setActiveTab('book'); setStep(BookingStep.TEMPORAL_SELECT); }}>
                        <div className="relative h-72 overflow-hidden">
                          <img src={service.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={service.name} />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-500" />
                          <div className="absolute top-6 right-6 bg-white/90 dark:bg-braid-dark-bg/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-braid-primary">
                             ${service.price / 100}
                          </div>
                        </div>
                        <div className="p-8 space-y-4 flex-grow">
                          <h3 className="text-2xl font-serif italic">{service.name}</h3>
                          <p className="text-sm text-braid-muted line-clamp-2">{service.description}</p>
                          <div className="flex justify-between items-center pt-4 border-t border-braid-primary/5">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-braid-muted flex items-center gap-2"><Clock size={12} /> {service.duration} mins</span>
                             <span className="text-[10px] font-bold uppercase tracking-widest text-braid-primary flex items-center gap-1 group-hover:gap-2 transition-all">Book Now <ChevronRight size={12} /></span>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </section>

              {/* Testimonials Section */}
              <section className="container mx-auto px-8 py-32 space-y-16">
                 <div className="text-center space-y-4">
                   <span className="text-xs font-bold uppercase tracking-[0.3em] text-braid-primary">Client Voices</span>
                   <h2 className="text-5xl font-serif italic">Pure Satisfaction.</h2>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {TESTIMONIALS.map(t => (
                     <GlassCard key={t.id} className="p-10 space-y-6">
                        <Quote className="text-braid-primary/20" size={48} />
                        <p className="text-lg text-braid-text dark:text-braid-dark-text italic font-serif leading-relaxed">"{t.text}"</p>
                        <div className="flex items-center gap-4 pt-6 border-t border-braid-primary/10">
                          <div className="w-10 h-10 rounded-full bg-braid-primary/10 flex items-center justify-center font-serif text-braid-primary">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold tracking-wide uppercase">{t.name}</div>
                            <div className="text-[10px] text-braid-muted uppercase tracking-widest">{t.service}</div>
                          </div>
                        </div>
                     </GlassCard>
                   ))}
                 </div>
              </section>

              {/* Journal Preview */}
              <section className="container mx-auto px-8 space-y-16">
                 <div className="flex justify-between items-center">
                    <h2 className="text-5xl font-serif italic">From The Journal</h2>
                    <Button variant="ghost" onClick={() => setActiveTab('resources')}>Read All Articles <ArrowRight size={16} /></Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {BLOG_POSTS.slice(0, 2).map(post => (
                     <div key={post.id} className="group cursor-pointer flex flex-col md:flex-row gap-8 items-center" onClick={() => { setSelectedBlog(post); setActiveTab('resources'); }}>
                        <div className="w-full md:w-1/2 h-64 rounded-[2.5rem] overflow-hidden">
                           <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={post.title} />
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-braid-primary">{post.category}</span>
                           <h3 className="text-2xl font-serif italic group-hover:text-braid-primary transition-colors">{post.title}</h3>
                           <p className="text-sm text-braid-muted leading-relaxed">{post.excerpt}</p>
                           <div className="text-[10px] font-bold uppercase tracking-widest text-braid-muted">{post.readTime}</div>
                        </div>
                     </div>
                   ))}
                 </div>
              </section>

              {/* Newsletter / CTA */}
              <section className="container mx-auto px-8">
                <GlassCard className="bg-braid-text dark:bg-braid-dark-panel p-16 md:p-24 overflow-hidden relative border-none">
                  {/* Decor */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-braid-primary/10 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="max-w-3xl space-y-8 relative z-10">
                    <h2 className="text-5xl md:text-7xl font-serif italic text-white leading-tight">Join the <br /> Circle.</h2>
                    <p className="text-lg text-white/60 font-light max-w-lg">
                      Receive early access to slot releases, maintenance protocols, and exclusive hair health resources.
                    </p>
                    {!newsletterSuccess ? (
                      <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => { e.preventDefault(); setNewsletterSuccess(true); }}>
                        <input 
                          required type="email" placeholder="Your Email Darling..." 
                          className="flex-grow bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white outline-none focus:border-braid-primary transition-all"
                          value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)}
                        />
                        <Button type="submit" variant="primary" className="h-14 px-10">Subscribe</Button>
                      </form>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-braid-primary">
                         <Check size={24} /> <span className="text-xl font-serif italic">You're in the sanctuary circle now.</span>
                      </motion.div>
                    )}
                  </div>
                </GlassCard>
              </section>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.section 
              key="gallery"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="py-24 container mx-auto px-8 max-w-7xl space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-serif italic">The Archive</h2>
                <p className="text-braid-muted uppercase text-xs tracking-[0.2em]">Visual proof of precision artistry</p>
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
                 {GALLERY_IMAGES.map(img => (
                   <motion.div 
                    key={img.id} 
                    whileHover={{ y: -5 }}
                    className="relative group overflow-hidden rounded-[3rem] shadow-xl break-inside-avoid"
                   >
                     <img src={img.url} className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={img.title} />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-braid-primary tracking-widest">{img.category}</span>
                          <h4 className="text-xl font-serif italic text-white">{img.title}</h4>
                        </div>
                     </div>
                   </motion.div>
                 ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'consult' && (
            <motion.section 
              key="consult"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-24 container mx-auto px-8 max-w-4xl space-y-16"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-braid-primary/10 rounded-full flex items-center justify-center mx-auto text-braid-primary mb-6">
                  <Sparkles size={40} />
                </div>
                <h2 className="text-6xl font-serif italic">Digital Stylist</h2>
                <p className="text-braid-muted uppercase text-xs tracking-[0.2em]">Personalized protocols powered by Gemini</p>
              </div>

              <GlassCard className="min-h-[500px] flex flex-col p-0">
                <div className="flex-grow p-8 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {consultChat.length === 0 && (
                    <div className="text-center py-20 space-y-4">
                       <p className="text-braid-muted italic font-serif text-lg">"Ask me about your hair goals, scalp health, or which protocol suits your lifestyle darling..."</p>
                       <div className="flex flex-wrap justify-center gap-3">
                         {["Best for short hair?", "Maintaining locs", "Fulani patterns"].map(q => (
                           <button 
                            key={q} onClick={() => setConsultInput(q)}
                            className="px-4 py-2 rounded-full border border-braid-primary/20 text-[10px] font-bold uppercase tracking-widest text-braid-muted hover:text-braid-primary transition-colors"
                           >
                             {q}
                           </button>
                         ))}
                       </div>
                    </div>
                  )}
                  {consultChat.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-braid-primary text-white shadow-soft' 
                        : 'bg-braid-bg dark:bg-black/20 text-braid-text dark:text-braid-dark-text border border-braid-primary/10'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {isConsultLoading && (
                    <div className="flex justify-start">
                      <div className="bg-braid-bg dark:bg-black/20 p-6 rounded-[2rem] flex gap-2">
                        <div className="w-2 h-2 bg-braid-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-braid-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-braid-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>
                <form className="p-6 border-t border-braid-primary/10 bg-braid-primary/5 flex gap-4" onSubmit={handleConsult}>
                   <input 
                    required placeholder="Consult with Jaira..."
                    className="flex-grow bg-white dark:bg-braid-dark-bg border border-braid-primary/10 rounded-full px-6 py-4 text-sm outline-none focus:border-braid-primary transition-all"
                    value={consultInput} onChange={e => setConsultInput(e.target.value)}
                   />
                   <button type="submit" disabled={isConsultLoading} className="p-4 bg-braid-primary text-white rounded-full shadow-soft hover:scale-110 active:scale-95 transition-all">
                      <Send size={20} />
                   </button>
                </form>
              </GlassCard>
            </motion.section>
          )}

          {activeTab === 'resources' && (
            <motion.section 
              key="resources"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="py-24 container mx-auto px-8 max-w-6xl space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-serif italic">The Journal</h2>
                <p className="text-braid-muted uppercase text-xs tracking-[0.2em]">Resources for the modern protective stylist</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {BLOG_POSTS.map(post => (
                  <GlassCard key={post.id} hoverable className="p-0 flex flex-col h-full group" onClick={() => setSelectedBlog(post)}>
                    <div className="relative h-60 overflow-hidden">
                      <img src={post.image} className="w-full h-full object-cover rounded-t-[2.5rem] group-hover:scale-105 transition-transform duration-700" alt={post.title} />
                    </div>
                    <div className="p-8 space-y-4 flex flex-col flex-grow">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-braid-primary tracking-widest">
                        <span>{post.category}</span>
                        <span className="text-braid-muted">{post.readTime}</span>
                      </div>
                      <h3 className="text-2xl font-serif italic flex-grow">{post.title}</h3>
                      <p className="text-sm text-braid-muted leading-relaxed line-clamp-2">{post.excerpt}</p>
                      <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-braid-primary pt-4 group-hover:gap-4 transition-all">
                        Read Protocol <ArrowRight size={14} />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>

              {selectedBlog && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-braid-text/80 backdrop-blur-xl" onClick={() => setSelectedBlog(null)}>
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-braid-bg dark:bg-braid-dark-bg w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-12 relative shadow-2xl"
                    onClick={e => e.stopPropagation()}
                  >
                    <button onClick={() => setSelectedBlog(null)} className="absolute top-8 right-8 p-3 bg-braid-primary/10 rounded-full text-braid-primary hover:bg-braid-primary/20 transition-all">
                      <X size={24} />
                    </button>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <span className="text-xs font-bold uppercase text-braid-primary tracking-widest">{selectedBlog.category}</span>
                        <h2 className="text-5xl font-serif italic">{selectedBlog.title}</h2>
                      </div>
                      <img src={selectedBlog.image} className="w-full h-80 object-cover rounded-[2rem]" alt={selectedBlog.title} />
                      <div className="prose prose-lg dark:prose-invert max-w-none text-braid-muted">
                        {selectedBlog.content}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'faq' && (
            <motion.section 
              key="faq"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-24 container mx-auto px-8 max-w-3xl space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-serif italic">Artisan FAQ</h2>
                <p className="text-braid-muted uppercase text-xs tracking-[0.2em]">Clarifying the Sanctuary Protocols</p>
              </div>

              <div className="space-y-4">
                {FAQ_ITEMS.map((item, i) => (
                  <GlassCard key={i} className="p-0 overflow-hidden">
                    <details className="group">
                      <summary className="p-8 flex justify-between items-center cursor-pointer list-none">
                        <h3 className="text-xl font-serif italic">{item.question}</h3>
                        <div className="p-2 rounded-full bg-braid-primary/10 text-braid-primary group-open:rotate-180 transition-all">
                          <ChevronDown size={18} />
                        </div>
                      </summary>
                      <div className="px-8 pb-8 text-braid-muted text-sm leading-relaxed border-t border-braid-primary/5 pt-6">
                        {item.answer}
                      </div>
                    </details>
                  </GlassCard>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'about' && (
            <motion.section 
              key="about"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-24 container mx-auto px-8 max-w-6xl space-y-32"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <div className="relative">
                  <div className="absolute -top-10 -left-10 w-full h-full border-2 border-braid-primary/10 rounded-[4rem]" />
                  <img 
                    src="https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=800&auto=format&fit=crop" 
                    className="rounded-[4rem] shadow-2xl relative z-10 grayscale" 
                    alt="Artisan at work" 
                  />
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-braid-primary">The Sanctuary Story</span>
                    <h2 className="text-6xl font-serif italic leading-tight">Artistry <br /> Meets Wellness.</h2>
                  </div>
                  <p className="text-xl text-braid-muted font-light leading-relaxed">
                    Braids By Jaira was born in 2018 with a single mission: to provide protective styling that doesn't sacrifice the long-term health of the hair.
                  </p>
                  <p className="text-lg text-braid-muted font-light leading-relaxed">
                    Jaira, a master architect of hair, spent years developing the "Sanctuary Protocol"—a low-tension methodology that ensures client comfort and retention.
                  </p>
                  <div className="grid grid-cols-3 gap-8 pt-8">
                    <div className="text-center border-r border-braid-primary/10 last:border-none">
                      <div className="text-4xl font-serif italic text-braid-primary">5k+</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-braid-muted">Clients</div>
                    </div>
                    <div className="text-center border-r border-braid-primary/10 last:border-none">
                      <div className="text-4xl font-serif italic text-braid-primary">12+</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-braid-muted">Protocols</div>
                    </div>
                    <div className="text-center last:border-none">
                      <div className="text-4xl font-serif italic text-braid-primary">8yr</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-braid-muted">Expertise</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Values */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 {[
                   { title: "Integrity", desc: "We never compromise scalp health for aesthetic trends." },
                   { title: "Precision", desc: "Geometric parting logic is a signature of our sanctuary." },
                   { title: "Peace", desc: "Our chair is a space for restoration, reflection, and quiet luxury." }
                 ].map(val => (
                   <div key={val.title} className="text-center space-y-4">
                      <h3 className="text-3xl font-serif italic">{val.title}</h3>
                      <p className="text-sm text-braid-muted font-light leading-relaxed">{val.desc}</p>
                   </div>
                 ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'book' && (
            <motion.section key="book" className="py-24 container mx-auto px-8 max-w-4xl">
               <div className="flex flex-col items-center mb-16 space-y-4">
                <h2 className="text-5xl font-serif italic">Reservation</h2>
                <div className="flex gap-4 items-center">
                  {[1, 2, 3, 4, 5].map(i => (
                    <React.Fragment key={i}>
                      <div className={`w-3 h-3 rounded-full ${step >= i ? 'bg-braid-primary' : 'bg-braid-primary/20'}`} />
                      {i < 5 && <div className="w-8 h-[1px] bg-braid-primary/10" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === BookingStep.SERVICE_SELECT && (
                  <motion.div key="1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid gap-6">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className={`p-8 rounded-[3rem] border-2 cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-center gap-6 ${selectedService?.id === service.id ? "bg-white dark:bg-braid-dark-panel border-braid-primary shadow-gold-glow" : "bg-white/40 dark:bg-white/5 border-transparent hover:border-braid-primary/10"}`}
                      >
                        <div className="flex gap-6 items-center">
                          <img src={service.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm" />
                          <div>
                            <h3 className="text-xl font-serif font-bold">{service.name}</h3>
                            <p className="text-xs text-braid-muted uppercase">{service.duration} mins</p>
                          </div>
                        </div>
                        <div className="text-2xl font-serif text-braid-primary">${service.price / 100}</div>
                      </div>
                    ))}
                    <Button disabled={!selectedService} onClick={() => setStep(BookingStep.TEMPORAL_SELECT)} className="mt-8 py-5">Choose Slot</Button>
                  </motion.div>
                )}
                
                {step === BookingStep.TEMPORAL_SELECT && (
                  <motion.div key="2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                    <GlassCard className="text-center p-12">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-braid-primary mb-6">Select Your Session Date</label>
                      <input type="datetime-local" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="bg-transparent text-3xl font-serif outline-none p-4 text-braid-primary" />
                    </GlassCard>
                    <div className="flex justify-between gap-4">
                      <Button variant="ghost" onClick={() => setStep(BookingStep.SERVICE_SELECT)}>Back</Button>
                      <Button disabled={!bookingDate} onClick={() => setStep(BookingStep.CLIENT_INFO)}>Next: Verification</Button>
                    </div>
                  </motion.div>
                )}

                {step === BookingStep.CLIENT_INFO && (
                  <motion.div key="3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <form onSubmit={(e) => { e.preventDefault(); setStep(BookingStep.PAYMENT); }} className="space-y-6">
                      <GlassCard className="space-y-8 p-12">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-braid-muted ml-4">Full Name</label>
                          <input required placeholder="Amara Darling..." className="w-full bg-transparent border-b border-braid-primary/10 p-4 outline-none font-serif text-2xl focus:border-braid-primary transition-all" value={clientInfo.name} onChange={e => setClientInfo({...clientInfo, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-braid-muted ml-4">Email Address</label>
                          <input required type="email" placeholder="amara@artistry.com" className="w-full bg-transparent border-b border-braid-primary/10 p-4 outline-none focus:border-braid-primary transition-all" value={clientInfo.email} onChange={e => setClientInfo({...clientInfo, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-braid-muted ml-4">Phone Number</label>
                          <input required placeholder="+1 (555) 000-0000" className="w-full bg-transparent border-b border-braid-primary/10 p-4 outline-none focus:border-braid-primary transition-all" value={clientInfo.phone} onChange={e => setClientInfo({...clientInfo, phone: e.target.value})} />
                        </div>
                      </GlassCard>
                      <div className="flex justify-between">
                        <Button type="button" variant="ghost" onClick={() => setStep(BookingStep.TEMPORAL_SELECT)}>Back</Button>
                        <Button type="submit">Verify & Proceed</Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {step === BookingStep.PAYMENT && (
                  <motion.div key="4" className="space-y-8">
                    <GlassCard className="text-center space-y-8 p-12">
                      <div className="space-y-4">
                         <div className="w-16 h-16 bg-braid-primary/10 rounded-full flex items-center justify-center mx-auto text-braid-primary">
                           <ShieldCheck size={32} />
                         </div>
                         <h3 className="text-3xl font-serif italic">Secure Protocol Deposit</h3>
                         <p className="text-braid-muted text-sm uppercase tracking-widest">A $30.00 non-refundable investment is required</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => agreedToTerms && handlePayment('stripe')} disabled={!agreedToTerms || isSubmitting} className="w-full bg-[#635BFF] text-white py-4 rounded-full flex items-center justify-center gap-3 font-bold hover:brightness-110 transition-all disabled:opacity-50">
                          <CreditCard size={18} /> Stripe
                        </button>
                        <button onClick={() => agreedToTerms && handlePayment('paypal')} disabled={!agreedToTerms || isSubmitting} className="w-full bg-[#FFC439] text-[#003087] py-4 rounded-full flex items-center justify-center gap-3 font-bold hover:brightness-110 transition-all disabled:opacity-50">
                           PayPal
                        </button>
                      </div>

                      <div className={`flex flex-col items-start gap-3 text-left p-6 rounded-[2rem] border transition-all duration-300 ${allPoliciesRead ? 'bg-braid-bg/50 dark:bg-black/20 border-braid-primary/20' : 'bg-braid-primary/5 border-dashed border-braid-primary/10 grayscale opacity-60'}`}>
                        <div className="flex items-start gap-4 w-full">
                          <input 
                            type="checkbox" 
                            id="terms-check" 
                            checked={agreedToTerms} 
                            disabled={!allPoliciesRead}
                            onChange={e => setAgreedToTerms(e.target.checked)} 
                            className="mt-1 accent-braid-primary w-5 h-5 rounded cursor-pointer" 
                          />
                          <label htmlFor="terms-check" className={`text-xs leading-relaxed transition-colors ${allPoliciesRead ? 'text-braid-muted' : 'text-braid-muted/50 cursor-not-allowed'}`}>
                            I agree to the <button type="button" onClick={() => { setReadPolicies(p=>({...p, terms:true})); setLegalModal({ open: true, type: 'terms' })}} className="font-bold underline text-braid-primary">Terms</button>, 
                            <button type="button" onClick={() => { setReadPolicies(p=>({...p, privacy:true})); setLegalModal({ open: true, type: 'privacy' })}} className="font-bold underline text-braid-primary"> Privacy Policy</button>, and acknowledge that my $30.00 deposit is 
                            <button type="button" onClick={() => { setReadPolicies(p=>({...p, refund:true})); setLegalModal({ open: true, type: 'refund' })}} className="font-bold underline text-braid-primary"> 100% Non-Refundable</button>.
                          </label>
                        </div>
                        {!allPoliciesRead && (
                          <div className="flex items-center gap-2 text-[9px] text-braid-primary font-bold uppercase tracking-widest mt-2">
                            <AlertCircle size={12} /> Please review all policy links to enable
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                )}

                {step === BookingStep.CONFIRMATION && (
                  <motion.div key="5" className="text-center space-y-12 py-12">
                    <div className="w-32 h-32 bg-braid-primary rounded-full flex items-center justify-center mx-auto text-white shadow-gold-glow animate-pulse">
                      <Sparkles size={64} />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-6xl font-serif italic">Sanctuary Reserved.</h2>
                      <p className="text-braid-muted text-lg font-light">A digital protocol confirmation has been dispatched to <span className="text-braid-text font-medium">{clientInfo.email}</span>.</p>
                    </div>
                    <Button variant="embossed" className="mx-auto h-14 px-12" onClick={() => {setActiveTab('home'); resetBooking();}}>Return to Home</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-32 border-t border-braid-primary/10 bg-white dark:bg-black/40 z-10">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-20 mb-20">
            {/* Column 1: Brand */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-braid-primary rounded-full flex items-center justify-center text-white">
                  <Flower2 size={24} />
                </div>
                <span className="font-serif italic text-3xl">Jaira</span>
              </div>
              <p className="text-sm text-braid-muted leading-relaxed max-w-xs">
                Luxury hair artistry and protective styling protocols designed for the high-end modern aesthetic.
              </p>
              <div className="flex gap-4">
                <button className="p-3 bg-braid-primary/5 rounded-full text-braid-primary hover:bg-braid-primary hover:text-white transition-all"><Instagram size={20} /></button>
                <button className="p-3 bg-braid-primary/5 rounded-full text-braid-primary hover:bg-braid-primary hover:text-white transition-all"><Twitter size={20} /></button>
                <button className="p-3 bg-braid-primary/5 rounded-full text-braid-primary hover:bg-braid-primary hover:text-white transition-all"><Facebook size={20} /></button>
              </div>
            </div>

            {/* Column 2: Discover */}
            <div className="space-y-8">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-braid-primary">Discover</h4>
               <ul className="space-y-4 text-xs font-medium tracking-wide uppercase">
                 <li><button onClick={() => setActiveTab('book')} className="text-braid-muted hover:text-braid-primary transition-colors">Book Session</button></li>
                 <li><button onClick={() => setActiveTab('gallery')} className="text-braid-muted hover:text-braid-primary transition-colors">The Archive</button></li>
                 <li><button onClick={() => setActiveTab('resources')} className="text-braid-muted hover:text-braid-primary transition-colors">The Journal</button></li>
                 <li><button onClick={() => setActiveTab('consult')} className="text-braid-muted hover:text-braid-primary transition-colors flex items-center gap-2">AI Consultant <Sparkles size={12}/></button></li>
               </ul>
            </div>

            {/* Column 3: Sanctuary */}
            <div className="space-y-8">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-braid-primary">Sanctuary</h4>
               <ul className="space-y-4 text-xs font-medium tracking-wide uppercase">
                 <li><button onClick={() => setActiveTab('about')} className="text-braid-muted hover:text-braid-primary transition-colors">Our Story</button></li>
                 <li><button onClick={() => setActiveTab('faq')} className="text-braid-muted hover:text-braid-primary transition-colors">Artisan FAQ</button></li>
                 <li><button onClick={() => { setLegalModal({ open: true, type: 'terms' }) }} className="text-braid-muted hover:text-braid-primary transition-colors">Terms</button></li>
                 <li><button onClick={() => { setLegalModal({ open: true, type: 'privacy' }) }} className="text-braid-muted hover:text-braid-primary transition-colors">Privacy</button></li>
               </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="space-y-8">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-braid-primary">Location</h4>
               <div className="space-y-4 text-xs text-braid-muted">
                 <div className="flex items-start gap-4">
                   <MapPin size={18} className="text-braid-primary flex-shrink-0" />
                   <p>122 Artistic Way, Suite 400<br />New York, NY 10001</p>
                 </div>
                 <div className="flex items-center gap-4">
                   <PhoneCall size={18} className="text-braid-primary flex-shrink-0" />
                   <p>+1 (555) 000-BRAID</p>
                 </div>
               </div>
               <button 
                onClick={() => session ? setActiveTab('admin') : setIsAuthModalOpen(true)} 
                className="text-[9px] font-bold uppercase tracking-widest text-braid-primary border border-braid-primary/20 px-6 py-2 rounded-full hover:bg-braid-primary/5 transition-all flex items-center gap-2"
               >
                 <Lock size={10} /> {session ? 'Admin Suite' : 'Team Access'}
               </button>
            </div>
          </div>
          
          <div className="pt-12 border-t border-braid-primary/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] text-braid-muted font-bold uppercase tracking-widest">
              © 2024 Braids By Jaira. Sanctuary Protocols in Effect.
            </p>
            <div className="flex gap-8 text-[10px] text-braid-muted font-bold uppercase tracking-widest">
              <span>Handcrafted Artistry</span>
              <span>NY / Global</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
