import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section
      id="not-found"
      className="w-full min-h-[70vh] grid place-items-center bg-linear-to-t from-black via-zinc-950 to-red-950 px-6 py-20"
    >
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-[clamp(4rem,14vw,10rem)] leading-none font-extrabold bg-linear-to-r from-red-400 via-red-700 to-red-900 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-bold text-red-500">
          This page fell past the event horizon.
        </h2>
        <p className="text-gray-400 text-lg">
          The page you're looking for doesn't exist, or it moved somewhere else.
        </p>
        <Link to="/" className="btn-contact inline-flex">
          Back home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
