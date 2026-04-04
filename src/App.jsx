import { useState, useRef, useEffect, useMemo } from 'react'
import { ArrowRight, Check, Scan, Users, Sparkles, ArrowDown, Menu, X } from 'lucide-react'
import { AUDIENCE_PROFILES } from '../audience_profiles.js'

const FODD_BLUE = '#279cc9'
const EGG_YOLK = '#ffdc52'
const BASE_COLOR = '#4B5563'

// Inject dynamic keyframes for Page 3 animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes popReveal {
      0% { opacity: 0; transform: scale(0.5); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes spreadOut {
      0% { opacity: 0; transform: translateY(20px) scale(0.4); }
      100% { opacity: 1; transform: translateY(0) scale(1.2); }
    }
    @keyframes idleBob {
      from { transform: translate3d(0, 0px, 0); }
      to { transform: translate3d(0, -6px, 0); }
    }
    
    ::-webkit-scrollbar {
      display: none;
    }
    html, body {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;
  document.head.appendChild(style);
}
const PEAK_PX = 16   // within 16px of letter center = full color
const MAX_PX = 72   // beyond 72px = no effect (sharper drop-off)

/* ── Colour helpers ── */
function hexToRgb(hex) {
  return [1, 3, 5].map((o) => parseInt(hex.slice(o, o + 2), 16))
}
function lerpColor(from, to, t) {
  const [r1, g1, b1] = hexToRgb(from)
  const [r2, g2, b2] = hexToRgb(to)
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`
}

/* ─────────────────────────────────────────────
   GLOW TEXT
   - mousemove listener lives on the parent <p> (containerRef)
   - updates DOM directly → zero React re-renders on mouse move
   - tracks all 6 DOF (x, y, diagonals work)
   - blank spaces adjacent to the phrase are also covered because
     the listener is on the parent element
───────────────────────────────────────────── */
function GlowText({ text, containerRef, baseColor = BASE_COLOR, glowColor = EGG_YOLK, peakPx = PEAK_PX, maxPx = MAX_PX, maxIntensity = 1.0, hShrink = 1.0 }) {
  const chars = text.split('')
  const letterRefs = useRef([])
  const rectsRef = useRef([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Cache the exact geometry relative to the document to prevent 60-FPS layout reflow thrashing on mousemove
    const updateRects = () => {
      rectsRef.current = letterRefs.current.map((el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          cx: rect.left + rect.width / 2 + window.scrollX,
          cy: rect.top + rect.height / 2 + window.scrollY
        };
      });
    };

    const onMove = (e) => {
      const pageX = e.pageX;
      const pageY = e.pageY;

      letterRefs.current.forEach((el, index) => {
        if (!el) return
        const cached = rectsRef.current[index];
        if (!cached) return;

        const dx = (pageX - cached.cx) * hShrink
        const dy = pageY - cached.cy
        const dist = Math.sqrt(dx ** 2 + dy ** 2)

        let intensity = 0
        if (dist <= peakPx) {
          intensity = 1
        } else if (dist < maxPx) {
          const raw = 1 - (dist - peakPx) / (maxPx - peakPx)
          intensity = Math.pow(raw, 3.0)
        }

        // Apply styles natively without triggering layout math
        if (intensity > 0.02) {
          el.style.color = lerpColor(baseColor, glowColor, intensity * maxIntensity);
        } else {
          el.style.color = baseColor;
        }
      })
    }

    const onLeave = () => {
      letterRefs.current.forEach((el) => {
        if (!el) return
        el.style.color = baseColor
      })
    }

    // Measure initially and when layout changes
    updateRects();
    window.addEventListener('resize', updateRects);
    const resizeObserver = new ResizeObserver(updateRects);
    resizeObserver.observe(document.documentElement);

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('resize', updateRects);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [containerRef, baseColor, glowColor, peakPx, maxPx, maxIntensity, hShrink])

  return (
    <span>
      {chars.map((char, i) => (
        <span
          key={i}
          ref={(el) => (letterRefs.current[i] = el)}
          style={{
            color: baseColor,
            display: 'inline-block',
            transition: 'color 0.12s ease',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const NavLink = ({ href, children, isMobile, onClick }) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        if (href === '#') window.scrollTo({ top: 0, behavior: 'smooth' });
        else document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        if (onClick) onClick();
      }}
      style={{
        fontSize: isMobile ? '1.125rem' : '0.925rem',
        fontWeight: 700,
        color: '#111827',
        textDecoration: 'none',
        fontFamily: '"Planc Bold Black", system-ui, -apple-system, sans-serif',
        letterSpacing: '-0.01em',
        transition: 'color 0.2s ease',
      }}
      onMouseOver={(e) => (e.target.style.color = FODD_BLUE)}
      onMouseOut={(e) => (e.target.style.color = '#111827')}
    >
      {children}
    </a>
  );

  return (
    <>
      <nav
        className="px-6"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          height: '84px',
          background: '#ffffff',
          borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
          boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="max-w-6xl mx-auto w-full h-full flex items-center justify-between md:justify-start relative">
          {/* Left: Logo (Aligned with hero text below) */}
          <div className="flex-none" style={{ marginLeft: '-17px' }}>
            <img
              src="/assets/FoddLogoTransparentBlack.png"
              alt="Fodd"
              style={{ height: '146px', width: 'auto', transform: 'translateY(2px)' }}
            />
          </div>

          {/* Right Nav Links */}
          <div className="hidden md:flex absolute right-[0px] top-1/2 -translate-y-1/2 items-center justify-center gap-10">
            <NavLink href="#">Home</NavLink>
            <NavLink href="#hero-section">Join the Waitlist</NavLink>
            <NavLink href="#features-section">App Features</NavLink>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center z-[110]">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -mr-2 text-black transition-transform active:scale-95">
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden fixed top-[84px] left-0 w-full bg-white border-b border-black/5 shadow-2xl z-[90] flex flex-col items-center py-8 gap-8 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-[150%]'} shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]`}
        style={{ pointerEvents: mobileMenuOpen ? 'auto' : 'none' }}
      >
        <NavLink href="#" isMobile>Home</NavLink>
        <NavLink href="#hero-section" isMobile>Join the Waitlist</NavLink>
        <NavLink href="#features-section" isMobile>App Features</NavLink>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const subtitleRef = useRef(null)
  const mottoRef = useRef(null)
  const youAreaRef = useRef(null)

  const hasInput = email.includes('@')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    setError('')
    setSubmitted(true)
  }

  return (
    <section
      id="hero-section"
      className="min-h-screen flex items-center px-6 py-16"
      style={{ background: '#ffffff' }}
    >
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 md:gap-6 items-center">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col items-start gap-5 text-left">

          {/* Motto */}
          <p
            ref={mottoRef}
            className="tracking-tight px-[20px] -mx-[20px] md:px-[120px] md:-mx-[120px] py-[20px] -my-[20px] md:py-[40px] md:-my-[40px]"
            style={{
              fontFamily: '"Planc Bold Black", system-ui, -apple-system, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 8vw, 2.5rem)',
              color: '#000000',
              lineHeight: 1.1,
              cursor: 'default',
              userSelect: 'none',
            }}
          >
            <GlowText text="Know what food is" containerRef={mottoRef} baseColor="#000000" glowColor={FODD_BLUE} hShrink={0.500} />
            <br />
            <GlowText text="right for " containerRef={mottoRef} baseColor="#000000" glowColor={FODD_BLUE} hShrink={0.500} />
            <span style={{ textDecoration: 'underline', textDecorationColor: FODD_BLUE }}>
              <GlowText text="you." containerRef={mottoRef} baseColor="#000000" glowColor={FODD_BLUE} hShrink={0.500} />
            </span>
          </p>

          {/* Subtitle — mousemove here covers surrounding whitespace too */}
          <p
            ref={subtitleRef}
            className="text-lg leading-relaxed"
            style={{ color: BASE_COLOR, cursor: 'default', maxWidth: '28rem' }}
          >
            Fodd is a{' '}
            <GlowText text="fully personalized" containerRef={subtitleRef} />
            {' '}food scanner built around your dietary and health profile.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2" style={{ marginTop: '10px' }}>
            {[
              'Supports 4,200+ food allergies',
              'Supports 100+ intolerances',
              'Supports 200+ diets',
            ].map((f) => (
              <span
                key={f}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-6px_6px_0_0_#000000] cursor-default bg-white border-black/20 text-black hover:bg-[#f3c555] hover:border-black"
              >
                <Check size={11} className="text-black transition-colors" />
                {f}
              </span>
            ))}
          </div>

          {/* Email capture */}
          {submitted ? (
            <div
              className="inline-flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-sm border"
              style={{ background: '#f0f9fd', borderColor: '#c5e8f5', color: FODD_BLUE }}
            >
              <Check size={18} />
              You&apos;re on the list! We&apos;ll be in touch soon.
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full" style={{ maxWidth: '28rem' }}>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  id="email-input"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="your@email.com"
                  className="flex-1 rounded-2xl px-5 py-3.5 text-sm border shadow-sm"
                  style={{
                    background: '#ffffff',
                    borderColor: '#e5e7eb',
                    color: '#111827',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = `0 0 0 3px ${FODD_BLUE}40`
                    e.target.style.borderColor = FODD_BLUE
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none'
                    e.target.style.borderColor = '#e5e7eb'
                  }}
                />
                <button
                  type="submit"
                  disabled={!hasInput}
                  className="group inline-flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-2xl whitespace-nowrap transition-all duration-200"
                  style={{
                    background: hasInput ? FODD_BLUE : '#d1d5db',
                    color: '#ffffff',
                    cursor: hasInput ? 'pointer' : 'not-allowed',
                    boxShadow: hasInput ? `0 4px 14px ${FODD_BLUE}50` : 'none',
                  }}
                >
                  Join Waitlist <ArrowRight size={15} className={hasInput ? "transition-colors duration-200 group-hover:text-[#ffdc52]" : ""} />
                </button>
              </form>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <p className="text-xs" style={{ color: '#9ca3af' }}>
                No spam. No credit card. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (iPhone mockup) ── */}
        <div className="flex justify-center md:justify-end items-center">
          <img
            src="/assets/FoddSS319.png"
            alt="Fodd app — scan food items with your camera"
            className="w-64 sm:w-72 md:w-80 lg:w-96 max-h-[85vh] object-contain"
            style={{
              marginTop: '20px', // nudged down slightly per request
            }}
          />
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   LOGO BREAK
───────────────────────────────────────────── */
function LogoBreak() {
  return (
    <div className="flex justify-center py-14" style={{ background: '#ffffff' }}>
      <img
        src="/assets/FoddLogoTransparentBlack.png"
        alt="Fodd"
        className="h-10 w-auto"
        style={{ opacity: 0.55 }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   SPLASH SCREEN
───────────────────────────────────────────── */
function SplashScreen({ isFadingOut }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'} z-[999999]`}
      style={{
        background: isLoaded ? '#279cc9' : '#ffffff', // White until image fully loads, then switch instantly to Fodd Blue
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      <img
        ref={imgRef}
        src="/assets/FoddLogoTransparent.png"
        alt="Fodd Logo"
        onLoad={() => setIsLoaded(true)}
        style={{
          height: '180px',
          width: 'auto',
          opacity: isLoaded ? 1 : 0
        }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   FEATURES SECTION
───────────────────────────────────────────── */
function Features() {
  // Adding explicit state components so we can comfortably do inline CSS for shadows because
  // custom Tailwind arbitrary strings can sometimes get stripped if not statically analyzable.
  const FeatureCard = ({ icon: Icon, title, description }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="flex flex-col rounded-2xl p-8 lg:p-10 transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isHovered ? '#f3c555' : '#ffffff',
          color: '#000000',
          border: isHovered ? '3px solid #000000' : '3px solid transparent',
          boxShadow: isHovered ? '-12px 12px 0px 0px #000000' : '0px 4px 20px rgba(0,0,0,0.05)',
          transform: isHovered ? 'translate(8px, -8px)' : 'translate(0, 0)',
        }}
      >
        <div className="mb-8">
          <Icon size={36} strokeWidth={2.5} color="#000000" style={{ transition: 'transform 0.3s ease', transform: isHovered ? 'scale(1.1)' : 'scale(1)' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold tracking-tight mb-4" style={{ fontFamily: '"Planc Bold Black", system-ui, -apple-system, sans-serif', color: '#000000' }}>
            {title}
          </h3>
          <p className="text-base leading-relaxed font-medium" style={{ color: '#000000' }}>
            {description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section id="features-section" className="px-6 py-32" style={{ background: '#FCFBF8' }}>
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">

          <FeatureCard
            icon={Scan}
            title="Personalized Food Scanner"
            description="Fodd can scan your products (item, box, or barcode), and provide an answer based on your specific health profile."
          />

          <FeatureCard
            icon={Users}
            title="For Everyone"
            description="Fodd can be used by anyone, from people managing multiple restrictions to people with none."
          />

          <FeatureCard
            icon={Sparkles}
            title="Recommendation System"
            description="Fodd has an advanced recommendation system that helps you know what to eat/avoid based on your profile."
          />

        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   AUDIENCE SECTION (Page 3)
───────────────────────────────────────────── */
function AudienceSection() {
  const [profile, setProfile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [hasAutoGenerated, setHasAutoGenerated] = useState(false);
  const [bannerRevealed, setBannerRevealed] = useState(false);
  const headingRef = useRef(null);
  const bannerRef = useRef(null);

  const generateProfile = (isInitial = false) => {
    setIsLoading(true);
    setShowResult(false);

    // Auto-load takes 1200ms, manual user clicks take 700ms
    const loadDuration = isInitial ? 1200 : 500;

    setTimeout(() => {
      if (isInitial && Math.random() < 0.35) {
        setProfile("Seed Oil-Free");
      } else {
        const randomIndex = Math.floor(Math.random() * AUDIENCE_PROFILES.length);
        setProfile(AUDIENCE_PROFILES[randomIndex]);
      }
      setIsLoading(false);
      setTimeout(() => setShowResult(true), 50);
    }, loadDuration);
  };

  const handleGenerate = () => {
    const now = Date.now();
    if (now - lastClickTime < 800) return;
    setLastClickTime(now);
    generateProfile();
  };

  useEffect(() => {
    if (!headingRef.current || hasAutoGenerated) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setHasAutoGenerated(true);
        generateProfile(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, [hasAutoGenerated]);

  useEffect(() => {
    if (!bannerRef.current || bannerRevealed) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setBannerRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(bannerRef.current);
    return () => observer.disconnect();
  }, [bannerRevealed]);

  return (
    <section className="relative flex flex-col items-center justify-start px-6 pt-[113px] lg:pt-[145px] pb-6" style={{ background: '#b8fb3c', minHeight: '100vh' }}>

      {/* Interactive Area (Flex Stack) */}
      <div className="relative w-full max-w-5xl flex flex-col items-center justify-center mt-4">

        {/* Header */}
        <h2 ref={headingRef} className="text-center tracking-tight mb-[40px] lg:mb-[56px]" style={{
          fontFamily: '"Planc Bold Black", system-ui, -apple-system, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(0.85rem, 2vw, 1.5rem)',
          color: '#ffffff',
        }}>
          The Fodd App is for:
        </h2>

        {/* Loading / Result Container centered */}
        <div className="flex items-center justify-center pointer-events-none mb-[40px] lg:mb-[56px]" style={{ height: '280px', width: '100%', transform: 'translateY(-20px)' }}>
          {isLoading && (
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin transition-opacity duration-300" />
          )}

          {!isLoading && showResult && profile && (
            <div
              className="text-center px-4"
              style={{
                color: '#ffffff',
                fontFamily: '"Planc Bold Black", system-ui, -apple-system, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(3.2rem, 6.5vw, 6.5rem)',
                lineHeight: 1.1,
                WebkitTextStroke: '3px black',
                textShadow: '8px 8px 0 #000000',
                willChange: 'transform, opacity',
                animation: 'popReveal 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              }}
            >
              {profile}
            </div>
          )}
        </div>

        {/* Trigger Button */}
        <div className="z-10 mb-[100px] md:mb-[140px]">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="group flex items-center justify-center text-lg lg:text-xl font-bold px-16 py-5 rounded-full border-2 transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-6px_6px_0_0_#000000] focus:outline-none bg-white border-black text-black hover:bg-[#f3c555] active:scale-95 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-none disabled:hover:bg-white"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            People
          </button>
        </div>

        {/* Dynamic Static Text Banner */}
        <div ref={bannerRef} className="z-10 w-full flex justify-center mb-24 md:mb-32">
          <div
            key={bannerRevealed ? 'visible' : 'hidden'}
            className="text-center px-4 flex flex-row flex-wrap justify-center items-baseline gap-y-3"
            style={{
              fontWeight: 900,
              fontSize: 'clamp(1.2rem, 7vw, 4.5rem)',
              lineHeight: 1.2,
              WebkitTextStroke: 'calc(1px + 0.25vw) black',
              textShadow: 'calc(2px + 0.4vw) calc(2px + 0.4vw) 0 #000000',
              willChange: 'transform, opacity',
              letterSpacing: '0.1em',
              animation: bannerRevealed ? 'spreadOut 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' : 'none',
              opacity: bannerRevealed ? 1 : 0,
            }}
          >
            {"OR ANYONE ELSE!".split(' ').map((word, wIdx) => (
              <span key={wIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap', margin: wIdx > 0 ? '0 0.35em' : '0' }}>
                {word.split('').map((char, cIdx) => {
                  const i = wIdx === 0 ? cIdx : (wIdx === 1 ? cIdx + 3 : cIdx + 10);
                  const colors = ['#ffdc52', '#ffb3ba', 'transparent', '#bae1ff', '#f3c555', '#baffc9', '#ffdfba', '#ffdc52', '#e2cbff', 'transparent', '#f3c555', '#ffb3ba', '#bae1ff', '#ffdc52', '#baffc9'];
                  const fonts = ['"Planc Bold Black", system-ui, sans-serif', '"Arial Black", sans-serif', 'inherit', '"Fredoka One", "Arial Rounded MT Bold", sans-serif', '"Planc Bold Black", system-ui, sans-serif', '"Trebuchet MS", sans-serif', '"Impact", sans-serif', '"Arial Black", sans-serif', '"Comic Sans MS", cursive', 'inherit', '"Fredoka One", "Arial Rounded MT Bold", sans-serif', '"Trebuchet MS", sans-serif', '"Planc Bold Black", system-ui, sans-serif', '"Arial Black", sans-serif', '"Impact", sans-serif'];

                  let customStyle = { color: colors[i], fontFamily: fonts[i] };
                  if (i === 0) customStyle.fontSize = '1.15em'; // Make 'O' bigger

                  if (bannerRevealed) {
                    customStyle.display = 'inline-block';
                    customStyle.animation = `idleBob 1.75s ease-in-out ${0.6 + i * 0.08}s infinite alternate`;
                  }

                  return (
                    <span key={cIdx} style={customStyle}>
                      {char}
                    </span>
                  );
                })}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-auto pt-10 flex flex-col items-center justify-end w-full">
        <h3 className="text-xl md:text-2xl font-bold text-black uppercase tracking-[0.2em] mb-[30px]" style={{ fontFamily: '"Planc Bold Black", system-ui, -apple-system, sans-serif' }}>
          SOUND LIKE YOU?
        </h3>
        <button
          onClick={() => {
            document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="animate-bounce cursor:pointer focus:outline-none transition-transform hover:scale-110 active:scale-95"
        >
          <ArrowDown size={32} strokeWidth={2.5} color="#000000" />
        </button>
      </div>

    </section>
  );
}

/* ─────────────────────────────────────────────
   CUSTOM SCROLLBAR (Left Side)
───────────────────────────────────────────── */
function CustomScrollbar() {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const metricsRef = useRef({
    windowHeight: 0,
    documentHeight: 0,
    trackHeight: 0,
    trackTop: 0,
    sectionTop: 0,
    thumbRatio: 0.2,
    thumbHeightPx: 1
  });

  const updateMetrics = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const hero = document.getElementById('hero-section');

    metricsRef.current.windowHeight = windowHeight;
    metricsRef.current.documentHeight = documentHeight;
    metricsRef.current.sectionTop = hero ? hero.offsetTop : windowHeight;

    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      metricsRef.current.trackHeight = rect.height;
      metricsRef.current.trackTop = rect.top;
    }

    const thumbRatio = Math.max(0.1, Math.min(1, windowHeight / documentHeight));
    metricsRef.current.thumbRatio = thumbRatio;
    metricsRef.current.thumbHeightPx = Math.max(1, metricsRef.current.trackHeight * thumbRatio);

    if (thumbRef.current) {
      thumbRef.current.style.height = `${thumbRatio * 100}%`;
    }
    handleScroll();
  };

  const handleScroll = () => {
    if (!thumbRef.current) return;
    const scrollTop = window.scrollY;
    const m = metricsRef.current;

    const maxScroll = m.documentHeight - m.windowHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) : 0;

    // Hardware accelerated GPU translation 
    const thumbTopRelative = progress * (m.trackHeight - m.thumbHeightPx);
    thumbRef.current.style.transform = `translateY(${thumbTopRelative}px)`;

    // Pure math gradient split via cached geometry
    const boundaryViewportY = m.sectionTop - scrollTop;
    const thumbViewportY = m.trackTop + thumbTopRelative;
    const offsetInThumb = boundaryViewportY - thumbViewportY;

    let split = (offsetInThumb / m.thumbHeightPx) * 100;
    split = Math.max(0, Math.min(100, split));

    thumbRef.current.style.background = `linear-gradient(to bottom, #e4e3e3ff ${split}%, #3b3b3bff ${split}%)`;
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateMetrics);

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(document.documentElement);

    setTimeout(updateMetrics, 50);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateMetrics);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className="hidden md:block"
      style={{
        position: 'fixed',
        top: '96px',
        bottom: '32px',
        left: '15px',
        width: '12px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: 'inset 0 0 10px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.05)',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={thumbRef}
        style={{
          width: '100%',
          height: '20%',
          background: '#e4e3e3ff',
          borderRadius: '12px',
          position: 'absolute',
          top: 0,
          left: 0,
          willChange: 'transform, background',
        }}
      ></div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────── */
export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 1100)

    const removeTimer = setTimeout(() => {
      setShowSplash(false)
    }, 1600)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#ffffff' }}>
      <CustomScrollbar />
      {showSplash && <SplashScreen isFadingOut={isFadingOut} />}
      <Navbar />
      <AudienceSection />
      <Hero />
      <Features />
      <LogoBreak />
    </div>
  )
}