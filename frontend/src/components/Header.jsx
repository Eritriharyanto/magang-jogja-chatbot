import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { NAV } from "@/data/content";

function Header() {
  return (
    <header className="sticky top-0 z-40 bg-mj-green-dark">
      <nav className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link to="/#top" aria-label="magangjogja.com">
          <img src={logo} alt="magangjogja.com" width={552} height={63} className="h-6 w-auto" />
        </Link>
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-2">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link
                to={`/${n.href}`}
                className="group relative inline-block text-[0.95rem] font-medium text-white transition-colors hover:text-mj-yellow"
              >
                {n.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-mj-yellow transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
