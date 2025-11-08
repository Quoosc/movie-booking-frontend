// src/layouts/AuthLayout.jsx
export default function AuthLayout({ left, right }) {
  return (
    <main className="flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Form side */}
      <section className="relative w-full lg:w-1/2 h-screen overflow-y-auto bg-gradient-to-b from-[#130022] via-[#1b002b] to-[#12001e]">
        <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(circle_at_20%_10%,rgba(142,36,170,.35),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(91,46,145,.35),transparent_35%)]" />
        <div className="relative min-h-screen p-8 flex items-center justify-center">
          <div className="w-full max-w-md">{left}</div>
        </div>
      </section>

      {/* Banner side */}
      <section className="hidden lg:block lg:w-1/2 h-screen overflow-hidden bg-gradient-to-br from-[#2E004F] via-[#3C1361] to-[#000] relative">
        <div className="absolute inset-0 bg-black/20" />
        {right}
      </section>
    </main>
  );
}
