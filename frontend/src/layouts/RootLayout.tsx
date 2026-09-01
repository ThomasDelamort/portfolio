import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import useSectionSync from "../hooks/useSectionSync";

const MIN_LOADER_MS = 3500;

const RootLayout = () => {
  const [loading, setLoading] = useState(true);

  useSectionSync(loading);

  useEffect(() => {
    const startTime = Date.now();
    const imgs = Array.from(document.images);

    // Dismiss the loader, but never before MIN_LOADER_MS has elapsed.
    const finish = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(MIN_LOADER_MS - elapsed, 0);
      setTimeout(() => setLoading(false), remaining);
    };

    // Safety fallback: never hang longer than MIN + 6s even if an image stalls.
    const failsafe = setTimeout(() => setLoading(false), MIN_LOADER_MS + 6000);

    if (imgs.length === 0) {
      finish();
      return () => clearTimeout(failsafe);
    }

    let loaded = 0;
    const done = () => {
      loaded += 1;
      if (loaded >= imgs.length) finish();
    };

    imgs.forEach((img) => {
      if (img.complete) {
        done();
      } else {
        img.addEventListener("load", done);
        img.addEventListener("error", done);
      }
    });

    return () => {
      clearTimeout(failsafe);
      imgs.forEach((img) => {
        img.removeEventListener("load", done);
        img.removeEventListener("error", done);
      });
    };
  }, []);

  // Lock scroll while loading
  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  return (
    <>
      <Loader done={!loading} />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default RootLayout;
