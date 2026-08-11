//13th edit

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Sparkles, Send, Flame, Cpu, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const sectionsCount = 3;

  // Intersection Observer states for triggerable section animations
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);

  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.5,
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'section-0') setIsHeroVisible(true);
          if (entry.target.id === 'section-1') setIsAboutVisible(true);
          if (entry.target.id === 'section-2') setIsContactVisible(true);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    if (heroRef.current) observer.observe(heroRef.current);
    if (aboutRef.current) observer.observe(aboutRef.current);
    if (contactRef.current) observer.observe(contactRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      setActiveSection((prev) => {
        if (prev < sectionsCount - 1) {
          return prev + 1;
        } else {
          setIsAutoScrolling(false);
          clearInterval(interval);
          return prev;
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoScrolling, sectionsCount]);

  useEffect(() => {
    const element = document.getElementById(`section-${activeSection}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSection]);

  const handleManualScroll = () => {
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
    }
  };

  return (
    <div 
      onWheel={handleManualScroll}
      onTouchStart={handleManualScroll}
      className="min-h-screen font-sans overflow-x-hidden selection:bg-black selection:text-white transition-colors duration-200 relative flex flex-col bg-zinc-50 text-zinc-900"
    >
      <style jsx global>{`
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInTop {
          0% {
            opacity: 0;
            transform: translateY(-50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInBottom {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Hero Section Animation Classes */
        .animate-box-first {
          animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-heading-second {
          opacity: 0;
          animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }

        .animate-text-third {
          opacity: 0;
          animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }

        /* About Section Animation Classes */
        .animate-about-header {
          opacity: 0;
          animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-box-right {
          opacity: 0;
          animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }

        .animate-box-mid {
          opacity: 0;
          animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
        }

        .animate-box-left {
          opacity: 0;
          animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }

        /* Contact Section Animation Classes */
        .animate-contact-header {
          opacity: 0;
          animation: slideInTop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-contact-form {
          opacity: 0;
          animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }

        .animate-contact-button {
          opacity: 0;
          animation: slideInBottom 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }
      `}</style>

      {/* Background Subtle Monochromatic Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      {/* Clean Navbar Wrapper */}
      <div className="w-full relative z-50 pt-4">
        <Navbar />
      </div>

      <div className="flex-1 h-[calc(100vh-5rem)] overflow-y-scroll snap-y snap-mandatory relative z-10">
        
        {/* PAGE 1: HERO SECTION */}
        <section id="section-0" ref={heroRef} className="min-h-full snap-start flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 pt-16">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT CONTENT COLUMN */}
            <div className="lg:col-span-7 space-y-8 text-left">

              <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] lowercase text-zinc-900 ${isHeroVisible ? 'animate-heading-second' : 'opacity-0'}`}>
                decentralization <br />
                <span className="text-zinc-400">meets </span>
                <span className="underline decoration-zinc-300 decoration-wavy decoration-2 text-zinc-900">ai agents</span>
              </h1>

              <div className={`space-y-8 ${isHeroVisible ? 'animate-text-third' : 'opacity-0'}`}>
                <div className="grid grid-cols-2 gap-8 pt-2 border-t border-zinc-200 max-w-md">
                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">12+</div>
                    <div className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">projects built</div>
                  </div>
                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">1002+</div>
                    <div className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">startups funded</div>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-zinc-600 max-w-xl leading-relaxed font-normal">
                  Welcome to the future of technology where decentralization meets the power of AI agents! Our innovative SaaS service is designed to revolutionize the way businesses operate.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="px-7 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
                  >
                    case studies.
                  </Link>

                  <Link
                    href="/docs"
                    className="px-7 py-3.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm transition-all shadow-sm active:scale-95"
                  >
                    documentation.
                  </Link>
                </div>
              </div>

            </div>

            {/* RIGHT BOX */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className={`relative w-full aspect-square max-w-[460px] flex items-center justify-center ${isHeroVisible ? 'animate-box-first' : 'opacity-0'}`}>
                
                <div className="relative w-full h-full rounded-3xl border border-zinc-300/80 bg-white/90 backdrop-blur-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col justify-between overflow-hidden group">
                  
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-zinc-300" />
                      <div className="w-3 h-3 rounded-full bg-zinc-300" />
                      <div className="w-3 h-3 rounded-full bg-zinc-300" />
                    </div>
                    <span className="text-xs font-mono text-zinc-400">fiery_ai_core.tsx</span>
                  </div>

                  {/* ========================================================================= */}
                  {/* EDIT STARTED HERE: Option 4 (Cyber Emerald Green) Card Integration        */}
                  {/* ========================================================================= */}
                  <div className="my-auto py-10 relative flex items-center justify-center">
                    <div className="relative z-10 w-48 h-48 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-6 shadow-[0_15px_35px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center text-center transition-transform duration-500 group-hover:scale-105">
                      <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center mb-3">
                        <Flame className="w-6 h-6 text-emerald-100" />
                      </div>
                      <span className="text-xs font-bold tracking-widest text-white uppercase">BUITEMS AI</span>
                      <span className="text-[10px] font-mono text-emerald-100 mt-1">Turbo Engine</span>
                    </div>
                  </div>
                  {/* ========================================================================= */}
                  {/* EDIT ENDED HERE                                                           */}
                  {/* ========================================================================= */}

                  <div className="bg-zinc-100 border border-zinc-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-black text-white">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Active Fiery Nodes</div>
                      <div className="text-[10px] text-zinc-500 font-medium">Optimized GPU Processing</div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* PAGE 2: ABOUT / HIGHLIGHTS */}
        <section id="section-1" ref={aboutRef} className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12 bg-zinc-100/60 backdrop-blur-sm border-y border-zinc-200">
          <div className="max-w-5xl mx-auto text-center w-full">
            
            <div className={isAboutVisible ? 'animate-about-header' : 'opacity-0'}>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-3 lowercase text-zinc-900">about the platform</h2>
              <p className="text-zinc-600 max-w-xl mx-auto mb-8 text-sm sm:text-base font-normal">
                Designed specifically to tackle university coursework hurdles using intelligent context expansion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mb-10">
              
              <div className={`p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-400 transition-all duration-300 group ${isAboutVisible ? 'animate-box-left' : 'opacity-0'}`}>
                <div className="p-3 bg-zinc-100 text-zinc-900 rounded-xl w-fit mb-4 border border-zinc-200 group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2 lowercase text-zinc-900">paste half notes</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  Input rough classroom sentences to generate complete frameworks.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-400 transition-all duration-300 group ${isAboutVisible ? 'animate-box-mid' : 'opacity-0'}`}>
                <div className="p-3 bg-zinc-100 text-zinc-900 rounded-xl w-fit mb-4 border border-zinc-200 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2 lowercase text-zinc-900">strict subject scope</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  AI stays strictly within your academic syllabus parameters.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-400 transition-all duration-300 group ${isAboutVisible ? 'animate-box-right' : 'opacity-0'}`}>
                <div className="p-3 bg-zinc-100 text-zinc-900 rounded-xl w-fit mb-4 border border-zinc-200 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-2 lowercase text-zinc-900">instant output</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  Receive comprehensive summaries ready for exam prep.
                </p>
              </div>

            </div>

            <div className="w-full overflow-hidden py-3.5 border-y border-zinc-300 bg-black text-white">
              <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-mono tracking-widest text-zinc-300">
                <span>⚡ JAVASCRIPT</span>
                <span>•</span>
                <span>🎯 NEXTJS</span>
                <span>•</span>
                <span>🚀 REACT</span>
                <span>•</span>
                <span>📚 EXPRESS JS</span>
                <span>•</span>
                <span>⚡ NODE JS</span>
                <span>•</span>
                <span>🎯 TAILWIND CSS</span>
                <span>•</span>
                <span>🚀 AI INTEGRATION</span>
                <span>•</span>
                <span>HTML</span>
              </div>
            </div>

          </div>
        </section>

        {/* PAGE 3: CONTACT US */}
        <section id="section-2" ref={contactRef} className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-xl mx-auto text-center w-full">
            
            {/* Contact Us Header enters from Top */}
            <div className={isContactVisible ? 'animate-contact-header' : 'opacity-0'}>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-3 lowercase text-zinc-900">contact us</h2>
              <p className="text-zinc-600 mb-6 text-sm sm:text-base font-normal">
                Have feedback or need support with study materials? Drop us a line.
              </p>
            </div>

            {/* Form fields enter from Right */}
            <form onSubmit={(e) => e.preventDefault()} className={`flex flex-col gap-4 text-left ${isContactVisible ? 'animate-contact-form' : 'opacity-0'}`}>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-zinc-700">Your Name</label>
                <input 
                  type="text" 
                  placeholder="Mir Shaharyar" 
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-zinc-700">Email Address</label>
                <input 
                  type="email" 
                  placeholder="student@buitems.edu.pk" 
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-zinc-700">Message</label>
                <textarea 
                  rows="3" 
                  placeholder="How can we help?" 
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none"
                ></textarea>
              </div>

              {/* Send Message button enters from Bottom */}
              <div className={isContactVisible ? 'animate-contact-button' : 'opacity-0'}>
                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm transition-all shadow-md active:scale-95"
                >
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

          </div>
        </section>

      </div>
    </div>
  );
}


//12th edit

// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import Link from 'next/link';
// import Navbar from '@/components/layout/Navbar';
// import { Sparkles, Send, Flame, Cpu, ShieldCheck } from 'lucide-react';

// export default function Home() {
//   const [activeSection, setActiveSection] = useState(0);
//   const [isAutoScrolling, setIsAutoScrolling] = useState(true);
//   const sectionsCount = 3;

//   // Intersection Observer states for triggerable section animations
//   const [isHeroVisible, setIsHeroVisible] = useState(false);
//   const [isAboutVisible, setIsAboutVisible] = useState(false);
//   const [isContactVisible, setIsContactVisible] = useState(false);

//   const heroRef = useRef(null);
//   const aboutRef = useRef(null);
//   const contactRef = useRef(null);

//   useEffect(() => {
//     const observerOptions = {
//       root: null,
//       threshold: 0.5, // Triggers when 50% of the section is visible
//     };

//     const handleIntersect = (entries, observer) => {
//       entries.forEach((entry) => {
//         if (entry.isIntersecting) {
//           if (entry.target.id === 'section-0') setIsHeroVisible(true);
//           if (entry.target.id === 'section-1') setIsAboutVisible(true);
//           if (entry.target.id === 'section-2') setIsContactVisible(true);
//         }
//       });
//     };

//     const observer = new IntersectionObserver(handleIntersect, observerOptions);

//     if (heroRef.current) observer.observe(heroRef.current);
//     if (aboutRef.current) observer.observe(aboutRef.current);
//     if (contactRef.current) observer.observe(contactRef.current);

//     return () => observer.disconnect();
//   }, []);

//   useEffect(() => {
//     if (!isAutoScrolling) return;

//     const interval = setInterval(() => {
//       setActiveSection((prev) => {
//         if (prev < sectionsCount - 1) {
//           return prev + 1;
//         } else {
//           setIsAutoScrolling(false);
//           clearInterval(interval);
//           return prev;
//         }
//       });
//     }, 2000);

//     return () => clearInterval(interval);
//   }, [isAutoScrolling, sectionsCount]);

//   useEffect(() => {
//     const element = document.getElementById(`section-${activeSection}`);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [activeSection]);

//   const handleManualScroll = () => {
//     if (isAutoScrolling) {
//       setIsAutoScrolling(false);
//     }
//   };

//   return (
//     <div 
//       onWheel={handleManualScroll}
//       onTouchStart={handleManualScroll}
//       className="min-h-screen font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white transition-colors duration-200 relative flex flex-col bg-[#030305] text-zinc-100"
//     >
//       <style jsx global>{`
//         @keyframes slideInLeft {
//           0% {
//             opacity: 0;
//             transform: translateX(-50px);
//           }
//           100% {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }

//         @keyframes slideInRight {
//           0% {
//             opacity: 0;
//             transform: translateX(50px);
//           }
//           100% {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }

//         /* Hero Section Animation Classes */
//         .animate-box-first {
//           animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
//         }

//         .animate-heading-second {
//           opacity: 0;
//           animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
//         }

//         .animate-text-third {
//           opacity: 0;
//           animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
//         }

//         /* About Section Animation Classes */
//         .animate-about-header {
//           opacity: 0;
//           animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
//         }

//         .animate-box-right {
//           opacity: 0;
//           animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
//         }

//         .animate-box-mid {
//           opacity: 0;
//           animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
//         }

//         .animate-box-left {
//           opacity: 0;
//           animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
//         }
//       `}</style>

//       {/* Background ambient cosmic glow */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/10 blur-[180px] rounded-full pointer-events-none" />

//       {/* Clean Navbar Wrapper */}
//       <div className="w-full relative z-50 pt-4">
//         <Navbar />
//       </div>

//       <div className="flex-1 h-[calc(100vh-5rem)] overflow-y-scroll snap-y snap-mandatory relative z-10">
        
//         {/* PAGE 1: HERO SECTION */}
//         <section id="section-0" ref={heroRef} className="min-h-full snap-start flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 pt-16">
//           <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
//             {/* LEFT CONTENT COLUMN */}
//             <div className="lg:col-span-7 space-y-8 text-left">

//               <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[1.08] lowercase ${isHeroVisible ? 'animate-heading-second' : 'opacity-0'}`}>
//                 decentralization <br />
//                 meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-red-500">ai agents</span>
//               </h1>

//               <div className={`space-y-8 ${isHeroVisible ? 'animate-text-third' : 'opacity-0'}`}>
//                 <div className="grid grid-cols-2 gap-8 pt-2 border-t border-zinc-800 max-w-md">
//                   <div>
//                     <div className="text-3xl sm:text-4xl font-bold tracking-tight">12+</div>
//                     <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1">projects built</div>
//                   </div>
//                   <div>
//                     <div className="text-3xl sm:text-4xl font-bold tracking-tight">1002+</div>
//                     <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1">startups funded</div>
//                   </div>
//                 </div>

//                 <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed font-normal">
//                   Welcome to the future of technology where decentralization meets the power of AI agents! Our innovative SaaS service is designed to revolutionize the way businesses operate.
//                 </p>

//                 <div className="flex flex-wrap items-center gap-4 pt-2">
//                   <Link
//                     href="/signup"
//                     className="px-7 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-all shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95"
//                   >
//                     case studies.
//                   </Link>

//                   <Link
//                     href="/docs"
//                     className="px-7 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-white font-semibold text-sm transition-all backdrop-blur-md active:scale-95"
//                   >
//                     documentation.
//                   </Link>
//                 </div>
//               </div>

//             </div>

//             {/* RIGHT BOX */}
//             <div className="lg:col-span-5 relative flex items-center justify-center">
//               <div className={`relative w-full aspect-square max-w-[460px] flex items-center justify-center ${isHeroVisible ? 'animate-box-first' : 'opacity-0'}`}>
                
//                 <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-amber-600/20 to-red-600/10 rounded-full blur-3xl animate-pulse" />

//                 <div className="relative w-full h-full rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-2xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden group">
                  
//                   <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
//                     <div className="flex items-center gap-2">
//                       <div className="w-3 h-3 rounded-full bg-red-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-green-500/80" />
//                     </div>
//                     <span className="text-xs font-mono text-zinc-500">fiery_ai_core.tsx</span>
//                   </div>

//                   <div className="my-auto py-10 relative flex items-center justify-center">
//                     <div className="absolute w-52 h-52 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-3xl opacity-25 animate-ping" />
//                     <div className="relative z-10 w-44 h-44 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-600 to-red-500 p-[1px] shadow-[0_0_35px_rgba(249,115,22,0.6)] rotate-6 group-hover:rotate-12 transition-transform duration-700">
//                       <div className="w-full h-full bg-[#030305] rounded-3xl flex flex-col items-center justify-center p-4 text-center">
//                         <Flame className="w-12 h-12 text-orange-400 mb-2 animate-bounce" />
//                         <span className="text-xs font-semibold tracking-widest text-white">BUITEMS AI</span>
//                         <span className="text-[10px] text-orange-400 mt-1">Cosmic Orange Engine</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
//                       <ShieldCheck className="w-4 h-4" />
//                     </div>
//                     <div>
//                       <div className="text-xs font-semibold">Active Fiery Nodes</div>
//                       <div className="text-[10px] text-zinc-400">Optimized GPU Processing</div>
//                     </div>
//                   </div>

//                 </div>

//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 2: ABOUT / HIGHLIGHTS */}
//         <section id="section-1" ref={aboutRef} className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12 bg-zinc-900/30 backdrop-blur-sm">
//           <div className="max-w-5xl mx-auto text-center w-full">
            
//             {/* Header enters from Right when scrolled */}
//             <div className={isAboutVisible ? 'animate-about-header' : 'opacity-0'}>
//               <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] mb-3 lowercase">about the platform</h2>
//               <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-sm sm:text-base font-normal">
//                 Designed specifically to tackle university coursework hurdles using intelligent context expansion.
//               </p>
//             </div>

//             {/* 3 Boxes Sequence: Right -> Mid -> Left */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mb-10">
              
//               {/* Box 3 (Leftmost box) */}
//               <div className={`p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group ${isAboutVisible ? 'animate-box-left' : 'opacity-0'}`}>
//                 <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl w-fit mb-4 border border-orange-500/20 group-hover:scale-110 transition-transform">
//                   <Cpu className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">paste half notes</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   Input rough classroom sentences to generate complete frameworks.
//                 </p>
//               </div>

//               {/* Box 2 (Mid box) */}
//               <div className={`p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group ${isAboutVisible ? 'animate-box-mid' : 'opacity-0'}`}>
//                 <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform">
//                   <Sparkles className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">strict subject scope</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   AI stays strictly within your academic syllabus parameters.
//                 </p>
//               </div>

//               {/* Box 1 (Most right box) */}
//               <div className={`p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group ${isAboutVisible ? 'animate-box-right' : 'opacity-0'}`}>
//                 <div className="p-3 bg-red-500/10 text-red-400 rounded-xl w-fit mb-4 border border-red-500/20 group-hover:scale-110 transition-transform">
//                   <ShieldCheck className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">instant output</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   Receive comprehensive summaries ready for exam prep.
//                 </p>
//               </div>

//             </div>

//             <div className="w-full overflow-hidden py-3.5 border-y border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
//               <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-orange-400/90">
//                 <span>⚡ JAVASCRIPT</span>
//                 <span>•</span>
//                 <span>🎯 NEXTJS</span>
//                 <span>•</span>
//                 <span>🚀 REACT</span>
//                 <span>•</span>
//                 <span>📚 EXPRESS JS</span>
//                 <span>•</span>
//                 <span>⚡ NODE JS</span>
//                 <span>•</span>
//                 <span>🎯 TAILWIND CSS</span>
//                 <span>•</span>
//                 <span>🚀 AI INTEGRATION</span>
//                 <span>•</span>
//                 <span>HTML</span>
//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 3: CONTACT US */}
//         <section id="section-2" ref={contactRef} className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12">
//           <div className="max-w-xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] mb-3 lowercase">contact us</h2>
//             <p className="text-zinc-400 mb-6 text-sm sm:text-base font-normal">
//               Have feedback or need support with study materials? Drop us a line.
//             </p>

//             <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 text-left">
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Your Name</label>
//                 <input type="text" placeholder="Mir Shaharyar" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Email Address</label>
//                 <input type="email" placeholder="student@buitems.edu.pk" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Message</label>
//                 <textarea rows="3" placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"></textarea>
//               </div>
//               <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95">
//                 <span>Send Message</span>
//                 <Send className="w-4 h-4" />
//               </button>
//             </form>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// }






//11th edit

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Navbar from '@/components/layout/Navbar';
// import { Sparkles, Send, Flame, Cpu, ShieldCheck } from 'lucide-react';

// export default function Home() {
//   const [activeSection, setActiveSection] = useState(0);
//   const [isAutoScrolling, setIsAutoScrolling] = useState(true);
//   const sectionsCount = 3;

//   useEffect(() => {
//     if (!isAutoScrolling) return;

//     const interval = setInterval(() => {
//       setActiveSection((prev) => {
//         if (prev < sectionsCount - 1) {
//           return prev + 1;
//         } else {
//           setIsAutoScrolling(false);
//           clearInterval(interval);
//           return prev;
//         }
//       });
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [isAutoScrolling, sectionsCount]);

//   useEffect(() => {
//     const element = document.getElementById(`section-${activeSection}`);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [activeSection]);

//   const handleManualScroll = () => {
//     if (isAutoScrolling) {
//       setIsAutoScrolling(false);
//     }
//   };

//   return (
//     <div 
//       onWheel={handleManualScroll}
//       onTouchStart={handleManualScroll}
//       className="min-h-screen font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white transition-colors duration-200 relative flex flex-col bg-[#030305] text-zinc-100"
//     >
//       {/* Custom Keyframe Animations with Sequence Delays */}
//       <style jsx global>{`
//         @keyframes slideInLeft {
//           0% {
//             opacity: 0;
//             transform: translateX(-50px);
//           }
//           100% {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }

//         @keyframes slideInRight {
//           0% {
//             opacity: 0;
//             transform: translateX(50px);
//           }
//           100% {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }

//         .animate-box-first {
//           animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
//         }

//         .animate-heading-second {
//           opacity: 0;
//           animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
//         }

//         .animate-text-third {
//           opacity: 0;
//           animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards;
//         }
//       `}</style>

//       {/* Background fiery orange ambient cosmic glow */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/10 blur-[180px] rounded-full pointer-events-none" />

//       {/* Clean Navbar Wrapper */}
//       <div className="w-full relative z-50 pt-4">
//         <Navbar />
//       </div>

//       <div className="flex-1 h-[calc(100vh-5rem)] overflow-y-scroll snap-y snap-mandatory relative z-10">
        
//         {/* PAGE 1: HERO SECTION */}
//         <section id="section-0" className="min-h-full snap-start flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 pt-16">
//           <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
//             {/* LEFT CONTENT COLUMN */}
//             <div className="lg:col-span-7 space-y-8 text-left">

//               {/* 2nd Step: Heading Enters from Left */}
//               <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[1.08] lowercase animate-heading-second">
//                 decentralization <br />
//                 meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-red-500">ai agents</span>
//               </h1>

//               {/* 3rd Step: Remaining Text, Stats & Buttons Enter from Left */}
//               <div className="space-y-8 animate-text-third">
//                 <div className="grid grid-cols-2 gap-8 pt-2 border-t border-zinc-800 max-w-md">
//                   <div>
//                     <div className="text-3xl sm:text-4xl font-bold tracking-tight">12+</div>
//                     <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1">projects built</div>
//                   </div>
//                   <div>
//                     <div className="text-3xl sm:text-4xl font-bold tracking-tight">1002+</div>
//                     <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1">startups funded</div>
//                   </div>
//                 </div>

//                 <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed font-normal">
//                   Welcome to the future of technology where decentralization meets the power of AI agents! Our innovative SaaS service is designed to revolutionize the way businesses operate.
//                 </p>

//                 <div className="flex flex-wrap items-center gap-4 pt-2">
//                   <Link
//                     href="/signup"
//                     className="px-7 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-all shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95"
//                   >
//                     case studies.
//                   </Link>

//                   <Link
//                     href="/docs"
//                     className="px-7 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-white font-semibold text-sm transition-all backdrop-blur-md active:scale-95"
//                   >
//                     documentation.
//                   </Link>
//                 </div>
//               </div>

//             </div>

//             {/* 1st Step: RIGHT BOX ENTERS FIRST */}
//             <div className="lg:col-span-5 relative flex items-center justify-center animate-box-first">
//               <div className="relative w-full aspect-square max-w-[460px] flex items-center justify-center">
                
//                 <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-amber-600/20 to-red-600/10 rounded-full blur-3xl animate-pulse" />

//                 <div className="relative w-full h-full rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-2xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden group">
                  
//                   <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
//                     <div className="flex items-center gap-2">
//                       <div className="w-3 h-3 rounded-full bg-red-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-green-500/80" />
//                     </div>
//                     <span className="text-xs font-mono text-zinc-500">fiery_ai_core.tsx</span>
//                   </div>

//                   <div className="my-auto py-10 relative flex items-center justify-center">
//                     <div className="absolute w-52 h-52 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-3xl opacity-25 animate-ping" />
//                     <div className="relative z-10 w-44 h-44 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-600 to-red-500 p-[1px] shadow-[0_0_35px_rgba(249,115,22,0.6)] rotate-6 group-hover:rotate-12 transition-transform duration-700">
//                       <div className="w-full h-full bg-[#030305] rounded-3xl flex flex-col items-center justify-center p-4 text-center">
//                         <Flame className="w-12 h-12 text-orange-400 mb-2 animate-bounce" />
//                         <span className="text-xs font-semibold tracking-widest text-white">BUITEMS AI</span>
//                         <span className="text-[10px] text-orange-400 mt-1">Cosmic Orange Engine</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
//                       <ShieldCheck className="w-4 h-4" />
//                     </div>
//                     <div>
//                       <div className="text-xs font-semibold">Active Fiery Nodes</div>
//                       <div className="text-[10px] text-zinc-400">Optimized GPU Processing</div>
//                     </div>
//                   </div>

//                 </div>

//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 2: ABOUT / HIGHLIGHTS */}
//         <section id="section-1" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12 bg-zinc-900/30 backdrop-blur-sm">
//           <div className="max-w-5xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] mb-3 lowercase">about the platform</h2>
//             <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-sm sm:text-base font-normal">
//               Designed specifically to tackle university coursework hurdles using intelligent context expansion.
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mb-10">
//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl w-fit mb-4 border border-orange-500/20 group-hover:scale-110 transition-transform">
//                   <Cpu className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">paste half notes</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   Input rough classroom sentences to generate complete frameworks.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform">
//                   <Sparkles className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">strict subject scope</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   AI stays strictly within your academic syllabus parameters.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-red-500/10 text-red-400 rounded-xl w-fit mb-4 border border-red-500/20 group-hover:scale-110 transition-transform">
//                   <ShieldCheck className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">instant output</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   Receive comprehensive summaries ready for exam prep.
//                 </p>
//               </div>
//             </div>

//             <div className="w-full overflow-hidden py-3.5 border-y border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
//               <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-orange-400/90">
//                 <span>⚡ JAVASCRIPT</span>
//                 <span>•</span>
//                 <span>🎯 NEXTJS</span>
//                 <span>•</span>
//                 <span>🚀 REACT</span>
//                 <span>•</span>
//                 <span>📚 EXPRESS JS</span>
//                 <span>•</span>
//                 <span>⚡ NODE JS</span>
//                 <span>•</span>
//                 <span>🎯 TAILWIND CSS</span>
//                 <span>•</span>
//                 <span>🚀 AI INTEGRATION</span>
//                 <span>•</span>
//                 <span>HTML</span>
//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 3: CONTACT US */}
//         <section id="section-2" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12">
//           <div className="max-w-xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] mb-3 lowercase">contact us</h2>
//             <p className="text-zinc-400 mb-6 text-sm sm:text-base font-normal">
//               Have feedback or need support with study materials? Drop us a line.
//             </p>

//             <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 text-left">
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Your Name</label>
//                 <input type="text" placeholder="Mir Shaharyar" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Email Address</label>
//                 <input type="email" placeholder="student@buitems.edu.pk" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Message</label>
//                 <textarea rows="3" placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"></textarea>
//               </div>
//               <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95">
//                 <span>Send Message</span>
//                 <Send className="w-4 h-4" />
//               </button>
//             </form>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// }




//10 th edit

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Navbar from '@/components/layout/Navbar';
// import { Sparkles, Send, Flame, Cpu, ShieldCheck } from 'lucide-react';

// export default function Home() {
//   const [activeSection, setActiveSection] = useState(0);
//   const [isAutoScrolling, setIsAutoScrolling] = useState(true);
//   const sectionsCount = 3;

//   useEffect(() => {
//     if (!isAutoScrolling) return;

//     const interval = setInterval(() => {
//       setActiveSection((prev) => {
//         if (prev < sectionsCount - 1) {
//           return prev + 1;
//         } else {
//           setIsAutoScrolling(false);
//           clearInterval(interval);
//           return prev;
//         }
//       });
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [isAutoScrolling, sectionsCount]);

//   useEffect(() => {
//     const element = document.getElementById(`section-${activeSection}`);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [activeSection]);

//   const handleManualScroll = () => {
//     if (isAutoScrolling) {
//       setIsAutoScrolling(false);
//     }
//   };

//   return (
//     <div 
//       onWheel={handleManualScroll}
//       onTouchStart={handleManualScroll}
//       className="min-h-screen font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white transition-colors duration-200 relative flex flex-col bg-[#030305] text-zinc-100"
//     >
//       {/* Inline custom CSS for slide-in entry animations */}
//       <style jsx global>{`
//         @keyframes slideInLeft {
//           0% {
//             opacity: 0;
//             transform: translateX(-50px);
//           }
//           100% {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }

//         @keyframes slideInRight {
//           0% {
//             opacity: 0;
//             transform: translateX(50px);
//           }
//           100% {
//             opacity: 1;
//             transform: translateX(0);
//           }
//         }

//         .animate-slide-left {
//           animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
//         }

//         .animate-slide-right {
//           animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
//         }
//       `}</style>

//       {/* Background fiery orange ambient cosmic glow */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/10 blur-[180px] rounded-full pointer-events-none" />

//       {/* Clean Navbar Wrapper positioned cleanly at the top */}
//       <div className="w-full relative z-50 pt-4">
//         <Navbar />
//       </div>

//       <div className="flex-1 h-[calc(100vh-5rem)] overflow-y-scroll snap-y snap-mandatory relative z-10">
        
//         {/* PAGE 1: HERO SECTION */}
//         <section id="section-0" className="min-h-full snap-start flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 pt-16">
//           <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
//             {/* LEFT CONTENT WITH SLIDE-IN FROM LEFT */}
//             <div className="lg:col-span-7 space-y-8 text-left animate-slide-left">

//               <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[1.08] lowercase">
//                 decentralization <br />
//                 meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-red-500">ai agents</span>
//               </h1>

//               <div className="grid grid-cols-2 gap-8 pt-2 border-t border-zinc-800 max-w-md">
//                 <div>
//                   <div className="text-3xl sm:text-4xl font-bold tracking-tight">12+</div>
//                   <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1">projects built</div>
//                 </div>
//                 <div>
//                   <div className="text-3xl sm:text-4xl font-bold tracking-tight">1002+</div>
//                   <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1">startups funded</div>
//                 </div>
//               </div>

//               <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed font-normal">
//                 Welcome to the future of technology where decentralization meets the power of AI agents! Our innovative SaaS service is designed to revolutionize the way businesses operate.
//               </p>

//               <div className="flex flex-wrap items-center gap-4 pt-2">
//                 <Link
//                   href="/signup"
//                   className="px-7 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-all shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95"
//                 >
//                   case studies.
//                 </Link>

//                 <Link
//                   href="/docs"
//                   className="px-7 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-white font-semibold text-sm transition-all backdrop-blur-md active:scale-95"
//                 >
//                   documentation.
//                 </Link>
//               </div>

//             </div>

//             {/* RIGHT BOX WITH SLIDE-IN FROM RIGHT */}
//             <div className="lg:col-span-5 relative flex items-center justify-center animate-slide-right">
//               <div className="relative w-full aspect-square max-w-[460px] flex items-center justify-center">
                
//                 <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-amber-600/20 to-red-600/10 rounded-full blur-3xl animate-pulse" />

//                 <div className="relative w-full h-full rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-2xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden group">
                  
//                   <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
//                     <div className="flex items-center gap-2">
//                       <div className="w-3 h-3 rounded-full bg-red-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-green-500/80" />
//                     </div>
//                     <span className="text-xs font-mono text-zinc-500">fiery_ai_core.tsx</span>
//                   </div>

//                   <div className="my-auto py-10 relative flex items-center justify-center">
//                     <div className="absolute w-52 h-52 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-3xl opacity-25 animate-ping" />
//                     <div className="relative z-10 w-44 h-44 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-600 to-red-500 p-[1px] shadow-[0_0_35px_rgba(249,115,22,0.6)] rotate-6 group-hover:rotate-12 transition-transform duration-700">
//                       <div className="w-full h-full bg-[#030305] rounded-3xl flex flex-col items-center justify-center p-4 text-center">
//                         <Flame className="w-12 h-12 text-orange-400 mb-2 animate-bounce" />
//                         <span className="text-xs font-semibold tracking-widest text-white">BUITEMS AI</span>
//                         <span className="text-[10px] text-orange-400 mt-1">Cosmic Orange Engine</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
//                       <ShieldCheck className="w-4 h-4" />
//                     </div>
//                     <div>
//                       <div className="text-xs font-semibold">Active Fiery Nodes</div>
//                       <div className="text-[10px] text-zinc-400">Optimized GPU Processing</div>
//                     </div>
//                   </div>

//                 </div>

//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 2: ABOUT / HIGHLIGHTS */}
//         <section id="section-1" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12 bg-zinc-900/30 backdrop-blur-sm">
//           <div className="max-w-5xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] mb-3 lowercase">about the platform</h2>
//             <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-sm sm:text-base font-normal">
//               Designed specifically to tackle university coursework hurdles using intelligent context expansion.
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mb-10">
//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl w-fit mb-4 border border-orange-500/20 group-hover:scale-110 transition-transform">
//                   <Cpu className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">paste half notes</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   Input rough classroom sentences to generate complete frameworks.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform">
//                   <Sparkles className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">strict subject scope</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   AI stays strictly within your academic syllabus parameters.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-red-500/10 text-red-400 rounded-xl w-fit mb-4 border border-red-500/20 group-hover:scale-110 transition-transform">
//                   <ShieldCheck className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">instant output</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   Receive comprehensive summaries ready for exam prep.
//                 </p>
//               </div>
//             </div>

//             <div className="w-full overflow-hidden py-3.5 border-y border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
//               <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-orange-400/90">
//                 <span>⚡ JAVASCRIPT</span>
//                 <span>•</span>
//                 <span>🎯 NEXTJS</span>
//                 <span>•</span>
//                 <span>🚀 REACT</span>
//                 <span>•</span>
//                 <span>📚 EXPRESS JS</span>
//                 <span>•</span>
//                 <span>⚡ NODE JS</span>
//                 <span>•</span>
//                 <span>🎯 TAILWIND CSS</span>
//                 <span>•</span>
//                 <span>🚀 AI INTEGRATION</span>
//                 <span>•</span>
//                 <span>HTML</span>
//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 3: CONTACT US */}
//         <section id="section-2" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12">
//           <div className="max-w-xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] mb-3 lowercase">contact us</h2>
//             <p className="text-zinc-400 mb-6 text-sm sm:text-base font-normal">
//               Have feedback or need support with study materials? Drop us a line.
//             </p>

//             <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 text-left">
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Your Name</label>
//                 <input type="text" placeholder="Mir Shaharyar" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Email Address</label>
//                 <input type="email" placeholder="student@buitems.edu.pk" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Message</label>
//                 <textarea rows="3" placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"></textarea>
//               </div>
//               <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95">
//                 <span>Send Message</span>
//                 <Send className="w-4 h-4" />
//               </button>
//             </form>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// }


//9th edit

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Navbar from '@/components/layout/Navbar';
// import { Sparkles, Send, Flame, Cpu, ShieldCheck } from 'lucide-react';

// export default function Home() {
//   const [activeSection, setActiveSection] = useState(0);
//   const [isAutoScrolling, setIsAutoScrolling] = useState(true);
//   const sectionsCount = 3;

//   useEffect(() => {
//     if (!isAutoScrolling) return;

//     const interval = setInterval(() => {
//       setActiveSection((prev) => {
//         if (prev < sectionsCount - 1) {
//           return prev + 1;
//         } else {
//           setIsAutoScrolling(false);
//           clearInterval(interval);
//           return prev;
//         }
//       });
//     }, 1500);

//     return () => clearInterval(interval);
//   }, [isAutoScrolling, sectionsCount]);

//   useEffect(() => {
//     const element = document.getElementById(`section-${activeSection}`);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [activeSection]);

//   const handleManualScroll = () => {
//     if (isAutoScrolling) {
//       setIsAutoScrolling(false);
//     }
//   };

//   return (
//     <div 
//       onWheel={handleManualScroll}
//       onTouchStart={handleManualScroll}
//       className="min-h-screen font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white transition-colors duration-200 relative flex flex-col"
//     >
//       {/* Background fiery orange ambient cosmic glow */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/10 blur-[180px] rounded-full pointer-events-none" />

//       {/* Clean Navbar Wrapper positioned cleanly at the top */}
//       <div className="w-full relative z-50 pt-4">
//         <Navbar />
//       </div>

//       <div className="flex-1 h-[calc(100vh-5rem)] overflow-y-scroll snap-y snap-mandatory relative z-10">
        
//         {/* PAGE 1: HERO SECTION */}
//         <section id="section-0" className="min-h-full snap-start flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 pt-16">
//           <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
//             <div className="lg:col-span-7 space-y-8 text-left">

//               {/* Clean reference font styling without extra heavy bulkiness */}
//               <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[1.08] lowercase">
//                 decentralization <br />
//                 meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-red-500">ai agents</span>
//               </h1>

//               <div className="grid grid-cols-2 gap-8 pt-2 border-t border-zinc-800 max-w-md">
//                 <div>
//                   <div className="text-3xl sm:text-4xl font-bold tracking-tight">12+</div>
//                   <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1">projects built</div>
//                 </div>
//                 <div>
//                   <div className="text-3xl sm:text-4xl font-bold tracking-tight">1002+</div>
//                   <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1">startups funded</div>
//                 </div>
//               </div>

//               <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed font-normal">
//                 Welcome to the future of technology where decentralization meets the power of AI agents! Our innovative SaaS service is designed to revolutionize the way businesses operate.
//               </p>

//               <div className="flex flex-wrap items-center gap-4 pt-2">
//                 <Link
//                   href="/signup"
//                   className="px-7 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-all shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:scale-[1.02]"
//                 >
//                   case studies.
//                 </Link>

//               <Link
//   href="/docs"
//   className="px-7 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-white font-semibold text-sm transition-all backdrop-blur-md"
// >
//   documentation.
// </Link>
//               </div>

//             </div>

//             <div className="lg:col-span-5 relative flex items-center justify-center">
//               <div className="relative w-full aspect-square max-w-[460px] flex items-center justify-center">
                
//                 <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-amber-600/20 to-red-600/10 rounded-full blur-3xl animate-pulse" />

//                 <div className="relative w-full h-full rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-2xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden group">
                  
//                   <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
//                     <div className="flex items-center gap-2">
//                       <div className="w-3 h-3 rounded-full bg-red-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-green-500/80" />
//                     </div>
//                     <span className="text-xs font-mono text-zinc-500">fiery_ai_core.tsx</span>
//                   </div>

//                   <div className="my-auto py-10 relative flex items-center justify-center">
//                     <div className="absolute w-52 h-52 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-3xl opacity-25 animate-ping" />
//                     <div className="relative z-10 w-44 h-44 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-600 to-red-500 p-[1px] shadow-[0_0_35px_rgba(249,115,22,0.6)] rotate-6 group-hover:rotate-12 transition-transform duration-700">
//                       <div className="w-full h-full bg-[#030305] rounded-3xl flex flex-col items-center justify-center p-4 text-center">
//                         <Flame className="w-12 h-12 text-orange-400 mb-2 animate-bounce" />
//                         <span className="text-xs font-semibold tracking-widest text-white">BUITEMS AI</span>
//                         <span className="text-[10px] text-orange-400 mt-1">Cosmic Orange Engine</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
//                       <ShieldCheck className="w-4 h-4" />
//                     </div>
//                     <div>
//                       <div className="text-xs font-semibold">Active Fiery Nodes</div>
//                       <div className="text-[10px] text-zinc-400">Optimized GPU Processing</div>
//                     </div>
//                   </div>

//                 </div>

//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 2: ABOUT / HIGHLIGHTS */}
//         <section id="section-1" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12 bg-zinc-900/30 backdrop-blur-sm">
//           <div className="max-w-5xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] mb-3 lowercase">about the platform</h2>
//             <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-sm sm:text-base font-normal">
//               Designed specifically to tackle university coursework hurdles using intelligent context expansion.
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mb-10">
//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl w-fit mb-4 border border-orange-500/20 group-hover:scale-110 transition-transform">
//                   <Cpu className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">paste half notes</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   Input rough classroom sentences to generate complete frameworks.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform">
//                   <Sparkles className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">strict subject scope</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   AI stays strictly within your academic syllabus parameters.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-red-500/10 text-red-400 rounded-xl w-fit mb-4 border border-red-500/20 group-hover:scale-110 transition-transform">
//                   <ShieldCheck className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">instant output</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   Receive comprehensive summaries ready for exam prep.
//                 </p>
//               </div>
//             </div>

//             <div className="w-full overflow-hidden py-3.5 border-y border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
//               <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-orange-400/90">
//                 <span>⚡ JAVASCRIPT</span>
//                 <span>•</span>
//                 <span>🎯 NEXTJS</span>
//                 <span>•</span>
//                 <span>🚀 REACT</span>
//                 <span>•</span>
//                 <span>📚 EXPRESS JS</span>
//                 <span>•</span>
//                 <span>⚡ NODE JS</span>
//                 <span>•</span>
//                 <span>🎯 TAILWIND CSS</span>
//                 <span>•</span>
//                 <span>🚀 AI INTEGRATION</span>
//                 <span>•</span>
//                 <span>HTML</span>
//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 3: CONTACT US */}
//         <section id="section-2" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12">
//           <div className="max-w-xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] mb-3 lowercase">contact us</h2>
//             <p className="text-zinc-400 mb-6 text-sm sm:text-base font-normal">
//               Have feedback or need support with study materials? Drop us a line.
//             </p>

//             <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 text-left">
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Your Name</label>
//                 <input type="text" placeholder="Mir Shaharyar" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Email Address</label>
//                 <input type="email" placeholder="student@buitems.edu.pk" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Message</label>
//                 <textarea rows="3" placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"></textarea>
//               </div>
//               <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]">
//                 <span>Send Message</span>
//                 <Send className="w-4 h-4" />
//               </button>
//             </form>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// }


















//8th edit

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Navbar from '@/components/layout/Navbar';
// import { Sparkles, Send, Flame, Cpu, ShieldCheck } from 'lucide-react';

// export default function Home() {
//   const [activeSection, setActiveSection] = useState(0);
//   const [isAutoScrolling, setIsAutoScrolling] = useState(true);
//   const sectionsCount = 3;

//   useEffect(() => {
//     if (!isAutoScrolling) return;

//     const interval = setInterval(() => {
//       setActiveSection((prev) => {
//         if (prev < sectionsCount - 1) {
//           return prev + 1;
//         } else {
//           setIsAutoScrolling(false);
//           clearInterval(interval);
//           return prev;
//         }
//       });
//     }, 1500);

//     return () => clearInterval(interval);
//   }, [isAutoScrolling, sectionsCount]);

//   useEffect(() => {
//     const element = document.getElementById(`section-${activeSection}`);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [activeSection]);

//   const handleManualScroll = () => {
//     if (isAutoScrolling) {
//       setIsAutoScrolling(false);
//     }
//   };

//   return (
//     <div 
//       onWheel={handleManualScroll}
//       onTouchStart={handleManualScroll}
//       className="min-h-screen font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white transition-colors duration-200 relative"
//     >
//       {/* Background fiery orange ambient cosmic glow */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/10 blur-[180px] rounded-full pointer-events-none" />

//       <Navbar />

//       <div className="h-[calc(100vh-4rem)] overflow-y-scroll snap-y snap-mandatory relative z-10">
        
//         {/* PAGE 1: HERO SECTION */}
//         <section id="section-0" className="min-h-full snap-start flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
//           <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
//             <div className="lg:col-span-7 space-y-8 text-left">
// {/*               
//               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 text-xs font-medium bg-orange-950/40 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)] backdrop-blur-md">
//                 <Sparkles className="w-3.5 h-3.5 animate-pulse" />
//                 <span>BUITEMS Study AI Agent Ecosystem</span>
//               </div> */}

//               {/* Clean reference font styling without extra heavy bulkiness */}
//               <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[1.08] lowercase">
//                 decentralization <br />
//                 meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-red-500">ai agents</span>
//               </h1>

//               <div className="grid grid-cols-2 gap-8 pt-2 border-t border-zinc-800 max-w-md">
//                 <div>
//                   <div className="text-3xl sm:text-4xl font-bold tracking-tight">12+</div>
//                   <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1">projects built</div>
//                 </div>
//                 <div>
//                   <div className="text-3xl sm:text-4xl font-bold tracking-tight">1002+</div>
//                   <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1">startups funded</div>
//                 </div>
//               </div>

//               <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed font-normal">
//                 Welcome to the future of technology where decentralization meets the power of AI agents! Our innovative SaaS service is designed to revolutionize the way businesses operate.
//               </p>

//               <div className="flex flex-wrap items-center gap-4 pt-2">
//                 <Link
//                   href="/signup"
//                   className="px-7 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-all shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:scale-[1.02]"
//                 >
//                   case studies.
//                 </Link>

//                 <Link
//                   href="/dashboard"
//                   className="px-7 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-white font-semibold text-sm transition-all backdrop-blur-md"
//                 >
//                   documentation.
//                 </Link>
//               </div>

//             </div>

//             <div className="lg:col-span-5 relative flex items-center justify-center">
//               <div className="relative w-full aspect-square max-w-[460px] flex items-center justify-center">
                
//                 <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-amber-600/20 to-red-600/10 rounded-full blur-3xl animate-pulse" />

//                 <div className="relative w-full h-full rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-2xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden group">
                  
//                   <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
//                     <div className="flex items-center gap-2">
//                       <div className="w-3 h-3 rounded-full bg-red-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-green-500/80" />
//                     </div>
//                     <span className="text-xs font-mono text-zinc-500">fiery_ai_core.tsx</span>
//                   </div>

//                   <div className="my-auto py-10 relative flex items-center justify-center">
//                     <div className="absolute w-52 h-52 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-3xl opacity-25 animate-ping" />
//                     <div className="relative z-10 w-44 h-44 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-600 to-red-500 p-[1px] shadow-[0_0_35px_rgba(249,115,22,0.6)] rotate-6 group-hover:rotate-12 transition-transform duration-700">
//                       <div className="w-full h-full bg-[#030305] rounded-3xl flex flex-col items-center justify-center p-4 text-center">
//                         <Flame className="w-12 h-12 text-orange-400 mb-2 animate-bounce" />
//                         <span className="text-xs font-semibold tracking-widest text-white">BUITEMS AI</span>
//                         <span className="text-[10px] text-orange-400 mt-1">Cosmic Orange Engine</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
//                       <ShieldCheck className="w-4 h-4" />
//                     </div>
//                     <div>
//                       <div className="text-xs font-semibold">Active Fiery Nodes</div>
//                       <div className="text-[10px] text-zinc-400">Optimized GPU Processing</div>
//                     </div>
//                   </div>

//                 </div>

//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 2: ABOUT / HIGHLIGHTS */}
//         <section id="section-1" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12 bg-zinc-900/30 backdrop-blur-sm">
//           <div className="max-w-5xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] mb-3 lowercase">about the platform</h2>
//             <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-sm sm:text-base font-normal">
//               Designed specifically to tackle university coursework hurdles using intelligent context expansion.
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mb-10">
//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl w-fit mb-4 border border-orange-500/20 group-hover:scale-110 transition-transform">
//                   <Cpu className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">paste half notes</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   Input rough classroom sentences to generate complete frameworks.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform">
//                   <Sparkles className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">strict subject scope</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   AI stays strictly within your academic syllabus parameters.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-red-500/10 text-red-400 rounded-xl w-fit mb-4 border border-red-500/20 group-hover:scale-110 transition-transform">
//                   <ShieldCheck className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-semibold text-base sm:text-lg mb-2 lowercase">instant output</h3>
//                 <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
//                   Receive comprehensive summaries ready for exam prep.
//                 </p>
//               </div>
//             </div>

//             <div className="w-full overflow-hidden py-3.5 border-y border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
//               <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-orange-400/90">
//                 <span>⚡ JAVASCRIPT</span>
//                 <span>•</span>
//                 <span>🎯 NEXTJS</span>
//                 <span>•</span>
//                 <span>🚀 REACT</span>
//                 <span>•</span>
//                 <span>📚 EXPRESS JS</span>
//                 <span>•</span>
//                 <span>⚡ NODE JS</span>
//                 <span>•</span>
//                 <span>🎯 TAILWIND CSS</span>
//                 <span>•</span>
//                 <span>🚀 AI INTEGRATION</span>
//                 <span>•</span>
//                 <span>HTML</span>
//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 3: CONTACT US */}
//         <section id="section-2" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12">
//           <div className="max-w-xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] mb-3 lowercase">contact us</h2>
//             <p className="text-zinc-400 mb-6 text-sm sm:text-base font-normal">
//               Have feedback or need support with study materials? Drop us a line.
//             </p>

//             <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 text-left">
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Your Name</label>
//                 <input type="text" placeholder="Mir Shaharyar" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Email Address</label>
//                 <input type="email" placeholder="student@buitems.edu.pk" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-400">Message</label>
//                 <textarea rows="3" placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"></textarea>
//               </div>
//               <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]">
//                 <span>Send Message</span>
//                 <Send className="w-4 h-4" />
//               </button>
//             </form>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// }




//7th edit

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Navbar from '@/components/layout/Navbar';
// import { ArrowRight, Sparkles, Send, Flame, Cpu, ShieldCheck } from 'lucide-react';

// export default function Home() {
//   const [activeSection, setActiveSection] = useState(0);
//   const [isAutoScrolling, setIsAutoScrolling] = useState(true);
//   const sectionsCount = 3;

//   useEffect(() => {
//     if (!isAutoScrolling) return;

//     const interval = setInterval(() => {
//       setActiveSection((prev) => {
//         if (prev < sectionsCount - 1) {
//           return prev + 1;
//         } else {
//           setIsAutoScrolling(false);
//           clearInterval(interval);
//           return prev;
//         }
//       });
//     }, 1500);

//     return () => clearInterval(interval);
//   }, [isAutoScrolling, sectionsCount]);

//   useEffect(() => {
//     const element = document.getElementById(`section-${activeSection}`);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [activeSection]);

//   const handleManualScroll = () => {
//     if (isAutoScrolling) {
//       setIsAutoScrolling(false);
//     }
//   };

//   return (
//     <div 
//       onWheel={handleManualScroll}
//       onTouchStart={handleManualScroll}
//       className="min-h-screen bg-[#030305] text-slate-100 font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white transition-colors duration-200 relative"
//     >
//       {/* Background fiery orange ambient cosmic glow */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/10 blur-[180px] rounded-full pointer-events-none" />

//       <Navbar />

//       <div className="h-[calc(100vh-4rem)] overflow-y-scroll snap-y snap-mandatory relative z-10">
        
//         {/* PAGE 1: EXACT REFERENCE VIDEO HERO SECTION */}
//         <section id="section-0" className="min-h-full snap-start flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
//           <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
//             {/* Left Column: Heading, Stats & Buttons matching reference video */}
//             <div className="lg:col-span-7 space-y-8 text-left">
              
//               {/* Top Badge */}
//               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 text-xs font-semibold bg-orange-950/40 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)] backdrop-blur-md">
//                 <Sparkles className="w-3.5 h-3.5 animate-pulse" />
//                 <span>BUITEMS Study AI Agent Ecosystem</span>
//               </div>

//               {/* Main Heading matching video text */}
//               <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
//                 decentralization <br />
//                 meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-red-500">AI agents</span>
//               </h1>

//               {/* Stats Row exactly like reference image */}
//               <div className="grid grid-cols-2 gap-8 pt-2 border-t border-slate-800/80 max-w-md">
//                 <div>
//                   <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">12+</div>
//                   <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">projects built</div>
//                 </div>
//                 <div>
//                   <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">1002+</div>
//                   <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">startups funded</div>
//                 </div>
//               </div>

//               {/* Description */}
//               <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
//                 Welcome to the future of technology where decentralization meets the power of AI agents! Our innovative SaaS service is designed to revolutionize the way businesses operate.
//               </p>

//               {/* CTA Buttons (case studies. & documentation.) */}
//               <div className="flex flex-wrap items-center gap-4 pt-2">
//                 <Link
//                   href="/signup"
//                   className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-sm transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
//                 >
//                   case studies.
//                 </Link>

//                 <Link
//                   href="/dashboard"
//                   className="px-7 py-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white font-bold text-sm transition-all backdrop-blur-md"
//                 >
//                   documentation.
//                 </Link>
//               </div>

//             </div>

//             {/* Right Column: 3D Fiery Abstract Graphic Mockup matching video */}
//             <div className="lg:col-span-5 relative flex items-center justify-center">
//               <div className="relative w-full aspect-square max-w-[460px] flex items-center justify-center">
                
//                 {/* Glowing aura */}
//                 <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-amber-600/20 to-red-600/10 rounded-full blur-3xl animate-pulse" />

//                 {/* Main Container Card */}
//                 <div className="relative w-full h-full rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-2xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden group">
                  
//                   {/* Header */}
//                   <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
//                     <div className="flex items-center gap-2">
//                       <div className="w-3 h-3 rounded-full bg-red-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
//                       <div className="w-3 h-3 rounded-full bg-green-500/80" />
//                     </div>
//                     <span className="text-xs font-mono text-slate-500">fiery_ai_core.tsx</span>
//                   </div>

//                   {/* Central Rotating Fiery Element */}
//                   <div className="my-auto py-10 relative flex items-center justify-center">
//                     <div className="absolute w-52 h-52 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-3xl opacity-25 animate-ping" />
//                     <div className="relative z-10 w-44 h-44 rounded-3xl bg-gradient-to-br from-orange-500 via-amber-600 to-red-500 p-[1px] shadow-[0_0_35px_rgba(249,115,22,0.6)] rotate-6 group-hover:rotate-12 transition-transform duration-700">
//                       <div className="w-full h-full bg-[#030305] rounded-3xl flex flex-col items-center justify-center p-4 text-center">
//                         <Flame className="w-12 h-12 text-orange-400 mb-2 animate-bounce" />
//                         <span className="text-xs font-bold text-white tracking-widest">BUITEMS AI</span>
//                         <span className="text-[10px] text-orange-400 mt-1">Cosmic Orange Engine</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Bottom Trust Badge Row */}
//                   <div className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-3 flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
//                       <ShieldCheck className="w-4 h-4" />
//                     </div>
//                     <div>
//                       <div className="text-xs font-semibold text-slate-200">Active Fiery Nodes</div>
//                       <div className="text-[10px] text-slate-400">Optimized GPU Processing</div>
//                     </div>
//                   </div>

//                 </div>

//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 2: ABOUT / HIGHLIGHTS SECTION WITH MARQUEE */}
//         <section id="section-1" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12 bg-slate-900/40 backdrop-blur-sm">
//           <div className="max-w-5xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-white">About The Platform</h2>
//             <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm sm:text-base">
//               Designed specifically to tackle university coursework hurdles using intelligent context expansion.
//             </p>

//             {/* Core Feature Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mb-10">
//               <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl w-fit mb-4 border border-orange-500/20 group-hover:scale-110 transition-transform">
//                   <Cpu className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Paste Half Notes</h3>
//                 <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
//                   Input rough classroom sentences to generate complete frameworks.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-4 border border-amber-500/20 group-hover:scale-110 transition-transform">
//                   <Sparkles className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Strict Subject Scope</h3>
//                 <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
//                   AI stays strictly within your academic syllabus parameters.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl hover:border-orange-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-red-500/10 text-red-400 rounded-xl w-fit mb-4 border border-red-500/20 group-hover:scale-110 transition-transform">
//                   <ShieldCheck className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Instant Output</h3>
//                 <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
//                   Receive comprehensive summaries ready for exam prep.
//                 </p>
//               </div>
//             </div>

//             {/* Continuous Marquee Highlights */}
//             <div className="w-full overflow-hidden py-3.5 border-y border-slate-800 bg-slate-950/90 backdrop-blur-md">
//               <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-orange-400/90">
//                 <span>⚡ JAVASCRIPT</span>
//                 <span>•</span>
//                 <span>🎯 NEXTJS</span>
//                 <span>•</span>
//                 <span>🚀 REACT</span>
//                 <span>•</span>
//                 <span>📚 EXPRESS JS</span>
//                 <span>•</span>
//                 <span>⚡ NODE JS</span>
//                 <span>•</span>
//                 <span>🎯 TAILWIND CSS</span>
//                 <span>•</span>
//                 <span>🚀 AI INTEGRATION</span>
//                 <span>•</span>
//                 <span>HTML</span>
//                 <span>•</span>
//                 <span>⚡ JAVASCRIPT</span>
//                 <span>•</span>
//                 <span>🎯 NEXTJS</span>
//                 <span>•</span>
//                 <span>🚀 REACT</span>
//                 <span>•</span>
//                 <span>📚 EXPRESS JS</span>
//                 <span>•</span>
//                 <span>⚡ NODE JS</span>
//                 <span>•</span>
//                 <span>🎯 TAILWIND CSS</span>
//                 <span>•</span>
//                 <span>🚀 AI INTEGRATION</span>
//                 <span>•</span>
//                 <span>HTML</span>
//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 3: CONTACT US SECTION */}
//         <section id="section-2" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12">
//           <div className="max-w-xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-white">Contact Us</h2>
//             <p className="text-slate-400 mb-6 text-sm sm:text-base">
//               Have feedback or need support with study materials? Drop us a line.
//             </p>

//             <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 text-left">
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">Your Name</label>
//                 <input type="text" placeholder="Mir Shaharyar" className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">Email Address</label>
//                 <input type="email" placeholder="student@buitems.edu.pk" className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">Message</label>
//                 <textarea rows="3" placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 text-sm text-slate-100 focus:outline-none focus:border-orange-500 transition-colors resize-none"></textarea>
//               </div>
//               <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]">
//                 <span>Send Message</span>
//                 <Send className="w-4 h-4" />
//               </button>
//             </form>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// }




//6th edit

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Navbar from '@/components/layout/Navbar';
// import { ArrowRight, BookOpen, Brain, Zap, Send, Sparkles } from 'lucide-react';

// export default function Home() {
//   const [activeSection, setActiveSection] = useState(0);
//   const [isAutoScrolling, setIsAutoScrolling] = useState(true);
//   const sectionsCount = 3;

//   useEffect(() => {
//     if (!isAutoScrolling) return;

//     const interval = setInterval(() => {
//       setActiveSection((prev) => {
//         if (prev < sectionsCount - 1) {
//           return prev + 1;
//         } else {
//           setIsAutoScrolling(false);
//           clearInterval(interval);
//           return prev;
//         }
//       });
//     }, 1300);

//     return () => clearInterval(interval);
//   }, [isAutoScrolling, sectionsCount]);

//   useEffect(() => {
//     const element = document.getElementById(`section-${activeSection}`);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [activeSection]);

//   const handleManualScroll = () => {
//     if (isAutoScrolling) {
//       setIsAutoScrolling(false);
//     }
//   };

//   return (
//     <div 
//       onWheel={handleManualScroll}
//       onTouchStart={handleManualScroll}
//       className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white transition-colors duration-200 relative"
//     >
//       {/* Background ambient glowing blue aura */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

//       <Navbar />

//       <div className="h-[calc(100vh-4rem)] overflow-y-scroll snap-y snap-mandatory relative z-10">
        
//         {/* PAGE 1: MAIN HERO SECTION */}
//         <section id="section-0" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12 text-center">
//           <div className="max-w-4xl mx-auto flex flex-col items-center">
            
//             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 text-xs font-semibold mb-6 bg-blue-950/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md">
//               <Sparkles className="w-3.5 h-3.5 animate-pulse" />
//               <span>Built strictly for BUITEMS Students</span>
//             </div>

//             <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] mb-6">
//               Never scramble for incomplete lecture notes <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">again.</span>
//             </h1>

//             <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-8 leading-relaxed">
//               Upload your rough scribbles or half-done lecture bullet points. Our AI expands them into structured study guides instantly.
//             </p>

//             <div className="flex gap-4">
//               <Link
//                 href="/signup"
//                 className="flex items-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-[1.02]"
//               >
//                 <span>Try It Free</span> 
//                 <ArrowRight className="w-4 h-4" />
//               </Link>
//             </div>
//           </div>
//         </section>

//         {/* PAGE 2: ABOUT / HIGHLIGHTS SECTION WITH CONTINUOUS MARQUEE */}
//         <section id="section-1" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12 bg-slate-900/50 backdrop-blur-sm">
//           <div className="max-w-5xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-white">About The Platform</h2>
//             <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm sm:text-base">
//               Designed specifically to tackle university coursework hurdles using intelligent context expansion.
//             </p>

//             {/* Core Feature Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mb-10">
//               <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl hover:border-blue-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit mb-4 border border-blue-500/20 group-hover:scale-110 transition-transform">
//                   <BookOpen className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Paste Half Notes</h3>
//                 <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
//                   Input rough classroom sentences to generate complete frameworks.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl hover:border-blue-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit mb-4 border border-cyan-500/20 group-hover:scale-110 transition-transform">
//                   <Brain className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Strict Subject Scope</h3>
//                 <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
//                   AI stays strictly within your academic syllabus parameters.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl hover:border-blue-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4 border border-indigo-500/20 group-hover:scale-110 transition-transform">
//                   <Zap className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Instant Output</h3>
//                 <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
//                   Receive comprehensive summaries ready for exam prep.
//                 </p>
//               </div>
//             </div>

//             {/* Continuous Right-to-Left Sliding Highlights Marquee */}
//             <div className="w-full overflow-hidden py-3.5 border-y border-slate-800 bg-slate-950/80 backdrop-blur-md">
//               <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-blue-400/90">
//                 <span>⚡ JAVASCRIPT</span>
//                 <span>•</span>
//                 <span>🎯 NEXTJS</span>
//                 <span>•</span>
//                 <span>🚀 REACT</span>
//                 <span>•</span>
//                 <span>📚 EXPRESS JS</span>
//                 <span>•</span>
//                 <span>⚡ NODE JS</span>
//                 <span>•</span>
//                 <span>🎯 TAILWIND CSS</span>
//                 <span>•</span>
//                 <span>🚀 AI INTEGRATION</span>
//                 <span>•</span>
//                 <span>HTML</span>
//                 <span>•</span>
//                 <span>⚡ JAVASCRIPT</span>
//                 <span>•</span>
//                 <span>🎯 NEXTJS</span>
//                 <span>•</span>
//                 <span>🚀 REACT</span>
//                 <span>•</span>
//                 <span>📚 EXPRESS JS</span>
//                 <span>•</span>
//                 <span>⚡ NODE JS</span>
//                 <span>•</span>
//                 <span>🎯 TAILWIND CSS</span>
//                 <span>•</span>
//                 <span>🚀 AI INTEGRATION</span>
//                 <span>•</span>
//                 <span>HTML</span>
//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 3: CONTACT US SECTION */}
//         <section id="section-2" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12">
//           <div className="max-w-xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-white">Contact Us</h2>
//             <p className="text-slate-400 mb-6 text-sm sm:text-base">
//               Have feedback or need support with study materials? Drop us a line.
//             </p>

//             <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 text-left">
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">Your Name</label>
//                 <input type="text" placeholder="Mir Shaharyar" className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">Email Address</label>
//                 <input type="email" placeholder="student@buitems.edu.pk" className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">Message</label>
//                 <textarea rows="3" placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors resize-none"></textarea>
//               </div>
//               <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
//                 <span>Send Message</span>
//                 <Send className="w-4 h-4" />
//               </button>
//             </form>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// }




//5th edit
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Navbar from '@/components/layout/Navbar';
// import { ArrowRight, BookOpen, Brain, Zap, Send, Sparkles } from 'lucide-react';

// export default function Home() {
//   const [activeSection, setActiveSection] = useState(0);
//   const [isAutoScrolling, setIsAutoScrolling] = useState(true);
//   const sectionsCount = 3;

//   useEffect(() => {
//     if (!isAutoScrolling) return;

//     const interval = setInterval(() => {
//       setActiveSection((prev) => {
//         if (prev < sectionsCount - 1) {
//           return prev + 1;
//         } else {
//           setIsAutoScrolling(false);
//           clearInterval(interval);
//           return prev;
//         }
//       });
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [isAutoScrolling, sectionsCount]);

//   useEffect(() => {
//     const element = document.getElementById(`section-${activeSection}`);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [activeSection]);

//   const handleManualScroll = () => {
//     if (isAutoScrolling) {
//       setIsAutoScrolling(false);
//     }
//   };

//   return (
//     <div 
//       onWheel={handleManualScroll}
//       onTouchStart={handleManualScroll}
//       className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white transition-colors duration-200 relative"
//     >
//       {/* Background ambient glowing blue aura */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

//       <Navbar />

//       <div className="h-[calc(100vh-4rem)] overflow-y-scroll snap-y snap-mandatory relative z-10">
        
//         {/* PAGE 1: MAIN HERO SECTION */}
//         <section id="section-0" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12 text-center">
//           <div className="max-w-4xl mx-auto flex flex-col items-center">
            
//             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 text-xs font-semibold mb-6 bg-blue-950/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md">
//               <Sparkles className="w-3.5 h-3.5 animate-pulse" />
//               <span>Built strictly for BUITEMS Students</span>
//             </div>

//             <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] mb-6">
//               Never scramble for incomplete lecture notes <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">again.</span>
//             </h1>

//             <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-8 leading-relaxed">
//               Upload your rough scribbles or half-done lecture bullet points. Our AI expands them into structured study guides instantly.
//             </p>

//             <div className="flex gap-4">
//               <Link
//                 href="/dashboard"
//                 className="flex items-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-[1.02]"
//               >
//                 <span>Try It Free</span> 
//                 <ArrowRight className="w-4 h-4" />
//               </Link>
//             </div>
//           </div>
//         </section>

//         {/* PAGE 2: ABOUT / HIGHLIGHTS SECTION WITH CONTINUOUS MARQUEE */}
//         <section id="section-1" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12 bg-slate-900/50 backdrop-blur-sm">
//           <div className="max-w-5xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-white">About The Platform</h2>
//             <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm sm:text-base">
//               Designed specifically to tackle university coursework hurdles using intelligent context expansion.
//             </p>

//             {/* Core Feature Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mb-10">
//               <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl hover:border-blue-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit mb-4 border border-blue-500/20 group-hover:scale-110 transition-transform">
//                   <BookOpen className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Paste Half Notes</h3>
//                 <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
//                   Input rough classroom sentences to generate complete frameworks.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl hover:border-blue-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit mb-4 border border-cyan-500/20 group-hover:scale-110 transition-transform">
//                   <Brain className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Strict Subject Scope</h3>
//                 <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
//                   AI stays strictly within your academic syllabus parameters.
//                 </p>
//               </div>

//               <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl hover:border-blue-500/50 transition-all duration-300 group">
//                 <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4 border border-indigo-500/20 group-hover:scale-110 transition-transform">
//                   <Zap className="w-6 h-6" />
//                 </div>
//                 <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Instant Output</h3>
//                 <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
//                   Receive comprehensive summaries ready for exam prep.
//                 </p>
//               </div>
//             </div>

//             {/* Continuous Right-to-Left Sliding Highlights Marquee */}
//             <div className="w-full overflow-hidden py-3.5 border-y border-slate-800 bg-slate-950/80 backdrop-blur-md">
//               <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-blue-400/90">
//                 <span>⚡ JAVASCRIPT</span>
//                 <span>•</span>
//                 <span>🎯 NEXTJS</span>
//                 <span>•</span>
//                 <span>🚀 REACT</span>
//                 <span>•</span>
//                 <span>📚 EXPRESS JS</span>
//                 <span>•</span>
//                 <span>⚡ NODE JS</span>
//                 <span>•</span>
//                 <span>🎯 TAILWIND CSS</span>
//                 <span>•</span>
//                 <span>🚀 AI INTEGRATION</span>
//                 <span>•</span>
//                 <span>HTML</span>
//                 <span>•</span>
//                 <span>⚡ JAVASCRIPT</span>
//                 <span>•</span>
//                 <span>🎯 NEXTJS</span>
//                 <span>•</span>
//                 <span>🚀 REACT</span>
//                 <span>•</span>
//                 <span>📚 EXPRESS JS</span>
//                 <span>•</span>
//                 <span>⚡ NODE JS</span>
//                 <span>•</span>
//                 <span>🎯 TAILWIND CSS</span>
//                 <span>•</span>
//                 <span>🚀 AI INTEGRATION</span>
//                 <span>•</span>
//                 <span>HTML</span>
//               </div>
//             </div>

//           </div>
//         </section>

//         {/* PAGE 3: CONTACT US SECTION */}
//         <section id="section-2" className="min-h-full snap-start flex flex-col items-center justify-center px-4 py-12">
//           <div className="max-w-xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-white">Contact Us</h2>
//             <p className="text-slate-400 mb-6 text-sm sm:text-base">
//               Have feedback or need support with study materials? Drop us a line.
//             </p>

//             <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 text-left">
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">Your Name</label>
//                 <input type="text" placeholder="Mir Shaharyar" className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">Email Address</label>
//                 <input type="email" placeholder="student@buitems.edu.pk" className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-slate-400">Message</label>
//                 <textarea rows="3" placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/80 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors resize-none"></textarea>
//               </div>
//               <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
//                 <span>Send Message</span>
//                 <Send className="w-4 h-4" />
//               </button>
//             </form>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// }
//4th page

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import Navbar from '@/components/layout/Navbar';
// import { ArrowRight, BookOpen, Brain, Zap, Terminal, Mail, User, Send } from 'lucide-react';

// export default function Home() {
//   const [activeSection, setActiveSection] = useState(0);
//   const sectionsCount = 3;

//   // Auto transition every 3 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveSection((prev) => (prev + 1) % sectionsCount);
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [sectionsCount]);

//   // Smooth scroll handler based on active section index
//   useEffect(() => {
//     const element = document.getElementById(`section-${activeSection}`);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [activeSection]);

//   return (
//     <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans overflow-x-hidden transition-colors duration-200">
      
//       {/* Fixed Navbar with Login/Signup */}
//       <Navbar />

//       {/* Snap Scroll Container */}
//       <div className="h-screen overflow-y-scroll snap-y snap-mandatory pt-16">
        
//         {/* PAGE 1: MAIN HERO SECTION */}
//         <section id="section-0" className="h-[calc(100vh-4rem)] snap-start flex flex-col items-center justify-center px-4 text-center">
//           <div className="max-w-5xl mx-auto flex flex-col items-center">
            
//             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold mb-8 bg-zinc-50 dark:bg-zinc-900 shadow-sm">
//               <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse"></span>
//               <span className="text-zinc-700 dark:text-zinc-300">Built strictly for BUITEMS Students</span>
//             </div>

//             <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] mb-6">
//               Never scramble for incomplete lecture notes <span className="text-zinc-400 dark:text-zinc-500">again.</span>
//             </h1>

//             <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed">
//               Upload your rough scribbles or half-done lecture bullet points. Our AI expands them into structured study guides instantly.
//             </p>

//             <div className="flex gap-4">
//               <Link
//                 href="/dashboard"
//                 className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold shadow-md transition-all"
//               >
//                 <span>Try It Free</span> 
//                 <ArrowRight className="w-4 h-4" />
//               </Link>
//             </div>
//           </div>
//         </section>

//         {/* PAGE 2: ABOUT / FEATURES SECTION */}
//         <section id="section-1" className="h-[calc(100vh-4rem)] snap-start flex flex-col items-center justify-center px-4 bg-zinc-50 dark:bg-zinc-950">
//           <div className="max-w-5xl mx-auto text-center">
//             <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">About The Platform</h2>
//             <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-12 text-sm sm:text-base">
//               Designed specifically to tackle the hurdles of university coursework through intelligent context expansion.
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
//               <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
//                 <BookOpen className="w-6 h-6 mb-4 text-zinc-900 dark:text-zinc-100" />
//                 <h3 className="font-bold text-lg mb-2">Paste Half Notes</h3>
//                 <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Input rough classroom sentences to generate complete frameworks.</p>
//               </div>
//               <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
//                 <Brain className="w-6 h-6 mb-4 text-zinc-900 dark:text-zinc-100" />
//                 <h3 className="font-bold text-lg mb-2">Strict Subject Scope</h3>
//                 <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">AI stays strictly within your academic syllabus parameters.</p>
//               </div>
//               <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
//                 <Zap className="w-6 h-6 mb-4 text-zinc-900 dark:text-zinc-100" />
//                 <h3 className="font-bold text-lg mb-2">Instant Output</h3>
//                 <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Receive comprehensive Markdown summaries ready for exam prep.</p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* PAGE 3: CONTACT US SECTION */}
//         <section id="section-2" className="h-[calc(100vh-4rem)] snap-start flex flex-col items-center justify-center px-4">
//           <div className="max-w-xl mx-auto text-center w-full">
//             <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">Contact Us</h2>
//             <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-sm sm:text-base">
//               Have feedback or need support with study materials? Drop us a line.
//             </p>

//             <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 text-left">
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-500">Your Name</label>
//                 <input type="text" placeholder="Mir Shaharyar" className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-500">Email Address</label>
//                 <input type="email" placeholder="student@buitems.edu.pk" className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400" />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1 uppercase tracking-wider text-zinc-500">Message</label>
//                 <textarea rows="3" placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"></textarea>
//               </div>
//               <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-sm transition-all shadow-md">
//                 <span>Send Message</span>
//                 <Send className="w-4 h-4" />
//               </button>
//             </form>
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// }





//3rd edit

// import Link from 'next/link';
// import { ArrowRight, BookOpen, Brain, Zap, Terminal } from 'lucide-react';

// export default function Home() {
//   return (
//     <div className="min-h-[100dvh] bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center font-sans px-4 py-16 transition-colors duration-200 overflow-hidden">
      
//       {/* News Channel Style Ticker Strip */}
//       <div className="w-full max-w-5xl mb-8 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 backdrop-blur-md py-2.5 flex items-center shadow-sm">
//         <div className="flex items-center gap-2 px-4 border-r border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider shrink-0">
//           <Terminal className="w-4 h-4" />
//           <span>Professional Stack</span>
//         </div>
//         <div className="flex overflow-hidden relative w-full whitespace-nowrap">
//           <div className="animate-marquee flex items-center gap-8 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 pl-4">
//             <span className="flex items-center gap-1.5">🚀 Next.js</span>
//             <span>•</span>
//             <span className="flex items-center gap-1.5">⚛️ React.js</span>
//             <span>•</span>
//             <span className="flex items-center gap-1.5">⚡ Express.js</span>
//             <span>•</span>
//             <span className="flex items-center gap-1.5">🟢 Node.js</span>
//             <span>•</span>
//             <span className="flex items-center gap-1.5">💛 JavaScript (ES6+)</span>
//             <span>•</span>
//             <span className="flex items-center gap-1.5">🎨 Tailwind CSS</span>
//             <span>•</span>
//             <span className="flex items-center gap-1.5">🚀 Next.js</span>
//             <span>•</span>
//             <span className="flex items-center gap-1.5">⚛️ React.js</span>
//             <span>•</span>
//             <span className="flex items-center gap-1.5">⚡ Express.js</span>
//             <span>•</span>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        
//         {/* BUITEMS Badge */}
//         <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold mb-8 bg-zinc-50 dark:bg-zinc-900 shadow-sm">
//           <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse"></span>
//           <span className="text-zinc-700 dark:text-zinc-300">Built strictly for BUITEMS Students</span>
//         </div>

//         {/* Hero Title */}
//         <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans max-w-3xl leading-[1.1] mb-6">
//           Never scramble for incomplete lecture notes <span className="text-zinc-400 dark:text-zinc-500">again.</span>
//         </h1>

//         {/* Subtitle */}
//         <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed">
//           Upload your rough scribbles or half-done lecture bullet points. Our AI expands them into structured, comprehensive study guides instantly.
//         </p>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
//           <Link
//             href="/dashboard"
//             className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold shadow-md transition-all min-h-[44px]"
//           >
//             <span>Complete Your Notes Free</span> 
//             <ArrowRight className="w-4 h-4" />
//           </Link>
//           <Link
//             href="/login"
//             className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-800 font-semibold bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-h-[44px]"
//           >
//             Sign In
//           </Link>
//         </div>

//         {/* Feature Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mt-4">
          
//           <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
//             <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl w-fit mb-4 border border-zinc-200 dark:border-zinc-700">
//               <BookOpen className="w-6 h-6" />
//             </div>
//             <h3 className="font-bold text-base sm:text-lg mb-2">Paste Half Notes</h3>
//             <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
//               Paste rough classroom points or messy outline sentences directly into the box.
//             </p>
//           </div>

//           <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
//             <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl w-fit mb-4 border border-zinc-200 dark:border-zinc-700">
//               <Brain className="w-6 h-6" />
//             </div>
//             <h3 className="font-bold text-base sm:text-lg mb-2">Strict Subject Scope</h3>
//             <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
//               AI stays within context—expanding key concepts without introducing irrelevant fluff.
//             </p>
//           </div>

//           <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
//             <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl w-fit mb-4 border border-zinc-200 dark:border-zinc-700">
//               <Zap className="w-6 h-6" />
//             </div>
//             <h3 className="font-bold text-base sm:text-lg mb-2">Instant Study Guides</h3>
//             <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
//               Get clear definitions, detailed explanations, and key takeaways in clean Markdown.
//             </p>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }






//2nd edit

// import Link from 'next/link';
// import { ArrowRight, BookOpen, Brain, Zap, Terminal } from 'lucide-react';

// export default function Home() {
//   return (
//     <div className="min-h-[100dvh] bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex flex-col items-center justify-center font-sans px-4 py-16 transition-colors duration-200 overflow-hidden">
      
//       {/* News Channel Style Ticker Strip */}
//       <div className="w-full max-w-5xl mb-8 overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-2.5 flex items-center shadow-sm">
//         <div className="flex items-center gap-2 px-4 border-r border-gray-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider shrink-0">
//           <Terminal className="w-4 h-4" />
//           <span>Professional Stack</span>
//         </div>
//         <div className="flex overflow-hidden relative w-full whitespace-nowrap">
//           <div className="animate-marquee flex items-center gap-8 text-xs sm:text-sm font-medium text-gray-700 dark:text-zinc-300 pl-4">
//     <span className="flex items-center gap-1.5">🚀 Next.js</span>
//     <span>•</span>
//     <span className="flex items-center gap-1.5">⚛️ React.js</span>
//     <span>•</span>
//     <span className="flex items-center gap-1.5">⚡ Express.js</span>
//     <span>•</span>
//     <span className="flex items-center gap-1.5">🟢 Node.js</span>
//     <span>•</span>
//     <span className="flex items-center gap-1.5">💛 JavaScript (ES6+)</span>
//     <span>•</span>
//     <span className="flex items-center gap-1.5">🎨 Tailwind CSS</span>
//     <span>•</span>
//     {/* Infinite loop ke liye duplicate items */}
//     <span className="flex items-center gap-1.5">🚀 Next.js</span>
//     <span>•</span>
//     <span className="flex items-center gap-1.5">⚛️ React.js</span>
//     <span>•</span>
//     <span className="flex items-center gap-1.5">⚡ Express.js</span>
//     <span>•</span>
//   </div>
//         </div>
//       </div>

//       <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        
//         {/* BUITEMS Badge */}
//         <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 text-xs font-semibold mb-8 bg-white dark:bg-zinc-900 shadow-sm">
//           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
//           <span className="text-gray-700 dark:text-zinc-300">Built strictly for BUITEMS Students</span>
//         </div>

//         {/* Hero Title */}
       
// <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans max-w-3xl leading-[1.1] mb-6">
//   Never scramble for incomplete lecture notes <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">again.</span>
// </h1>

//         {/* Subtitle */}
//         <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed">
//           Upload your rough scribbles or half-done lecture bullet points. Our AI expands them into structured, comprehensive study guides instantly.
//         </p>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
//           <Link
//             href="/dashboard"
//             className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition-all min-h-[44px]"
//           >
//             <span>Complete Your Notes Free</span> 
//             <ArrowRight className="w-4 h-4" />
//           </Link>
//           <Link
//             href="/login"
//             className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-gray-300 dark:border-zinc-800 font-semibold bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors min-h-[44px]"
//           >
//             Sign In
//           </Link>
//         </div>

//         {/* Feature Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mt-4">
          
//           <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
//             <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl w-fit mb-4 border border-emerald-500/20">
//               <BookOpen className="w-6 h-6" />
//             </div>
//             <h3 className="font-bold text-base sm:text-lg mb-2">Paste Half Notes</h3>
//             <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
//               Paste rough classroom points or messy outline sentences directly into the box.
//             </p>
//           </div>

//           <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
//             <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl w-fit mb-4 border border-emerald-500/20">
//               <Brain className="w-6 h-6" />
//             </div>
//             <h3 className="font-bold text-base sm:text-lg mb-2">Strict Subject Scope</h3>
//             <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
//               AI stays within context—expanding key concepts without introducing irrelevant fluff.
//             </p>
//           </div>

//           <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
//             <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl w-fit mb-4 border border-emerald-500/20">
//               <Zap className="w-6 h-6" />
//             </div>
//             <h3 className="font-bold text-base sm:text-lg mb-2">Instant Study Guides</h3>
//             <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
//               Get clear definitions, detailed explanations, and key takeaways in clean Markdown.
//             </p>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }








//1st edit

// import Link from 'next/link';
// import { ArrowRight, BookOpen, Brain, Zap, Sparkles } from 'lucide-react';

// export default function Home() {
//   return (
//     <div className="min-h-[100dvh] bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex flex-col items-center justify-center font-sans px-4 py-16 transition-colors duration-200">
//       <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        
//         {/* BUITEMS Badge */}
//         <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 text-xs font-semibold mb-8 bg-white dark:bg-zinc-900 shadow-sm">
//           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
//           <span className="text-gray-700 dark:text-zinc-300">Built strictly for BUITEMS Students</span>
//         </div>

//         {/* Hero Title */}
//         <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight mb-6">
//           Never scramble for incomplete lecture notes again.
//         </h1>

//         {/* Subtitle */}
//         <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed">
//           Upload your rough scribbles or half-done lecture bullet points. Our AI expands them into structured, comprehensive study guides instantly.
//         </p>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
//           <Link
//             href="/dashboard"
//             className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition-all min-h-[44px]"
//           >
//             <span>Complete Your Notes Free</span> 
//             <ArrowRight className="w-4 h-4" />
//           </Link>
//           <Link
//             href="/login"
//             className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-gray-300 dark:border-zinc-800 font-semibold bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors min-h-[44px]"
//           >
//             Sign In
//           </Link>
//         </div>

//         {/* Feature Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mt-4">
          
//           <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
//             <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl w-fit mb-4 border border-emerald-500/20">
//               <BookOpen className="w-6 h-6" />
//             </div>
//             <h3 className="font-bold text-base sm:text-lg mb-2">Paste Half Notes</h3>
//             <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
//               Paste rough classroom points or messy outline sentences directly into the box.
//             </p>
//           </div>

//           <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
//             <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl w-fit mb-4 border border-emerald-500/20">
//               <Brain className="w-6 h-6" />
//             </div>
//             <h3 className="font-bold text-base sm:text-lg mb-2">Strict Subject Scope</h3>
//             <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
//               AI stays within context—expanding key concepts without introducing irrelevant fluff.
//             </p>
//           </div>

//           <div className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
//             <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl w-fit mb-4 border border-emerald-500/20">
//               <Zap className="w-6 h-6" />
//             </div>
//             <h3 className="font-bold text-base sm:text-lg mb-2">Instant Study Guides</h3>
//             <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
//               Get clear definitions, detailed explanations, and key takeaways in clean Markdown.
//             </p>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }
