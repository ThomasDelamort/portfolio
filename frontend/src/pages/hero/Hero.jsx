import { Download, Mail, User } from "lucide-react";

const Hero = () => {
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 mt-15">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: text content */}
          <div className="space-y-6">
            <p className="text-gray-400 text-2xl">I am</p>
            <h1 className="text-9xl font-extrabold bg-linear-to-r from-red-400 via-red-700 to-red-900 bg-clip-text text-transparent">
              Neal
            </h1>
            <h2 className="text-3xl text-red-500 font-semibold">
              Fullstack Developer
            </h2>
            <p className="text-gray-400 text-lg max-w-md">
              Fullstack developer who enjoys turning ideas into clean,
              functional products. I care about the details from the code
              architecture to the pixel-perfect UI and I'm always looking for
              the next interesting problem to solve.
            </p>
            <div className="flex mt-12 items-center space-x-6">
              <button className="flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-red-900/40 transition-all hover:bg-red-500 hover:shadow-red-700/50 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black">
                <Download className="mx-1.5" />
                Resume
              </button>
              <button className="flex items-center justify-center rounded-full border-2 border-red-600 px-8 py-3 text-lg font-semibold text-red-500 transition-all hover:bg-red-600 hover:text-white hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black">
                <Mail className="mx-1.5" />
                Contact Me
              </button>
            </div>
          </div>

          {/* Right: layered design + image placeholder */}
          <div className="relative flex items-center justify-center h-full">
            {/* Decorative glow shape */}
            <div className="absolute w-80 h-100 bg-linear-to-br from-red-700 via-red-600 to-red-900 rounded-full blur-3xl opacity-30" />

            {/* Image placeholder layered on top */}
            <img
              src="/UHO3t-A0-removebg-preview.png"
              alt="Neal"
              className="w-full h-full object-cover mb-10"
            />
            {/* Replace above with: <img src="/your-photo.jpg" alt="Neal" className="w-full h-full object-cover" /> */}
          </div>
        </div>
      </div>
    </>
  );
};
export default Hero;
