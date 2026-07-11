import { SiSaturn } from "react-icons/si";
import { Menu } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Projects", href: "#" },
  { label: "Skills", href: "#" },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full border-b border-red-700/30">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2 group">
          <SiSaturn className="w-7 h-7 mr-1 text-red-700 transition-colors group-hover:text-red-400" />
          <h3 className="text-2xl font-bold bg-linear-to-r from-red-700 via-red-500 to-red-400 bg-clip-text text-transparent">
            Neal
          </h3>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-gray-400 transition-colors hover:text-red-600"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a
            href="#"
            className="rounded-md border-2 border-red-700 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-700 hover:text-white"
          >
            Get in touch
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-red-500 hover:text-red-400"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-red-700/30 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-gray-400 hover:text-red-400"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#"
            className="rounded-md border-2 border-red-700 px-4 py-2 text-center text-sm font-semibold text-red-500 hover:bg-red-700 hover:text-white transition-colors"
          >
            Get in touch
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
