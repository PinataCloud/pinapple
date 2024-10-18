import * as React from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [verifying, setVerifying] = React.useState(false)
  const [code, setCode] = React.useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      await signUp.create({
        emailAddress,
        password,
      })

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })

      setVerifying(true)
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.push('/')
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err: any) {
      console.error('Error:', JSON.stringify(err, null, 2))
    }
  }

  if (verifying) {
    return (
      <>
        <h1 className="text-2xl font-semibold mb-4">Verify your email</h1>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex items-center">
            <label htmlFor="code" className="w-auto">Enter your verification code</label>
            <input
              value={code}
              id="code"
              name="code"
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 ml-2"
            />
          </div>
          <button type="submit" className="btn">
            Verify
          </button>
        </form>
      </>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Create User Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center">
          <label htmlFor="email" className="w-auto">Enter email address</label>
          <input
            id="email"
            type="email"
            name="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="flex-1 ml-2"
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="password" className="w-40">Enter password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 ml-2"
          />
        </div>
        <button type="submit" className="btn">
          Continue
        </button>
      </form>
    </>
  )
}
