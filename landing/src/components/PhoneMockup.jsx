export default function PhoneMockup() {
  return (
    <div className="phone-wrap">
      <div className="fcard">
        <div className="ic">&#10003;</div>
        <div><b>Xabar yetkazildi</b><span>hozirgina</span></div>
      </div>
      <div className="fcard2">
        <div className="r"><span className="dic">&#9679;</span> Vali yozmoqda...</div>
        <div className="r"><span className="dic">&#128101;</span> 12 a'zo online</div>
      </div>
      <div className="phone">
        <div className="notch" />
        <div className="screen">
          <div className="mhead">
            <div className="mavatar">V</div>
            <div>
              <div className="mtitle">Vali Karimov</div>
              <div className="mstatus">onlayn</div>
            </div>
          </div>
          <div className="mchat">
            <div className="bub in">Salom Vali! Ishlaring joyidami?<span className="t">10:24</span></div>
            <div className="bub out">Salom! Ha, rahmat. Yangi loyiha ajoyib chiqyapti <span className="t">10:25</span></div>
            <div className="bub in">Unda chorshanba kuni uchrashamiz, xo'pmi? <span className="t">10:26</span></div>
            <div className="bub out2">Albatta! Men tayyorman <span className="t">10:26</span></div>
            <div className="bub vin">&#10003;&#10003; Albatta! <span className="t">10:27</span></div>
          </div>
          <div className="minput">
            <div className="f">Xabar yozing...</div>
            <div className="send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg></div>
          </div>
        </div>
      </div>
    </div>
  );
}