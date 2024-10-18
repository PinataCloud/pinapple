import Desktop from "@/components/main";
import Menu from "@/components/menu";
import SignInForm from "@/components/sign-in";
import SignUpForm from "@/components/sign-up";
import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";


export default function Home() {
  const [showSignIn, setShowSignIn] = useState(true);
  const { isSignedIn, user, isLoaded } = useUser()

  return (
    <>
      {
        isSignedIn ?
          <div>            
            <Desktop />
          </div> :
          <div className="min-w-screen min-h-screen flex flex-col justify-center items-center">
            <img src="/pineapple.png" alt="Pineapple" className="h-20" />
            {showSignIn ?
              <div>
                <SignInForm />
                <div aria-label="link" className="cursor-pointer mt-4 underline" onClick={() => setShowSignIn(!showSignIn)}>Need to create a user profile for this machine?</div>
              </div> : 
              <div> 
                <SignUpForm />
                <div aria-label="link" className="cursor-pointer mt-4 underline" onClick={() => setShowSignIn(!showSignIn)}>Already have a user profile for this machine?</div>
              </div>
            }
          </div>
      }
    </>
  );
}
