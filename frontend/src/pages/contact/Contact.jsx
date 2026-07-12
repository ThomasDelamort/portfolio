import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { FaFacebook, FaGithub, FaDiscord, FaInstagram } from "react-icons/fa";

const socials = [
  {
    icon: FaGithub,
    href: "https://github.com/ThomasDelamort",
    label: "GitHub",
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/__neallll__/",
    label: "Instagram",
  },
  {
    icon: FaFacebook,
    href: "https://web.facebook.com/KillianTheKiller/",
    label: "Facebook",
  },
  { icon: FaDiscord, href: "#", label: "Discord" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    // Opens the user's email client pre-filled. Swap for a real backend/EmailJS later.
    const subject = encodeURIComponent(`Portfolio message from ${form.name}`);
    const body = encodeURIComponent(
      `${form.message}\n\nFrom: ${form.name} (${form.email})`,
    );
    window.location.href = `mailto:your@email.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="w-full bg-black py-10 px-6">
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
              <a
                href="mailto:your@email.com"
                className="flex items-center gap-4 group"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-full border border-red-700/30 text-red-500 transition-colors group-hover:border-red-600 group-hover:bg-red-950/30">
                  <Mail className="w-5 h-5" />
                </span>
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  nealparedes776@gmail.cpm
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
            <div className="flex items-center gap-4 pt-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-11 h-11 rounded-full border border-white/15 text-gray-400 transition-colors hover:border-red-600 hover:text-red-500"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="space-y-5">
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
                className="w-full rounded-lg border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white placeholder-gray-600 outline-none transition-colors focus:border-red-600 resize-none"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-red-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-red-900/40 transition-all hover:bg-red-500 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black"
            >
              Send message
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
