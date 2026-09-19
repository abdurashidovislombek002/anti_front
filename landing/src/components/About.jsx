const CHECKS = [
  {
    title: 'Hammasi bitta joyda',
    desc: 'Shaxsiy va guruh chatlar, media almashish va qidiruv — ilova ichida to\'liq yechim.',
  },
  {
    title: 'Har qurilmada ishlaydi',
    desc: 'Brauzer va mobil ilova uchun bitta hisob — telefonda ham, kompyuterda ham bir yerdan davom eting.',
  },
  {
    title: 'Tez va fanat bo\'lmagan interfeys',
    desc: 'Qorong\'u mavzu, silliq animatsiyalar va qulay navigatsiya — muloqot zavq keltiradi.',
  },
];

const CHIPS = [
  { label: 'React + Vite', g: false },
  { label: 'WebSocket real vaqt', g: false },
  { label: 'Ochiq API', g: true },
  { label: 'JWT himoya', g: true },
];

function CheckMark() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>;
}

export default function About() {
  return (
    <section id="about">
      <div className="container split">
        <div>
          <span className="tag reveal">Biz haqimizda</span>
          <h2 className="sec-title reveal">Oddiydan boshlangan, kuchli messenjerga aylandi</h2>
          <p className="sec-sub reveal" style={{ marginBottom: 32 }}>
            Antigram do\'stlar va oila uchun bepul, ochiq va tezkor messenjer bo\'lishni maqsad qilgan.
            Har bir yangi imkoniyat ishlatishdan oldin sinovdan o\'tkaziladi.
          </p>
          <div className="check">
            {CHECKS.map((c, i) => (
              <div className="check-item reveal" style={{ transitionDelay: `${i * 90}ms` }} key={c.title}>
                <div className="check-ic"><CheckMark /></div>
                <div>
                  <b>{c.title}</b>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="reveal">
          <div className="phone" style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}>
            <div className="notch" />
            <div className="screen">
              <div className="mhead">
                <div className="mavatar" style={{ background: 'linear-gradient(135deg,#4caf50,#66bb6a)' }}>G</div>
                <div>
                  <div className="mtitle">Dasturchilar jamoasi</div>
                  <div className="mstatus">12 a\'zo online</div>
                </div>
              </div>
              <div className="mchat">
                <div className="bub in"><b>Aziz:</b> Antigram 2.0 rejasi tayyor!<span className="t">10:40</span></div>
                <div className="bub in"><b>Malika:</b> Zo\'r, guruh video qo\'shamizmi? <span className="t">10:41</span></div>
                <div className="bub out2">Ha, reja ustida ishlayapmiz &#128073;<span className="t">10:42</span></div>
                <div className="bub in"><b>Jasur:</b> UX yaxshilangan, ui teksha olaman <span className="t">10:43</span></div>
              </div>
            </div>
          </div>
          <div className="chips">
            {CHIPS.map((c) => (
              <span className="chip" key={c.label}>
                <span className={`ci${c.g ? ' g' : ''}`}>&#10003;</span>{c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}