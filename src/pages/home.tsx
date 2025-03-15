import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ArrowRight, CheckCircle, Crown, Gift, Timer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Player } from '@lottiefiles/react-lottie-player';

// Session ID cookie name
const SESSION_ID_COOKIE = 'coupon_session_id';
const LAST_CLAIM_TIME_COOKIE = 'last_claim_time';

// Helper to get or create session ID with SameSite and secure attributes
const getOrCreateSessionId = () => {
  const existingSessionId = document.cookie
    .split('; ')
    .find(row => row.startsWith(SESSION_ID_COOKIE))
    ?.split('=')[1];

  if (existingSessionId) {
    return existingSessionId;
  }

  const newSessionId = crypto.randomUUID();
  const cookieOptions = [
    `${SESSION_ID_COOKIE}=${newSessionId}`,
    'path=/',
    'max-age=86400',
    'SameSite=Lax'
  ];
  
  if (window.location.protocol === 'https:') {
    cookieOptions.push('Secure');
  }
  
  document.cookie = cookieOptions.join(';');
  return newSessionId;
};

const canUserClaim = () => {
  const lastClaimTime = document.cookie
    .split('; ')
    .find(row => row.startsWith(LAST_CLAIM_TIME_COOKIE))
    ?.split('=')[1];

  if (!lastClaimTime) return true;

  const lastClaim = new Date(parseInt(lastClaimTime));
  const now = new Date();
  const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastClaim >= 1;
};

const setLastClaimTime = () => {
  const now = new Date();
  const cookieOptions = [
    `${LAST_CLAIM_TIME_COOKIE}=${now.getTime()}`,
    'path=/',
    'max-age=86400',
    'SameSite=Lax'
  ];
  
  if (window.location.protocol === 'https:') {
    cookieOptions.push('Secure');
  }
  
  document.cookie = cookieOptions.join(';');
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function HomePage() {
  const [loading, setLoading] = useState(false);
  const [claimedCoupon, setClaimedCoupon] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [canClaim, setCanClaim] = useState(true);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>('');
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
    updateClaimStatus();

    const interval = setInterval(() => {
      const currentSid = getOrCreateSessionId();
      if (currentSid !== sessionId) {
        setSessionId(currentSid);
      }
      updateClaimStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateClaimStatus = () => {
    const can = canUserClaim();
    setCanClaim(can);

    if (!can) {
      const lastClaimTime = parseInt(
        document.cookie
          .split('; ')
          .find(row => row.startsWith(LAST_CLAIM_TIME_COOKIE))
          ?.split('=')[1] || '0'
      );
      
      const nextClaimTime = new Date(lastClaimTime + (60 * 60 * 1000));
      const now = new Date();
      const minutesLeft = Math.ceil((nextClaimTime.getTime() - now.getTime()) / (1000 * 60));
      
      setTimeUntilNextClaim(
        minutesLeft > 60
          ? '1 hour'
          : `${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}`
      );
    }
  };

  const claimCoupon = async () => {
    if (!sessionId) {
      const sid = getOrCreateSessionId();
      if (!sid) {
        toast.error('Session not initialized');
        return;
      }
      setSessionId(sid);
    }

    if (!canUserClaim()) {
      toast.error(`Please wait ${timeUntilNextClaim} before claiming another coupon`);
      return;
    }

    setLoading(true);
    try {
      const { data: { client_ip } } = await supabase.auth.getSession();

      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('status', 'available')
        .limit(1)
        .single();

      if (couponError || !coupon) {
        toast.error('No coupons available at the moment. Please try again later.');
        return;
      }

      const { error: updateError } = await supabase
        .from('coupons')
        .update({
          status: 'claimed',
          claimed_by: sessionId,
          claimed_at: new Date().toISOString()
        })
        .eq('id', coupon.id)
        .eq('status', 'available');

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error('Failed to claim coupon. Please try again later.');
        return;
      }

      const { error: claimError } = await supabase
        .from('claims')
        .insert({
          coupon_id: coupon.id,
          ip_address: client_ip || '0.0.0.0',
          session_id: sessionId
        });

      if (claimError) {
        console.error('Claim error:', claimError);
        await supabase
          .from('coupons')
          .update({
            status: 'available',
            claimed_by: null,
            claimed_at: null
          })
          .eq('id', coupon.id);
        
        toast.error('Failed to claim coupon. Please try again later.');
        return;
      }

      setLastClaimTime();
      setClaimedCoupon(coupon.code);
      updateClaimStatus();
      toast.success('Coupon claimed successfully!');
    } catch (error) {
      console.error('Error claiming coupon:', error);
      toast.error('Failed to claim coupon. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-luxury-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover opacity-30"
          >
            <source src="https://cdn.coverr.co/videos/coverr-luxury-shopping-mall-5244/1080p.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/80 to-luxury-black/40" />
        </div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 inline-flex items-center rounded-full bg-luxury-purple/20 px-4 py-1.5 text-sm font-medium text-luxury-gold"
              >
                <Crown className="mr-2 h-4 w-4" />
                Exclusive Luxury Coupons
              </motion.div>
              
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Elevate Your Shopping
                <span className="mt-2 block bg-gradient-to-r from-luxury-gold to-yellow-200 bg-clip-text text-transparent">
                  With Premium Savings
                </span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl"
              >
                Access exclusive deals from luxury brands. One-click access to premium savings.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10 flex flex-col items-center gap-6"
              >
                <Button
                  size="lg"
                  onClick={claimCoupon}
                  disabled={loading || !sessionId || !canClaim}
                  className={`group relative overflow-hidden bg-gradient-to-r from-luxury-gold to-yellow-500 text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] ${
                    (!loading && canClaim) ? 'animate-float' : ''
                  }`}
                >
                  {loading ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : !canClaim ? (
                    <>
                      Next Claim Available in {timeUntilNextClaim}
                      <Timer className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Claim Your Luxury Coupon
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                {claimedCoupon && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md overflow-hidden rounded-xl bg-white/10 p-6 backdrop-blur-lg"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-luxury-gold">Your Exclusive Code:</p>
                      <Gift className="h-6 w-6 text-luxury-gold" />
                    </div>
                    <p className="mt-2 break-all text-3xl font-bold tracking-wider text-white">
                      {claimedCoupon}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <motion.section
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="relative overflow-hidden bg-luxury-navy px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0 bg-[url('/luxury-pattern.svg')] opacity-5" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-luxury-gold sm:text-4xl">
              The Art of Claiming
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Experience our seamless process for accessing premium deals.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-xl gap-12 sm:mt-20 lg:max-w-none lg:grid-cols-3">
            {[
              {
                name: 'Select Your Moment',
                description:
                  'Choose the perfect time to claim your exclusive coupon from our curated collection.',
                icon: Timer,
                animation: 'https://assets10.lottiefiles.com/packages/lf20_qwATDC.json',
              },
              {
                name: 'Instant Access',
                description:
                  'Receive your unique code immediately, ready to unlock premium savings.',
                icon: CheckCircle,
                animation: 'https://assets10.lottiefiles.com/packages/lf20_jbrw3hcz.json',
              },
              {
                name: 'Premium Savings',
                description:
                  'Apply your code to access exceptional deals on luxury products and services.',
                icon: Crown,
                animation: 'https://assets10.lottiefiles.com/packages/lf20_q5qvqk.json',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.name}
                variants={fadeInUp}
                transition={{ delay: index * 0.2 }}
                className="group relative overflow-hidden rounded-2xl bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10"
              >
                <div className="relative z-10">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-luxury-gold/20">
                    <Player
                      autoplay
                      loop
                      src={feature.animation}
                      style={{ height: '48px', width: '48px' }}
                    />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-luxury-gold">
                    {feature.name}
                  </h3>
                  <p className="mt-4 text-gray-300">{feature.description}</p>
                </div>
                <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-luxury-gold/5 blur-3xl transition-all group-hover:bg-luxury-gold/10" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="relative bg-black px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-luxury-gold sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Everything you need to know about our premium coupon service.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl divide-y divide-white/10">
            {[
              {
                question: 'Are these coupons valid for all brands?',
                answer:
                  'Our coupons are curated for premium brands. Check the details to see which brands are included.',
              },
              {
                question: 'Do I need an account to claim a coupon?',
                answer:
                  'Yes, creating an account ensures you get personalized offers and track your claimed coupons.',
              },
              {
                question: 'Is there a limit on how many coupons I can claim?',
                answer:
                  'Some offers have limits, while others refresh regularly. Check each deal for specific details.',
              },
            ].map((faq, index) => (
              <motion.details
                key={index}
                variants={fadeInUp}
                transition={{ delay: index * 0.2 }}
                className="group px-4 py-6 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between text-lg font-medium text-white">
                  <span>{faq.question}</span>
                  <span className="ml-6 flex h-7 w-7 items-center justify-center rounded-full border border-luxury-gold bg-luxury-gold/10 transition-transform group-open:rotate-180">
                    <ArrowRight className="h-4 w-4 text-luxury-gold" />
                  </span>
                </summary>
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 text-gray-300"
                >
                  {faq.answer}
                </motion.p>
              </motion.details>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}