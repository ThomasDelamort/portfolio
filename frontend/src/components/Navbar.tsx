import { GrArchlinux } from "react-icons/gr";
import { Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import sections from "../data/sections";

const linkClass = (isActive: boolean) =>
  `text-sm font-medium transition-colors hover:text-red-600 ${
    isActive ? "text-red-500" : "text-gray-400"
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-red-700/30 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" onClick={close} className="flex items-center gap-2 group">
          <GrArchlinux className="w-6 h-6 mr-1 text-red-700 transition-colors group-hover:text-red-400 rotate-180" />
          <h3 className="text-2xl font-bold bg-linear-to-r from-red-700 via-red-500 to-red-400 bg-clip-text text-transparent">
            Neal
          </h3>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {sections.map((section) => (
            <NavLink
              key={section.id}
              to={section.path}
              end={section.path === "/"}
              className={({ isActive }) => linkClass(isActive)}
            >
              {section.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            to="/contact"
            className="rounded-md border-2 border-red-700 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-700 hover:text-white"
          >
            Get in touch
          </Link>
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
          {sections.map((section) => (
            <NavLink
              key={section.id}
              to={section.path}
              end={section.path === "/"}
              onClick={close}
              className={({ isActive }) => linkClass(isActive)}
            >
              {section.label}
            </NavLink>
          ))}
          <Link
            to="/contact"
            onClick={close}
            className="rounded-md border-2 border-red-700 px-4 py-2 text-center text-sm font-semibold text-red-500 hover:bg-red-700 hover:text-white transition-colors"
          >
            Get in touch
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
