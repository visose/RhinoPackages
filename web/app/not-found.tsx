import Link from "next/link";

export default function NotFound() {
  return (
    <div className="m-20 flex flex-col items-center">
      <h2>404 - Not Found</h2>
      <Link href="/" className="text-sm underline">
        Home
      </Link>
    </div>
  );
}
