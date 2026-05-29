import Link from "next/link";

const COOKIES = [
  {
    id: "blossom",
    name: "Blossom",
    tagline: "Roze marmerlook",
    description:
      "Een romantisch roze fondantkoekje met een subtiel marmerpatroon. Perfect voor bruiloften, jubilea en geboortes.",
    price: 28,
    swatches: ["#FFAEC0"],
    imageBg: "#F2E0E4",
    imageAccent: "#A8606E",
    imageUrl: "https://loremflickr.com/800/800/fondant,cookies/10",
  },
  {
    id: "azuur",
    name: "Azuur",
    tagline: "Hemelsblauwe afwerking",
    description:
      "Een stijlvol lichtblauw fondantkoekje met een delicaat marmerpatroon. Prachtig voor doopfeesten en babyshowers.",
    price: 28,
    swatches: ["#A8C8E0"],
    imageBg: "#DDE8F0",
    imageAccent: "#7D8FA1",
    imageUrl: "https://loremflickr.com/800/800/fondant,cookies/20",
  },
  {
    id: "ivoor",
    name: "Ivoor",
    tagline: "Strak en tijdloos",
    description:
      "Een elegant ivoor fondantkoekje voor elke gelegenheid. Klassiek, minimalistisch en altijd goed.",
    price: 28,
    swatches: ["#F5F0E8"],
    imageBg: "#EDE8E0",
    imageAccent: "#B09878",
    imageUrl: "https://loremflickr.com/800/800/fondant,cookies/30",
  },
];

const GALLERY_IMAGES = [
  { src: "https://loremflickr.com/600/600/fondant,cookies/1", alt: "Fondant koekjes voorbeeld 1" },
  { src: "https://loremflickr.com/600/600/fondant,cookies/2", alt: "Fondant koekjes voorbeeld 2" },
  { src: "https://loremflickr.com/600/600/cookies,icing/3",   alt: "Royal iced koekjes voorbeeld 3" },
  { src: "https://loremflickr.com/600/600/cookies,icing/4",   alt: "Royal iced koekjes voorbeeld 4" },
];

export default function Home() {
  return (
    <div className="min-h-full">
      <header className="border-b border-bisque">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="font-serif text-2xl text-primary tracking-wide">
            Daphne&apos;s Bakery
          </span>
          <Link
            href="/order"
            className="font-sans text-sm text-taupe hover:text-primary transition-colors"
          >
            Bestelling plaatsen →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-5">
          Handgemaakt · vers per bestelling
        </p>
        <h1 className="font-serif text-[clamp(3rem,8vw,5.5rem)] leading-[1.05] text-espresso max-w-xl">
          Koekjes die de moeite waard zijn
        </h1>
        <p className="font-sans text-taupe text-lg mt-6 max-w-[58ch] leading-relaxed">
          Elke batch vers gebakken. Afhalen in Huizen of thuisbezorgd.
        </p>
        <Link
          href="/order"
          className="inline-block mt-10 px-8 py-3.5 bg-primary text-surface font-sans text-sm tracking-wide hover:bg-primary/90 transition-colors"
        >
          Bestel nu
        </Link>
      </section>

      {/* Product grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="h-px bg-bisque mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-bisque">
          {COOKIES.map((cookie) => (
            <article key={cookie.id} className="bg-parchment p-8 flex flex-col">
              <div
                className="w-full aspect-square mb-6 overflow-hidden"
                style={{ backgroundColor: cookie.imageBg }}
              >
                {/* Replace with your own photo */}
                <img
                  src={cookie.imageUrl}
                  alt={cookie.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-1.5 mb-4">
                {cookie.swatches.map((color) => (
                  <span
                    key={color}
                    className="w-3 h-3 rounded-full border border-bisque/80"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <p className="font-sans text-[11px] uppercase tracking-[0.15em] text-accent mb-2">
                {cookie.tagline}
              </p>
              <h2 className="font-serif text-2xl text-espresso mb-3">{cookie.name}</h2>
              <p className="font-sans text-sm text-taupe leading-relaxed flex-1 mb-6">
                {cookie.description}
              </p>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-serif text-2xl text-primary">€{cookie.price}</span>
                  <span className="font-sans text-xs text-taupe ml-1">per dozijn</span>
                </div>
                <Link
                  href={`/order?type=${cookie.id}`}
                  className="font-sans text-sm text-primary hover:underline underline-offset-4"
                >
                  Bestellen →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Photo gallery */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="h-px bg-bisque mb-10" />
        <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-accent mb-8">
          Voorbeelden
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {GALLERY_IMAGES.map((img) => (
            <div key={img.src} className="aspect-square overflow-hidden bg-[#EEE0E4]">
              {/* Replace with your own photos */}
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-bisque">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="font-sans text-sm text-taupe">
            Daphne&apos;s Bakery · Huizen · Bestellingen voor vrijdag worden maandag bezorgd
          </p>
        </div>
      </footer>
    </div>
  );
}
