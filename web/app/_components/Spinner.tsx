export default function Spinner() {
  return (
    <div
      className={
        "inline-block h-8 w-8 animate-spin rounded-full border-4 border-r-white motion-reduce:animate-[spin_1.5s_linear_infinite]"
      }
      role="status"
    />
  );
}
