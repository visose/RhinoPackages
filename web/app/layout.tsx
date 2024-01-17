import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import Image from "next/image";
import "./globals.css";
import Spinner from "./_components/Spinner";

export const metadata: Metadata = {
  title: "Rhino Packages",
  description:
    "This website gives you a bit more info about Rhino 3D packages than what is currently available using the _PackageManager command.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Telemetry />
      </head>
      <body>
        <main className="mx-auto max-w-[51rem] px-4 py-10">
          <div className="flex flex-grow items-center justify-between border-b pb-10">
            <h1 className="text-lg uppercase tracking-wide">
              <a
                href="https://www.rhino3d.com/"
                target="_blank"
                className="font-semibold hover:underline"
              >
                Rhino
              </a>
              <span className="text-gray-600"> Packages</span>
            </h1>
            <a href="https://www.buymeacoffee.com/visose" target="_blank">
              <Image
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee"
                width={545}
                height={153}
                className="w-[7rem]"
              />
            </a>
          </div>
          <Suspense
            fallback={
              <div className="mt-10 flex justify-center">
                <Spinner />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  );
}

function Telemetry() {
  return (
    <>
      <Script
        id="analytics01"
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-2K0DM9L0LH"
      />
      <Script id="analytics02">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2K0DM9L0LH');
          `}
      </Script>
    </>
  );
}
