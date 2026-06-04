# Spec: Decoratie-opties & Meerdere Namen in Bestelformulier

**Datum:** 2026-06-04
**Status:** Goedgekeurd

## Context

Op de hoofdpagina staat al een `PriceCalculator` component met personalisatie-toggle (één naam / verschillende namen) en decoratie-thema's (Babythema, Diertjes, Anders). Die component is puur indicatief. De bestelpagina mist deze opties als echte formuliervelden — gebruikers kunnen wel een naam invullen maar niet aangeven dat ze verschillende namen per koekje willen, en kunnen geen decoratie-thema kiezen. Dit spec beschrijft hoe die opties worden toegevoegd aan het bestelformulier en opgeslagen in de database.

## Doelstelling

Na implementatie kan een klant bij het plaatsen van een bestelling:
- Kiezen tussen één naam (voor alle koekjes) of verschillende namen (één per koekje, textarea)
- Een decoratie-thema selecteren (Babythema, Diertjes, Anders)
- Een omschrijving geven bij "Anders" decoratie
- De totaalprijs zien die deze keuzes reflecteert

## UI-wijzigingen (`app/order/order-form.tsx`)

### Personalisatie-toggle
- Toevoegen boven de bestaande tekstvelden (Regel 1 / Regel 2)
- Twee knoppen in dezelfde stijl als PriceCalculator: "Één naam (inbegrepen)" en "Verschillende namen +€0,50"
- State: `personalizationType: 'single' | 'multiple'`
- Bij **single**: toon bestaande `line1`/`line2` velden (ongewijzigd)
- Bij **multiple**: vervang line1/line2 door een `<textarea>` (één naam per regel, `name="namesInput"`)

### Decoratie-sectie
- Nieuw blok na de personalisatie-sectie
- Label: "Thema decoratie" + "+€0,25 / stuk"
- Drie toggle-knoppen: Babythema (`baby`), Diertjes (`animals`), Anders (`custom`)
- Meerdere tegelijk selecteerbaar (Set)
- State: `decos: Set<string>`
- Bij "Anders": toon tekstveld `name="customDecoNote"` (omschrijving gewenste decoratie)
- Hidden inputs voor geselecteerde thema's: `name="decorationThemes"` value=kommagescheiden string

### Prijsupdate
- `nameAdd = personalizationType === 'multiple' ? 0.50 : 0`
- `decoAdd = decos.size > 0 ? 0.25 : 0`
- `perCookie = getBasePrice(qty) + nameAdd + decoAdd`
- Totaal-display (eerder toegevoegd) updaten naar `qty * perCookie + bezorgkosten`

## Database (`prisma/schema.prisma`)

Drie nieuwe velden toevoegen aan `Order`:

```prisma
personalizationType  String?   // 'single' | 'multiple', default 'single'
namesInput           String?   // newline-separated names (bij multiple)
decorationThemes     String?   // comma-separated: 'baby', 'animals', 'custom'
```

Custom deco omschrijving gaat in het bestaande `notes` veld (prefix: `"Decoratie aanvraag: ..."`) — consistent met bestaand patroon voor `customColorNote`.

Migratie: `prisma db push` (dev) of `prisma migrate dev` met naam `add-decoration-fields`.

## Validatie (`lib/types.ts`)

`CreateOrderSchema` uitbreiden met:
- `personalizationType`: `z.enum(['single', 'multiple']).optional().default('single')`
- `namesInput`: `z.string().optional()`
- `decorationThemes`: `z.string().optional()` (kommagescheiden)

## Server Action (`app/actions.ts`)

- Extraheer `personalizationType`, `namesInput`, `decorationThemes`, `customDecoNote` uit formData
- Als `customDecoNote` ingevuld: prepend `"Decoratie aanvraag: {customDecoNote}\n"` aan `notes` (na eventuele kleur-aanvraag)
- Sla nieuwe velden op in DB

## E-mail aan baker (`lib/email.ts`)

Baker-notificatie uitbreiden met:
- Personalisatietype (één / verschillende namen)
- Namenlijst (als multiple)
- Decoratie-thema's (als geselecteerd)

## Verificatie

1. Ga naar `/order`, selecteer "Verschillende namen" → line1/line2 velden verdwijnen, textarea verschijnt
2. Voer namen in → controleer totaalprijs (+€0,50/stuk)
3. Selecteer decoratie-thema → controleer totaalprijs (+€0,25/stuk)
4. Selecteer "Anders" → custom deco tekstveld verschijnt
5. Plaats bestelling → controleer in DB dat `personalizationType`, `namesInput`, `decorationThemes` correct zijn opgeslagen
6. Controleer baker-e-mail bevat de nieuwe velden
