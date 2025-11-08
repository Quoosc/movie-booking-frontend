// src/components/auth/shared/AuthDivider.jsx
export default function AuthDivider({ text }) {
  return (
    <div className="relative my-6 flex items-center justify-center">
      <div className="flex-grow border-t border-[#FFD700]/40"></div>
      <span className="mx-3 px-3 text-[#FFD700]/90 text-sm font-medium uppercase tracking-wide">
        {text}
      </span>
      <div className="flex-grow border-t border-[#FFD700]/40"></div>
    </div>
  );
}
