// src/components/auth/shared/AuthRedirect.jsx
import { Link } from 'react-router-dom';

export default function AuthRedirect({ text, linkText, href }) {
  return (
    <div className="mt-6 text-center">
      <p className="text-white/85">
        {text}{' '}
        <Link
          to={href}
          className="text-[#FFD700] hover:text-[#FFB300] font-semibold underline underline-offset-4 transition-all duration-300 hover:drop-shadow-[0_0_6px_#FFD700]"
        >
          {linkText}
        </Link>
      </p>
    </div>
  );
}
