// src/components/shared/TextInput.jsx
export default function TextInput({
  label, name, value, onChange, placeholder,
  type='text', icon, error, showPasswordToggle, showPassword, onTogglePassword,
}) {
  return (
    <div>
      {label && <label htmlFor={name} className="block text-sm text-white/80 mb-1">{label}</label>}
      <div className={`flex items-center gap-2 rounded-xl border ${error? 'border-red-500/70' : 'border-white/15'} bg-white/5 px-3 py-2 focus-within:ring-2 focus-within:ring-[#5B2E91]`}>
        {icon && <span className="text-white/80">{icon}</span>}
        <input
          id={name} name={name} value={value} onChange={onChange}
          placeholder={placeholder} type={type}
          className="w-full bg-transparent outline-none text-white placeholder-white/50"
        />
        {showPasswordToggle && (
          <button type="button" onClick={onTogglePassword} className="text-[#FFD700] text-sm">
            {showPassword? 'Ẩn' : 'Hiện'}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
