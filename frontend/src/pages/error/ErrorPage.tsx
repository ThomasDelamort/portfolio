import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// Hangs off the root route, so it replaces the layout entirely and has to
// render its own chrome.
const ErrorPage = () => {
  const error = useRouteError();

  let status = "Error";
  let message = "Something went wrong on our end.";

  if (isRouteErrorResponse(error)) {
    status = String(error.status);
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <>
      <Navbar />
      <main>
        <section className="w-full min-h-[70vh] grid place-items-center bg-linear-to-t from-black via-zinc-950 to-red-950 px-6 py-20">
          <div className="max-w-xl text-center space-y-6">
            <h1 className="text-[clamp(3rem,10vw,7rem)] leading-none font-extrabold bg-linear-to-r from-red-400 via-red-700 to-red-900 bg-clip-text text-transparent">
              {status}
            </h1>
            <p className="text-gray-400 text-lg break-words">{message}</p>
            <Link to="/" className="btn-contact inline-flex">
              Back home
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ErrorPage;
