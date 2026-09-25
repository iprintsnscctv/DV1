import React, { useState } from 'react';
import { 
  MapPin, Phone, Mail, Clock, MessageSquare, Navigation, 
  Send, ExternalLink, HelpCircle, ChevronDown, ChevronUp, CheckCircle2 
} from 'lucide-react';

interface ContactLocationSectionProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ContactLocationSection: React.FC<ContactLocationSectionProps> = ({ onShowToast }) => {
  // Inquiry form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomInterest, setRoomInterest] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FAQ Accordion state (first item open by default matching screenshot)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What are your standard Check-in and Check-out times?',
      answer:
        'Standard check-in starts at 2:00 PM and check-out is by 12:00 PM (Noon). If you need early check-in or late check-out, please coordinate with our 24/7 front desk team in advance, subject to room availability.',
    },
    {
      question: 'Is there safe parking for multiple vehicles and tour vans?',
      answer:
        'Yes! We provide spacious, gated, and 24/7 CCTV-monitored private parking on-site that comfortably accommodates family cars, SUVs, and full-size tour vans.',
    },
    {
      question: 'How far is Diversion Vigan from Calle Crisologo and Plaza Burgos?',
      answer:
        'We are situated directly along Diversion Road, just 3 to 5 minutes drive (approx. 1.8 km) away from Calle Crisologo, Plaza Burgos, and the historic Vigan Cathedral.',
    },
    {
      question: 'Do you allow cooking or provide kitchen access?',
      answer:
        'Selected family suites include kitchenette and microwave facilities. We also provide shared dining access, hot/cold purified water dispensers, and refrigerator storage for our guests.',
    },
    {
      question: 'What are the payment options available?',
      answer:
        'We accept GCash, Maya, Bank Transfer (BDO / BPI), major Credit/Debit Cards, and Cash upon check-in at the front desk.',
    },
  ];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      onShowToast('Please fill in your name, contact phone, and email address.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onShowToast('Inquiry sent successfully! Our front-desk coordinator will reach out to you shortly.', 'success');
      setFullName('');
      setPhone('');
      setEmail('');
      setMessage('');
      setRoomInterest('General Inquiry');
    }, 600);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section id="contact-location" className="w-full max-w-7xl mx-auto pt-2 pb-10 animate-fade-in">
      {/* Top Section Header */}
      <div className="mb-8 text-left">
        <div className="inline-block px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800/40 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider mb-2">
          GET IN TOUCH &amp; VISIT US
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
          Contact &amp; Location Directions
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Reach our on-site team directly for group bookings, tour van reservations, or special inquiries.
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm sm:text-base">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Diversion Vigan Transient House</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed pl-6">
                Diversion Road, Brgy Cabalangegan, Vigan City, Ilocos Sur 2700, Philippines
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              {/* Phone / Hotline */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    PHONE / HOTLINE
                  </div>
                  <a
                    href="tel:+639178901234"
                    className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    +63 917 890 1234
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    EMAIL
                  </div>
                  <a
                    href="mailto:diversionvigan@gmail.com"
                    className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    diversionvigan@gmail.com
                  </a>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    OPERATING HOURS
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    24/7 Front Gate &amp; Guest Assistance
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href="https://wa.me/639178901234?text=Hello%20Diversion%20Vigan,%20I%20would%20like%20to%20inquire%20about%20a%20room%20reservation"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all text-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Host</span>
              </a>

              <a
                href="https://maps.google.com/?q=Diversion+Road+Vigan+City+Ilocos+Sur"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-md shadow-slate-900/20 transition-all text-center"
              >
                <Navigation className="w-4 h-4 text-white" />
                <span>Google Maps GPS</span>
              </a>
            </div>
          </div>

          {/* Interactive Map Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs relative">
            <div className="absolute top-3 left-3 z-10">
              <a
                href="https://maps.google.com/?q=Diversion+Road+Vigan+City+Ilocos+Sur"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 text-xs font-bold shadow-sm hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Open in Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 relative">
              <iframe
                title="Diversion Vigan Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15273.968603685514!2d120.3789062!3d17.5706915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x338e650c8227b613%3A0x4ebef38d8a7c2937!2sCalle%20Crisologo%2C%20Vigan%20City%2C%20Ilocos%20Sur!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full filter saturate-125 dark:opacity-85"
              />
            </div>
          </div>
        </div>

        {/* Right Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Inquiry or Group Booking Request Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2 mb-1 text-slate-900 dark:text-white font-extrabold text-base sm:text-lg">
              <div className="w-6 h-6 rounded-lg bg-pink-100 dark:bg-pink-950/60 border border-pink-300 dark:border-pink-800 flex items-center justify-center text-pink-600 dark:text-pink-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <h3>Send an Inquiry or Group Booking Request</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 pl-8">
              Planning a wedding entourage, company outing, or group tour? Send us a message.
            </p>

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Atty. Juan Ramos"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 917 123 4567"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan@example.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room Interest
                  </label>
                  <select
                    value={roomInterest}
                    onChange={(e) => setRoomInterest(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Family Suite (4-6 Pax)">Family Suite (4-6 Pax)</option>
                    <option value="Studio Transient (2-3 Pax)">Studio Transient (2-3 Pax)</option>
                    <option value="High-Ceiling Glass Loft">High-Ceiling Glass Loft</option>
                    <option value="Whole Villa / Group Buyout">Private Villa / Group Buyout</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Message or Target Dates
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Include dates, number of guests, number of vehicles, or special requests..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs shadow-lg shadow-slate-900/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <Send className="w-3.5 h-3.5 text-pink-400" />
                <span>{isSubmitting ? 'Sending inquiry...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          </div>

          {/* Frequently Asked Questions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white font-extrabold text-base">
              <div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-950/60 border border-pink-300 dark:border-pink-800 flex items-center justify-center text-pink-600 dark:text-pink-400">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <h3>Frequently Asked Questions</h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="py-3.5 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between gap-3 text-left group cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {faq.question}
                      </span>
                      <span className="text-slate-400 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-1 pr-4 animate-fade-in">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
