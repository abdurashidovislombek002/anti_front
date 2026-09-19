export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot">
          <a className="brand" href="#">
            <div className="logo">A</div>
            <span className="bname">Anti<span>gram</span></span>
          </a>
          <div className="foot-links">
            <a href="#features">Imkoniyatlar</a>
            <a href="#about">Biz haqimizda</a>
            <a href="#cta">Boshlash</a>
          </div>
        </div>
        <div className="fcopy">
          &copy; {new Date().getFullYear()} Antigram. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}