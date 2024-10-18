import "@/styles/globals.css";
import { Metadata } from "next";
import { AppProps } from "next/app";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Head from "next/head";


export const metadata: Metadata = {
  title: "Pinapple 🍍",
  description:
    "A retro file-system-nased OS",
  icons: {
    icon: '/pineapple_favicon.png',
    shortcut: '/pineapple.png',
    apple: '/pineapple.png',
  },
  // openGraph: { images: ["/og.png"] },
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
    <Head>
        {/* Standard Meta Tags */}
        <title>Pinapple 🍍</title>
        <meta name="description" content="A retro file-system-based OS." />
        <meta name="keywords" content="Retro, Files, Apple, Developers" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Pinapple 🍍" />
        <meta property="og:description" content="A retro file-system-based OS." />
        <meta property="og:image" content="https://orange-implicit-leopon-508.mypinata.cloud/ipfs/Qmc5p5ow7mHp1QwtEc82ecwR21uy24PALDd8QufNLgg5EG" />
        <meta property="og:url" content="https://yourwebsite.com/your-page-url" />
        <meta property="og:type" content="website" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pinapple 🍍" />
        <meta name="twitter:description" content="A retro file-system-based OS." />
        <meta name="twitter:image" content="https://orange-implicit-leopon-508.mypinata.cloud/ipfs/Qmc5p5ow7mHp1QwtEc82ecwR21uy24PALDd8QufNLgg5EG" />

        {/* Favicon */}
        <link rel="icon" href="/pineapple_favicon.png" />
      </Head>
      <ClerkProvider
        appearance={{
          variables: { colorPrimary: "#000000" },
          elements: {
            formButtonPrimary:
              "btn",
            formButtonReset:
              "btn",
            membersPageInviteButton:
              "btn",
            card: "bg-[#fafafa]",
          },
        }}
      >               
        <Component {...pageProps} />
      </ClerkProvider>
    </>
  );
}

export default MyApp;