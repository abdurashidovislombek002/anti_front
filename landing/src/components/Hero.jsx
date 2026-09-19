import PhoneMockup from './PhoneMockup';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-in">
        <div>
          <div className="badge"><span className="dot" /> Yangi avlod messenjeri</div>
          <h1>Tez, xavfsiz va<br /><span className="grad">zamonaviy</span> chat</h1>
          <p className="sub">
            Antigram — real vaqtda xabarlashish, guruh chatlar, media yuborish va online
            holatni bitta ilovada. Oddiy va go'zal interfeys bilan kunlik aloqani osonlashtiradi.
          </p>
          <div className="actions">
            <a className="btn pri" href="#cta">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Bepul boshlash
            </a>
            <a className="btn ghost" href="#features">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M10 8l6 4-6 4V8z" />
              </svg>
              Imkoniyatlar
            </a>
          </div>
          <div className="meta">
            <div><div className="num">100%</div><div className="lbl">Bepul</div></div>
            <div><div className="num">&lt;50ms</div><div className="lbl">Xabar tezligi</div></div>
            <div><div className="num">24/7</div><div className="lbl">Online</div></div>
          </div>
        </div>
        <PhoneMockup />
      </div>
    </section>
  );
}