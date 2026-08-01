import { useState } from "react";
// import type { Socials } from "../../types/contact.types.ts";
import { Mail, MapPin, Send } from "lucide-react";
// import { FaFacebook, FaGithub, FaDiscord, FaInstagram } from "react-icons/fa";
import useScrollReveal from "../../hooks/useScrollReveal";
import { sendContact } from "../../services/contact.service.ts";
import type { ContactForm } from "../../types/contact.types.ts";

// const socials: Socials[] = [
//   {
//     icon: FaGithub,
//     href: "https://github.com/ThomasDelamort",
//     label: "GitHub",
//   },
//   {
//     icon: FaInstagram,
//     href: "https://www.instagram.com/__neallll__/",
//     label: "Instagram",
//   },
//   {
//     icon: FaFacebook,
//     href: "https://web.facebook.com/KillianTheKiller/",
//     label: "Facebook",
//   },
//   { icon: FaDiscord, href: "#", label: "Discord" },
// ];

const Contact = () => {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [revealRef, isVisible] = useScrollReveal();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await sendContact(form);

      setSuccess("Message sent successfully!");

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      err instanceof Error
        ? setError(err.message)
        : setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      ref={revealRef}
      className={`w-full bg-black py-10 px-6 reveal ${isVisible ? "reveal-visible" : ""}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 mb-14">
          <span className="font-mono text-xs tracking-[0.25em] uppercase text-red-500">
            Reach out
          </span>
          <h2 className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Let's get right to it
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: direct info + socials */}
          <div className="space-y-8">
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Have a project in mind, an opportunity, or just want to say hi? My
              inbox is always open.
            </p>

            <div className="space-y-4">
              <a href="" className="flex items-center gap-4 group">
                <span className="flex items-center justify-center w-11 h-11 rounded-full border border-red-700/30 text-red-500 transition-colors group-hover:border-red-600 group-hover:bg-red-950/30">
                  <Mail className="w-5 h-5" />
                </span>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  nealparedes776@gmail.com
                </span>
              </a>
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-11 h-11 rounded-full border border-red-700/30 text-red-500">
                  <MapPin className="w-5 h-5" />
                </span>
                <span className="text-gray-300">Cebu City, Philippines</span>
              </div>
            </div>

            {/* Socials */}
          </div>

          {/* Right: form */}
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-gray-500 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className="w-full rounded-lg border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-gray-500 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@email.com"
                required
                className="w-full rounded-lg border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-gray-500 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="Tell me about it..."
                required
                className="w-full rounded-lg border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-red-600 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-red-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-red-900/40 transition-all hover:bg-red-500 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
              <Send className="w-4 h-4" />
            </button>

            {success && (
              <p className="text-center text-green-500 text-sm">{success}</p>
            )}

            {error && (
              <p className="text-center text-red-500 text-sm">{error}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
