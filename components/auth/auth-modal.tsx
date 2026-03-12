"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Chrome } from "lucide-react"
import { toast } from "sonner"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { confirmSignUp as awsConfirmSignUp, resendSignUpCode } from 'aws-amplify/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "signin" | "signup"
}

const AuthModal = observer(({
  isOpen,
  onClose,
  defaultMode = "signin",
}: AuthModalProps) => {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(defaultMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [resetStep, setResetStep] = useState<"send" | "verify">("send")
  const [isLoading, setIsLoading] = useState(false)

  const { authStore, loadingStore } = useStore()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", email: "", password: "", otp: "", newPassword: "", confirmPassword: "" })
      setShowOtp(false)
      setUserEmail("")
      setUserPassword("")
      setMode(defaultMode)
      setResetStep("send")
      authStore.clearError()
    }
  }, [isOpen, defaultMode])

  // Display auth store errors
  useEffect(() => {
    if (authStore.error) {
      toast.error(authStore.error)
    }
  }, [authStore.error])

  const getFriendlyErrorMessage = (error: any): string => {
    const errorMessage = error?.message || 'Something went wrong';
    if (errorMessage.includes('User already exists')) {
      return 'An account with this email already exists. Please sign in or use a different email.';
    }
    if (errorMessage.includes('Incorrect username or password')) {
      return 'Incorrect email or password. Please try again.';
    }
    if (errorMessage.includes('Password did not conform with policy')) {
      return 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.';
    }
    if (errorMessage.includes('Invalid verification code')) {
      return 'The verification code is invalid or has expired. Please request a new one.';
    }
    if (errorMessage.includes('User is not confirmed')) {
      return 'Please verify your email address before signing in. Check your inbox for the verification code.';
    }
    return errorMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'signup') {
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters long.')
        return;
      }
      if (!/[A-Z]/.test(formData.password)) {
        toast.error('Password must contain at least one uppercase letter (A-Z).')
        return;
      }
      if (!/[a-z]/.test(formData.password)) {
        toast.error('Password must contain at least one lowercase letter (a-z).')
        return;
      }
      if (!/[0-9]/.test(formData.password)) {
        toast.error('Password must contain at least one number (0-9).')
        return;
      }
      if (!/[^A-Za-z0-9]/.test(formData.password)) {
        toast.error('Password must contain at least one special character (e.g., !@#$%^&*).')
        return;
      }
    }

    setIsLoading(true)
    loadingStore.startLoading(mode === "signin" ? "Signing in..." : "Creating account...")
    try {
      if (mode === "signin") {
        await authStore.login({
          email: formData.email,
          password: formData.password,
        })
        toast.success("Successfully signed in. Welcome back!")
        onClose()
        const params = new URLSearchParams(window.location.search)
        const redirect = params.get('redirect')
        if (redirect) {
          window.location.href = redirect
        }
        return
      }

      if (mode === "signup") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          throw new Error('Please enter a valid email address.');
        }

        const registerResult = await authStore.register({
          fullname: formData.name,
          email: formData.email,
          password: formData.password,
        })

        if (registerResult.autoLogin && authStore.user) {
          toast.success("🎉 Welcome to Grodify! You're now logged in.")
          onClose()
          const params = new URLSearchParams(window.location.search)
          const redirect = params.get('redirect')
          if (redirect) {
            window.location.href = redirect
          }
          return
        }

        if (!registerResult.autoLogin) {
          setUserEmail(formData.email)
          setUserPassword(formData.password)
          setShowOtp(true)
          setFormData(prev => ({ ...prev, password: "" }))
          toast.success(registerResult.message || "✅ Account Created! Please check your email for verification code.")
        }
      }
    } catch (error: any) {
      toast.error(getFriendlyErrorMessage(error))
    } finally {
      setIsLoading(false)
      loadingStore.stopLoading()
    }
  }

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      toast.error("Please enter the verification code")
      return
    }

    try {
      setIsLoading(true)
      loadingStore.startLoading("Verifying...")
      const { isSignUpComplete } = await awsConfirmSignUp({
        username: userEmail,
        confirmationCode: formData.otp
      });

      if (isSignUpComplete) {
        if (userEmail && userPassword) {
          try {
            await authStore.login({
              email: userEmail,
              password: userPassword,
            })

            try {
              const { resend } = await import('@/lib/resend');
              const { render } = await import('@react-email/render');
              const { RegistrationVerificationEmail } = await import('@/emails/RegistrationVerification');
              const emailHtml = await render(
                <RegistrationVerificationEmail
                  name={userEmail.split('@')[0]}
                  verificationUrl="https://grodify.com/profile"
                />
              );
              await resend.emails.send({
                from: "Grodify <support@mail.grodify.com>",
                to: userEmail,
                replyTo: "admin@grodify.com",
                subject: "Welcome to Grodify - Email Verified! ✅",
                html: emailHtml,
              });
            } catch (emailErr) {
              console.error('Verification email failed:', emailErr);
            }

            toast.success("🎉 Welcome to Grodify! Your email has been verified.")
            onClose()
            return
          } catch (loginError: any) {
            toast.success("✅ Email Verified! Please sign in manually.")
            setShowOtp(false)
            setMode("signin")
            return
          }
        }

        toast.success("✅ Email Verified! You can now sign in.")
        setShowOtp(false)
        setMode("signin")
      } else {
        toast("Please complete the additional verification steps.")
      }
    } catch (error: any) {
      toast.error(error?.message || "Invalid verification code")
    } finally {
      setIsLoading(false)
      loadingStore.stopLoading()
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    authStore.clearError()
    setIsLoading(true)
    loadingStore.startLoading("Sending reset code...")
    const emailToReset = formData.email.trim();

    if (!emailToReset) {
      toast.error("Please enter your email address")
      setIsLoading(false)
      loadingStore.stopLoading()
      return
    }

    try {
      await authStore.sendOTP(emailToReset)
      toast.success("A password reset code has been sent to your email.")
      setUserEmail(emailToReset)
      setResetStep("verify")
    } catch (error: any) {
      toast.error(error?.message || "This email is not registered. Please create a new account.")
    } finally {
      setIsLoading(false)
      loadingStore.stopLoading()
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    authStore.clearError()

    const emailToUse = userEmail || formData.email
    const code = formData.otp.trim()
    const newPass = formData.newPassword

    if (!emailToUse) {
      toast.error("User information missing. Please try again from the start.")
      setResetStep("send")
      return
    }

    if (newPass !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (newPass.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)
    loadingStore.startLoading("Resetting password...")
    try {
      await authStore.verifyOTP(emailToUse, code, newPass)
      toast.success("Your password has been reset successfully. Please sign in with your new password.")
      setMode("signin")
      setResetStep("send")
      setFormData(prev => ({ ...prev, password: "", otp: "", newPassword: "", confirmPassword: "" }))
    } catch (error: any) {
      toast.error(error?.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
      loadingStore.stopLoading()
    }
  }

  const handleResendOtp = async () => {
    try {
      setIsLoading(true)
      loadingStore.startLoading("Resending code...")
      const { destination, deliveryMedium } = await resendSignUpCode({
        username: userEmail
      });
      toast.success(`A new verification code has been sent to ${destination} via ${deliveryMedium}.`)
    } catch (error: any) {
      toast.error(error?.message || "Failed to resend verification code. Please try again.")
    } finally {
      setIsLoading(false)
      loadingStore.stopLoading()
    }
  }

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    try {
      setIsLoading(true)
      loadingStore.startLoading(`Continuing with ${provider}...`)
      await authStore.signInWithProvider(provider)
    } catch (error: any) {
      toast.error(error?.message || "Social sign-in failed")
    } finally {
      setIsLoading(false)
      loadingStore.stopLoading()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-card-foreground">
            {showOtp ? "Verify Your Email" :
              mode === "signin" ? "Sign In to Grodify" :
                mode === "forgot" ? (resetStep === "send" ? "Reset Password" : "Set New Password") :
                  "Create Your Account"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {showOtp ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Enter the verification code sent to <b>{userEmail}</b>
              </p>

              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                />
              </div>

              <Button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full"
                disabled={isLoading || !formData.otp}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-primary hover:underline"
                  disabled={isLoading}
                >
                  Resend
                </button>
              </p>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setShowOtp(false)
                  setMode("signup")
                }}
                disabled={isLoading}
              >
                Back to Sign Up
              </Button>
            </div>
          ) : (
            <>
              {mode !== "forgot" && (
                <>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent hover:!bg-primary hover:!text-white"
                      onClick={() => handleSocialSignIn("google")}
                      disabled={isLoading}
                    >
                      <Chrome className="w-4 h-4 mr-2" />
                      Continue with Google
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                </>
              )}

              {mode === "forgot" ? (
                resetStep === "send" ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    {authStore.error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="text-red-400 text-sm">{authStore.error}</div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || !formData.email}>
                      {isLoading ? "Sending..." : "Send Reset Code"}
                    </Button>
                    <button
                      type="button"
                      className="w-full text-xs text-muted-foreground hover:underline"
                      onClick={() => setMode("signin")}
                    >
                      Back to Sign In
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {authStore.error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="text-red-400 text-sm">{authStore.error}</div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Verification Code</Label>
                      <Input
                        type="text"
                        placeholder="Enter code"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                )
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {authStore.error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <div className="text-red-400 text-sm">{authStore.error}</div>
                    </div>
                  )}

                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value })
                          if (authStore.error) authStore.clearError()
                        }}
                        required
                        disabled={isLoading}
                        className={formData.name && formData.name.length < 2 ? "border-red-500/50" : ""}
                      />
                      {formData.name && formData.name.length < 2 && (
                        <div className="text-xs text-red-400">Name must be at least 2 characters long</div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        if (authStore.error) authStore.clearError()
                      }}
                      required
                      disabled={isLoading}
                      className={
                        formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                          ? "border-red-500/50" : ""
                      }
                    />
                    {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                      <div className="text-xs text-red-400">Please enter a valid email address</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value })
                          if (authStore.error) authStore.clearError()
                        }}
                        required
                        disabled={isLoading}
                        className={`pr-10 ${formData.password && formData.password.length > 0 && formData.password.length < 8 ? "border-red-500/50" : ""}`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === "signup" && formData.password && formData.password.length > 0 && (
                      <div className="space-y-1">
                        {formData.password.length < 8 && (
                          <div className="text-xs text-red-400">Password must be at least 8 characters long</div>
                        )}
                        {formData.password.length >= 8 && !/[A-Z]/.test(formData.password) && (
                          <div className="text-xs text-red-400">Must include at least one uppercase letter</div>
                        )}
                        {formData.password.length >= 8 && /[A-Z]/.test(formData.password) && !/[a-z]/.test(formData.password) && (
                          <div className="text-xs text-red-400">Must include at least one lowercase letter</div>
                        )}
                        {formData.password.length >= 8 && /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) && !/[0-9]/.test(formData.password) && (
                          <div className="text-xs text-red-400">Must include at least one number</div>
                        )}
                        {formData.password.length >= 8 && /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) && /[0-9]/.test(formData.password) && !/[^A-Za-z0-9]/.test(formData.password) && (
                          <div className="text-xs text-red-400">Must include at least one special character</div>
                        )}
                      </div>
                    )}
                  </div>

                  {mode === "signin" && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:underline"
                      onClick={() => setMode("forgot")}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? (mode === "signin" ? "Signing In..." : "Creating Account...")
                      : (mode === "signin" ? "Sign In" : "Create Account")}
                  </Button>
                </form>
              )}

              {mode !== "forgot" && (
                <p className="text-sm text-muted-foreground text-center">
                  {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    disabled={isLoading}
                  >
                    {mode === "signin" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
})

export default AuthModal