import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.push('/')
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Access User Profile</h1>
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        <div className="flex items-center">
          <label htmlFor="email" className="w-auto">Enter email address</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            name="email"
            type="email"
            value={email}
            className="flex-1 ml-2"
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="password" className="w-40">Enter password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            name="password"
            type="password"
            value={password}
            className="flex-1 ml-2"
          />
        </div>
        <button
          type="submit"
          className="btn"
        >
          Sign in
        </button>
      </form>
    </>
  )
}
