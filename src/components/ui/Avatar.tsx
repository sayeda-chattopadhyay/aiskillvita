import Image from "next/image";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function Avatar({
  name,
  photo,
  size = 80,
}: {
  name: string;
  photo: string | null;
  size?: number;
}) {
  const style = { width: size, height: size, minWidth: size };
  if (photo) {
    return (
      <Image
        src={photo}
        alt={name}
        style={style}
        className="rounded-full object-cover"
      />
    );
  }
  return (
    <div
      style={style}
      className="rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-xl"
    >
      {initials(name)}
    </div>
  );
}
