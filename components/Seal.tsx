export function Seal({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full border-2 border-gold text-gold font-display font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      ERK
    </div>
  );
}