import { useGSAP } from "@gsap/react";
import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import Marquee from "../components/Marquee";
import { marqueeRepeat, socials } from "../constants";
import { gsap } from "../lib/gsap";

// Keep your real details in one place. Only edit these two lines.
const EMAIL = "allamjohnpaul0901@gmail.com";
const PHONE = "+63 916 133 3599";

// Guardrail for the phone number. It accepts "+63 916 133 3599",
// "09161333599" or "639161333599". Anything else (wrong length, letters)
// returns null, so a typo never shows up on the page.
// The screen shows it GCash style (+63 *** *** 3599), but the link keeps the
// full number so tapping it still dials correctly.
const formatPhone = (raw: string) => {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = `63${digits.slice(1)}`;
  }
  const match = digits.match(/^63(\d{3})(\d{3})(\d{4})$/);
  if (!match) return null;
  const [, a, b, c] = match;
  return {
    display: `+63 *** *** ${c}`, // shows: +63 *** *** 3599
    href: `tel:+63${a}${b}${c}`, // full number, no spaces, so phones can dial it
  };
};

// Guardrail for the email: needs something@something.something, no spaces.
const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const Contact = () => {
  const text = `Got a question, how or project Idea?
    WE’D love to hear from you and discus further!`;
  const phone = formatPhone(PHONE);
  const emailOk = isValidEmail(EMAIL);

  useGSAP(() => {
    // The three contact blocks slide up one after another when they scroll in.
    // delay: 0.5 = an extra half second pause before the first one starts.
    gsap.from(".social-link", {
      y: 100,
      opacity: 0,
      delay: 0.5,
      duration: 1,
      stagger: 0.3,
      ease: "back.out",
      scrollTrigger: {
        trigger: ".social-link",
      },
    });
  }, []);
  return (
    <section
      id="contact"
      className="flex flex-col justify-between min-h-screen bg-black"
    >
      <div>
        <AnimatedHeaderSection
          subTitle={"You Dream It, I Code it"}
          title={"Contact"}
          text={text}
          textColor={"text-white"}
          withScrollTrigger={true}
        />
        <div className="flex px-10 font-light text-white uppercase lg:text-[32px] text-[26px] leading-none mb-10">
          <div className="flex flex-col w-full gap-10">
            {emailOk && (
              <div className="social-link">
                <h2>E-mail</h2>
                <div className="w-full h-px my-2 bg-white/30" />
                <p className="text-xl tracking-wider lowercase md:text-2xl lg:text-3xl">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="cursor-pointer transition-all duration-200 hover:text-white/80
                    hover:underline underline-offset-4 decoration-gold"
                  >
                    {EMAIL}
                  </a>
                </p>
              </div>
            )}
            {phone && (
              <div className="social-link">
                <h2>Phone</h2>
                <div className="w-full h-px my-2 bg-white/30" />
                <p className="text-xl lowercase md:text-2xl lg:text-3xl">
                  <a
                    href={phone.href}
                    aria-label="Call me"
                    className="cursor-pointer transition-all duration-200 hover:text-white/80
                    hover:underline underline-offset-4 decoration-gold"
                  >
                    {phone.display}
                  </a>
                </p>
              </div>
            )}
            <div className="social-link">
              <h2>Checkout</h2>
              <div className="w-full h-px my-2 bg-white/30" />
              <div className="flex flex-wrap gap-2">
                {socials.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="cursor-pointer text-xs leading-loose tracking-wides uppercase
                    transition-all duration-200 md:text-sm hover:text-white/80 hover:underline
                    underline-offset-4 decoration-gold"
                  >
                    {"{ "}
                    {social.name}
                    {" }"}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Marquee
        items={marqueeRepeat("concept to production")}
        className="text-white bg-transparent"
      />
    </section>
  );
};

export default Contact;