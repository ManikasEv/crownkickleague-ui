import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useSignIn, useSignUp } from '@clerk/clerk-react'

import { apiFetch } from '../lib/api.js'
import wlogo from '../assets/wlogo.png'

const initialForm = {
  email: '',
  password: '',
  username: '',
}

function AuthPage() {
  const navigate = useNavigate()
  const { isSignedIn, getToken } = useAuth()
  const { isLoaded, signIn, setActive } = useSignIn()
  const { signUp } = useSignUp()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [verificationCode, setVerificationCode] = useState('')
  const [awaitingVerification, setAwaitingVerification] = useState(false)
  const [awaitingLoginCode, setAwaitingLoginCode] = useState(false)
  const [loginVerificationMode, setLoginVerificationMode] = useState(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const isRegister = mode === 'register'
  const title = useMemo(() => (isRegister ? 'Create account' : 'Login'), [isRegister])

  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard')
    }
  }, [isSignedIn, navigate])

  useEffect(() => {
    document.title = isRegister
      ? 'Create Account | CrownKick League'
      : 'Login | CrownKick League'
  }, [isRegister])

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function syncAuthenticatedUser(username) {
    const token = await getToken()
    const { response, body } = await apiFetch('/api/auth/sync', {
      method: 'POST',
      body: JSON.stringify(username ? { username } : {}),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(body?.message || 'Failed to sync user profile')
    }
  }

  async function signInWithClerk(email, password) {
    if (!isLoaded) throw new Error('Clerk is loading')

    const result = await signIn.create({
      identifier: email,
      password,
    })

    if (result.status !== 'complete') {
      if (result.status === 'needs_first_factor') {
        const emailCodeFactor = result.supportedFirstFactors?.find(
          (factor) => factor.strategy === 'email_code' && factor.emailAddressId,
        )

        if (emailCodeFactor?.emailAddressId) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          })
          setLoginVerificationMode('email_code')
          setAwaitingLoginCode(true)
          return false
        }
      }

      if (result.status === 'needs_second_factor') {
        const supportsTotp = result.supportedSecondFactors?.some(
          (factor) => factor.strategy === 'totp',
        )
        if (supportsTotp) {
          setLoginVerificationMode('totp')
          setAwaitingLoginCode(true)
          return false
        }

        const supportsBackupCode = result.supportedSecondFactors?.some(
          (factor) => factor.strategy === 'backup_code',
        )
        if (supportsBackupCode) {
          setLoginVerificationMode('backup_code')
          setAwaitingLoginCode(true)
          return false
        }
      }

      throw new Error('This account needs an extra login step in Clerk (email code or MFA).')
    }

    await setActive({ session: result.createdSessionId })
    await syncAuthenticatedUser()
    return true
  }

  async function handleRegister() {
    if (!isLoaded || !signUp) {
      throw new Error('Clerk is loading')
    }

    const result = await signUp.create({
      emailAddress: form.email.trim().toLowerCase(),
      password: form.password,
    })

    if (result.status === 'complete') {
      await setActive({ session: result.createdSessionId })
      await syncAuthenticatedUser(form.username)
      navigate('/dashboard')
      return
    }

    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
    setAwaitingVerification(true)
  }

  async function handleEmailVerification() {
    if (!signUp) {
      throw new Error('Clerk is loading')
    }

    const verified = await signUp.attemptEmailAddressVerification({
      code: verificationCode.trim(),
    })

    if (verified.status !== 'complete') {
      throw new Error('Verification is not complete yet. Please check the email code and try again.')
    }

    await setActive({ session: verified.createdSessionId })
    await syncAuthenticatedUser(form.username)
    navigate('/dashboard')
  }

  async function handleLogin() {
    const complete = await signInWithClerk(form.email, form.password)
    if (complete) {
      navigate('/dashboard')
    }
  }

  async function handleLoginCodeVerification() {
    if (!signIn) {
      throw new Error('Clerk is loading')
    }

    const code = verificationCode.trim()
    const verified =
      loginVerificationMode === 'email_code'
        ? await signIn.attemptFirstFactor({
            strategy: 'email_code',
            code,
          })
        : loginVerificationMode === 'totp'
        ? await signIn.attemptSecondFactor({
            strategy: 'totp',
            code,
          })
        : loginVerificationMode === 'backup_code'
        ? await signIn.attemptSecondFactor({
            strategy: 'backup_code',
            code,
          })
        : null

    if (!verified) {
      throw new Error('Unsupported verification method. Check your Clerk sign-in settings.')
    }

    if (verified.status !== 'complete') {
      throw new Error('Verification is not complete yet. Please check the email code and try again.')
    }

    await setActive({ session: verified.createdSessionId })
    await syncAuthenticatedUser()
    navigate('/dashboard')
  }

  async function onSubmit(event) {
    event.preventDefault()
    setPending(true)
    setError('')

    try {
      if (isRegister) {
        if (awaitingVerification) {
          await handleEmailVerification()
        } else {
          await handleRegister()
        }
      } else if (awaitingLoginCode) {
        await handleLoginCodeVerification()
      } else {
        await handleLogin()
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-slate-100 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-blue-900/70 bg-slate-900/85 p-8 shadow-[0_20px_70px_rgba(2,6,23,0.6)] backdrop-blur">
        <div className="mb-5 flex flex-col items-center">
          <img src={wlogo} alt="World Cup USA Betting logo" className="h-24 w-auto drop-shadow-[0_10px_24px_rgba(15,23,42,0.65)]" />
        </div>

        <p className="text-center text-xs font-semibold uppercase tracking-widest text-red-200">CrownKick League</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-blue-100/80">
          {isRegister && awaitingVerification
            ? 'Enter the email verification code sent by Clerk.'
            : !isRegister && awaitingLoginCode
            ? loginVerificationMode === 'totp'
              ? 'Enter the 6-digit code from your authenticator app.'
              : loginVerificationMode === 'backup_code'
              ? 'Enter one of your Clerk backup codes.'
              : 'Enter the login verification code sent to your email.'
            : isRegister
            ? 'Register for the friendliest World Cup guessing game.'
            : 'Sign in to continue your World Cup picks.'}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} autoComplete="off">
          {isRegister && !awaitingVerification && (
            <div>
              <label htmlFor="username" className="mb-1 block text-sm text-blue-100">
                Username
              </label>
              <input
                id="username"
                name="crownkick-username"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-lg border border-blue-900/80 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/30"
                placeholder="unique_username"
                value={form.username}
                onChange={onChange('username')}
                required
              />
            </div>
          )}

          {!awaitingVerification && !awaitingLoginCode && (
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-blue-100">
                Email
              </label>
              <input
                id="email"
                name="crownkick-email"
                type="email"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                spellCheck={false}
                className="w-full rounded-lg border border-blue-900/80 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/30"
                placeholder="user@example.com"
                value={form.email}
                onChange={onChange('email')}
                required
              />
            </div>
          )}

          {!awaitingVerification && !awaitingLoginCode && (
            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-blue-100">
                Password
              </label>
              <input
                id="password"
                name="crownkick-password"
                type="password"
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore="true"
                className="w-full rounded-lg border border-blue-900/80 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/30"
                placeholder="Secretpass"
                value={form.password}
                onChange={onChange('password')}
                required
              />
            </div>
          )}

          {(isRegister && awaitingVerification) || (!isRegister && awaitingLoginCode) ? (
            <div>
              <label htmlFor="verificationCode" className="mb-1 block text-sm text-blue-100">
                Email verification code
              </label>
              <input
                id="verificationCode"
                name="crownkick-verification-code"
                autoComplete="one-time-code"
                className="w-full rounded-lg border border-blue-900/80 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-600/30"
                placeholder="123456"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                required
              />
            </div>
          ) : null}

          {/*
            Existing field blocks below are intentionally removed in verification step.
          */}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2 font-semibold text-white transition hover:from-blue-600 hover:to-blue-400 disabled:opacity-60"
          >
            {pending
              ? 'Please wait...'
              : isRegister
              ? awaitingVerification
                ? 'Verify email code'
                : 'Create account'
              : awaitingLoginCode
              ? 'Verify login code'
              : 'Login'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError('')
            setAwaitingVerification(false)
            setAwaitingLoginCode(false)
            setLoginVerificationMode(null)
            setVerificationCode('')
            setMode(isRegister ? 'login' : 'register')
          }}
          className="mt-4 text-sm text-red-200 hover:text-red-100"
        >
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </section>
    </main>
  )
}

export default AuthPage
