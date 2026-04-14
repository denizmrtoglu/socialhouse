import { SignIn } from '@clerk/nextjs'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)]">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            socialhouse
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Admin Panel</p>
        </div>

        <SignIn routing="hash" />
      </div>
    </div>
  )
}
