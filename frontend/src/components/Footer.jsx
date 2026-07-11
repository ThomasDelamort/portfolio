import { SiSaturn } from "react-icons/si";
import { FaFacebook, FaGithub, FaDiscord, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <>
      <footer className="w-full border-t border-red-700/30">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2 group">
            <SiSaturn className="w-7 h-7 mr-1 text-red-700 transition-colors group-hover:text-red-400" />
            <h3 className="text-2xl font-bold bg-linear-to-r from-red-700 via-red-500 to-red-400 bg-clip-text text-transparent">
              Neal
            </h3>
          </a>

          <p className="text-md text-red-500 font-medium">
            &copy; {new Date().getFullYear()} Neal. All rights reserved.
          </p>

          <div className="flex items-center space-x-4">
            <a href="https://web.facebook.com/KillianTheKiller/">
              <FaFacebook className="w-7 h-7 text-red-700 hover:text-red-400 transition-colors cursor-pointer" />
            </a>
            <a href="https://github.com/ThomasDelamort">
              <FaGithub className="w-7 h-7 text-red-700 hover:text-red-400 transition-colors cursor-pointer" />
            </a>
            <a href="">
              <FaDiscord className="w-7 h-7 text-red-700 hover:text-red-400 transition-colors cursor-pointer" />
            </a>
            <a href="https://www.instagram.com/__neallll__/">
              <FaInstagram className="w-7 h-7 text-red-700 hover:text-red-400 transition-colors cursor-pointer" />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
