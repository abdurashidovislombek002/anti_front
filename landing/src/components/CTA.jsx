export default function CTA() {
  return (
    <section id="cta">
      <div className="container">
        <div className="cta-box reveal">
          <span className="tag">Bugun boshlang</span>
          <h2 className="sec-title">Antigram'ga qo'shiling</h2>
          <p className="sec-sub">
            Hisob ochish bir daqiqa. Telefoningizda ham, kompyuteringizda ham bepul va cheksiz muloqot qiling.
          </p>
          <div className="cta-btns">
            <a className="btn pri" href="#">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Ro'yxatdan o'tish
            </a>
            <a className="btn ghost" href="http://localhost:5173" target="_blank" rel="noreferrer">
              Ilovani ochish
            </a>
          </div>
          <div className="note">Bepul · Ro'yxatdan o'tish shart emas · Veb va mobil</div>
        </div>
      </div>
    </section>
  );
}