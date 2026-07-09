import { Download, Mail } from "lucide-react";

const Hero = () => {
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 mt-30">
        <div className="space-y-6">
          <p className="text-gray-400 text-2xl">I am</p>
          <h1 className="text-9xl font-extrabold bg-linear-to-r from-red-400 via-red-700 to-red-900 bg-clip-text text-transparent">
            Neal
          </h1>
          <h2 className="text-3xl text-red-500 font-semibold">
            Fullstack Developer
          </h2>
          <p className="text-gray-400 text-lg max-w-md">
            Fullstack developer who enjoys turning ideas into clean, functional
            products. I care about the details from the code architecture to the
            pixel-perfect UI and I'm always looking for the next interesting
            problem to solve.
          </p>
          <div className="flex mt-12 space-x-6">
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
      </div>
    </>
  );
};
export default Hero;
