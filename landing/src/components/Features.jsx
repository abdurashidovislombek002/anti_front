const FEATURES = [
  {
    title: 'Real vaqt xabarlari',
    desc: 'Socket.io asosidagi real-vaqt aloqa — xabarlar deyarli bir zumda yetib boradi, qayta yuklash shart emas.',
    color: '',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 01-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 113.6 3.7 8.38 8.38 0 01-3.8-.9" />
      </svg>
    ),
  },
  {
    title: 'Guruh chatlar',
    desc: 'Katta guruhlar yarating, a\'zolarni qo\'shing va hammaga bir vaqtda yozing. Guruh nomi va rasmini oson boshqaring.',
    color: 'g',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: 'Media yuborish',
    desc: 'Rasmlar, video va hujjatlarni tez va xavfsiz yuboring. Fotosuratlar va fayllar ilovada saqlanadi.',
    color: 'p',
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    title: 'Online holat',
    desc: 'Do\'stlaringiz onlayn yoki oflaynligini va qachon yozmoqda ekanini ko\'ring. Xabarlar darhol yangilanadi.',
    color: '',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M21 12a9 9 0 01-9 9 9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: 'Izlab topish',
    desc: 'Xabarlar va chatlarda tez qidiruv — istalgan yozishmani bir zumda topasiz. O\'qilmagan xabarlar hisobga olinadi.',
    color: 'g',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    title: 'Xavfsiz va shaxsiy',
    desc: 'Hisobingiz shifrlangan parol bilan himoyalangan, ma\'lumotlaringiz faqat sizga tegishli. JWT asosida xavfsiz kirish.',
    color: 'p',
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section id="features">
      <div className="container center">
        <span className="tag">Imkoniyatlar</span>
        <h2 className="sec-title reveal">Nega Antigram?</h2>
        <p className="sec-sub reveal">
          Kundalik muloqot uchun kerakli hamma narsa — oldindan rejalashtirilgan va sinovdan o\'tgan.
        </p>
        <div className="grid">
          {FEATURES.map((f, i) => (
            <div className={`card reveal`} style={{ transitionDelay: `${(i % 3) * 80}ms` }} key={f.title}>
              <div className={`ficon ${f.color}`}>{f.icon}</div>
              <div className="fname">{f.title}</div>
              <div className="fdesc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}