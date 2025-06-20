const ContactSection = () => {
  return (
    <section className="w-full bg-white dark:bg-[#0f0e26] px-6 py-16">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* Contact Us */}
        <div className="flex-1 bg-[#f5f3ff] dark:bg-[#1e1b4b] p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
            Contact Us
          </h2>
          <p className="text-neutral-800 dark:text-indigo-200 mb-4">
            Have a question or feedback? We’d love to hear from you!
          </p>
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              className="px-4 py-2 rounded-lg bg-white dark:bg-[#312e81] text-neutral-900 dark:text-white border border-neutral-300 dark:border-indigo-500"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="px-4 py-2 rounded-lg bg-white dark:bg-[#312e81] text-neutral-900 dark:text-white border border-neutral-300 dark:border-indigo-500"
            />
            <textarea
              placeholder="Your Message"
              rows={4}
              className="px-4 py-2 rounded-lg bg-white dark:bg-[#312e81] text-neutral-900 dark:text-white border border-neutral-300 dark:border-indigo-500"
            />
            <button
              type="submit"
              className="self-start bg-indigo-600 dark:bg-indigo-400 text-white dark:text-black px-6 py-2 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
