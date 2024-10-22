import Desktop from "@/components/main";
import Menu from "@/components/menu";
import SignInForm from "@/components/sign-in";
import SignUpForm from "@/components/sign-up";
import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

export const LOCAL_TEST_USER = 'pinapple-local-user'

export const getLocalUserId = () => {
  return localStorage.getItem(LOCAL_TEST_USER);
}

export default function Home() {
  const [showSignIn, setShowSignIn] = useState(true);
  const [localAuth, setLocalAuth] = useState(false);

  const { isSignedIn, user, isLoaded } = useUser()
  
  useEffect(() => {
    const localTestAuth = localStorage.getItem(LOCAL_TEST_USER)
    if(localTestAuth) {
      setLocalAuth(true)
    }
  }, [])

  const createLocalUser = async () => {
    //  Generate UUID
    const uuid = uuidv4();
    await fetch(`/api/users`, {
      method: "POST", 
      headers: {
        'Content-Type': 'application/json'
      }, 
      body: JSON.stringify({
        userId: uuid
      })
    })
    localStorage.setItem(LOCAL_TEST_USER, uuid)
    setLocalAuth(true);
  }

  return (
    <>
      {
        isSignedIn || localAuth ?
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
            <div aria-label="link" className="cursor-pointer mt-4 underline" onClick={createLocalUser}>Use machine as a guest</div>
          </div>
      }
    </>
  );
}
