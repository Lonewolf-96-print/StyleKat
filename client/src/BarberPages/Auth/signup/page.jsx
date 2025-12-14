import { SignupForm } from "../../../components-barber/signup-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components-barber/ui/card"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Create Account</CardTitle>
            <CardDescription>Start managing your salon business today</CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
