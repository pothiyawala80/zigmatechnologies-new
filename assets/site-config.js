/* ============================================================
   ZIGMA — SITE SETTINGS  (edit these, save, refresh)
   ============================================================ */
window.ZIGMA_CONFIG = {
  company:  "Zigma Technologies Solutions",
  email:    "contact@zigmatechnologiessolutions.com",
  phone:    "+91 96736 13027",
  whatsapp: "919673613027",          // country code + number, digits only

  /* OPTIONAL — receive form messages straight in your inbox.
     1. Create a free form at https://formspree.io (sign up with your email)
     2. Paste the form URL below, e.g. "https://formspree.io/f/abcdwxyz"
     Leave it "" and the forms will open the visitor's email app / WhatsApp instead. */
  formEndpoint: "",

  /* Show the little "Need help?" chat bubble after a few seconds */
  greeting: true,
  greetingText: "Hi 👋 Planning a project? Chat with us on WhatsApp.",

  faq: [
    ["How much does a project cost?", "It depends on scope. Use the project planner or send us a short brief and we'll reply with a free, no-obligation quote."],
    ["How long does a typical project take?", "Small websites can go live in a few weeks; apps and custom platforms usually take a few months. You'll get a clear timeline before we start."],
    ["Can you work with our existing team or code?", "Yes. We can join your team, take over an existing codebase, or improve a product that's already live."],
    ["Do you sign an NDA?", "Absolutely. We're happy to sign an NDA before you share any details."],
    ["Do you offer support after launch?", "Yes. We offer ongoing support, monitoring and improvements so your product keeps running smoothly."]
  ]
};

/* Animations on/off — remembered per visitor (toggle lives in the floating dock) */
(function(){
  var off = false;
  try { off = localStorage.getItem('zigma-motion') === 'off'; } catch(e){}
  window.ZIGMA_REDUCED = off || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (off) document.documentElement.classList.add('zr');
})();
