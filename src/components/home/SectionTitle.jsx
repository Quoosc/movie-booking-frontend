export default function SectionTitle({ title }) {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-8 mb-4">
      <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
        {title}
      </h3>
      <div className="h-1 w-24 bg-[#FFD700] mt-2 rounded-full" />
    </div>
  );
}
