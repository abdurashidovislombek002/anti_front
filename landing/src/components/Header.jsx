import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header>
      <div className="container nav">
        <a className="brand" href="#">
          <div className="logo">A</div>
          <span className="bname">Anti<span>gram</span></span>
        </a>
        <nav>
          <ul className={`links${open ? ' open' : ''}`}>
            <li><a href="#features" onClick={() => setOpen(false)}>Imkoniyatlar</a></li>
            <li><a href="#about" onClick={() => setOpen(false)}>Biz haqimizda</a></li>
            <li><a href="#cta" className="cta" onClick={() => setOpen(false)}>Boshlash</a></li>
          </ul>
        </nav>
        <button className="burger" aria-label="Menyu" onClick={() => setOpen(!open)}>
          &#9776;
        </button>
      </div>
    </header>
  );
}