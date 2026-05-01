type ButtonProps = {
  text: string;
  size?: "sm" | "md" | "lg";
};

export default function ButtonDaisy({ text, size = "md" }: ButtonProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`inline-block cursor-pointer rounded-md bg-gray-800 text-white font-semibold uppercase transition duration-200 hover:bg-gray-900 ${sizeClasses[size]}`}
    >
      {text}
    </button>
  );
}