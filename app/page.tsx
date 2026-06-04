import Link from "next/link";
import PriceCalculator from "@/app/components/PriceCalculator";

const COOKIES = [
  {
    id: "roze",
    name: "Roze",
    tagline: "Zacht roze",
    description: "Een zacht, poederroze fondantkoekje.",
    image: "/cookies/pinkcookienoname.png",
  },
  {
    id: "blauw",
    name: "Blauw",
    tagline: "Hemelsblauwe afwerking",
    description: "Een helder, lichtblauw fondantkoekje.",
    image: "/cookies/bluecookienoname.png",
  },
  {
    id: "ivoor",
    name: "Ivoor",
    tagline: "Strak en tijdloos",
    description: "Een strak, warm ivoor fondantkoekje.",
    image: "/cookies/ivorycookienoname.png",
  },
];

export default function Home() {
  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-8 py-7 flex items-center justify-between">
        <span className="font-serif text-xl tracking-widest uppercase text-[#2A1E22]">
          Daphne&apos;s Bakery
        </span>
        <Link href="/order" className="font-sans text-[11px] uppercase tracking-[0.18em] text-[#2A1E22] hover:text-[#C46480] transition-colors">
          Bestellen
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-12 pb-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#C46480] mb-6">
            Handgemaakt · vers per bestelling
          </p>
          <h1
            className="font-serif italic font-light leading-[1.05] mb-6"
            style={{
              fontSize: "clamp(3rem, 6.5vw, 5.2rem)",
              color: "#C46480",
            }}
          >
            Smaakvolle koekjes met uniek design.
          </h1>
          <p className="font-sans text-[#8A7A82] text-base leading-relaxed mb-3 max-w-[42ch]">
            Elk koekje wordt vers gebakken en op maat gemaakt.
            Afhalen in Huizen of thuisbezorgd.
          </p>
          <p className="font-sans text-sm text-[#C46480] mb-10">
            Vanaf €2 per koekje
          </p>
          <Link
            href="/order"
            className="inline-flex items-center gap-4 px-8 py-4 rounded-full font-sans text-[11px] uppercase tracking-[0.18em] text-white hover:opacity-85 transition-opacity"
            style={{ backgroundColor: "#E0A0B8" }}
          >
            Bestel nu
            <span style={{ color: "rgba(255,255,255,0.7)" }}>→</span>
          </Link>
        </div>

        {/* Hero floating cookie */}
        <div className="flex items-center justify-center py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cookies/herocookie.png"
            alt="Fondant koekje"
            className="w-full max-w-[520px] h-auto aspect-square object-contain animate-spin-slow"
            style={{ filter: "drop-shadow(0 24px 48px rgba(196,100,128,0.18))" }}
          />
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-8 pb-32">
        <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#8A7A82] mb-16">
          Onze koekjes
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {COOKIES.map((cookie) => (
            <article key={cookie.id} className="flex flex-col items-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cookie.image}
                alt={cookie.name}
                className="w-44 h-44 object-contain mb-8"
                style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.08))" }}
              />
              <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#C46480] mb-2">
                {cookie.tagline}
              </p>
              <h2 className="font-serif text-2xl text-[#2A1E22] mb-2">{cookie.name}</h2>
              <p className="font-sans text-sm text-[#8A7A82] leading-relaxed mb-1">
                {cookie.description}
              </p>
              <p className="font-sans text-sm text-[#C46480] mb-6">Vanaf €2 / stuk</p>
              <Link
                href={`/order?type=${cookie.id}`}
                className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full font-sans text-[10px] uppercase tracking-[0.18em] text-white hover:opacity-85 transition-opacity"
                style={{ backgroundColor: "#E0A0B8" }}
              >
                Bestellen <span style={{ color: "rgba(255,255,255,0.7)" }}>→</span>
              </Link>
            </article>
          ))}

          {/* Custom colour option */}
          <article className="flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cookies/multicolorcookie.png"
              alt="Op maat koekje"
              className="w-44 h-44 object-contain mb-8"
              style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.08))" }}
            />
            <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-[#C46480] mb-2">
              Eigen keuze
            </p>
            <h2 className="font-serif text-2xl text-[#2A1E22] mb-2">Op maat</h2>
            <p className="font-sans text-sm text-[#8A7A82] leading-relaxed mb-1">
              Jouw kleur, op aanvraag beschikbaar.
            </p>
            <p className="font-sans text-sm text-[#C46480] mb-6">Vanaf €2 / stuk</p>
            <Link
              href="/order?type=custom"
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full font-sans text-[10px] uppercase tracking-[0.18em] hover:opacity-85 transition-opacity"
              style={{ backgroundColor: "transparent", border: "1.5px solid #E0A0B8", color: "#C46480" }}
            >
              Aanvragen <span>→</span>
            </Link>
          </article>
        </div>
      </section>

      <PriceCalculator />

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-8 py-10 flex items-center justify-between" style={{ borderTop: "1px solid rgba(196,100,128,0.12)" }}>
        <span className="font-serif text-sm text-[#2A1E22] tracking-widest uppercase">
          Daphne&apos;s Bakery
        </span>
        <p className="font-sans text-[11px] text-[#8A7A82] tracking-wide">
          Huizen · Handgemaakt
        </p>
      </footer>
    </div>
  );
}
