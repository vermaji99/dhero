
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)

  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.user, data.accessToken)
      navigate(from, { replace: true })
    },
    onError: (error: Error) => {
      setError('root', { message: error.message })
    },
  })

  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(data)
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">LeadFlow</CardTitle>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {errors.root && (
              <p className="text-red-500 text-sm">{errors.root.message}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              Sign in
            </Button>

            <div className="text-center text-sm text-gray-500">
              <p>Demo credentials:</p>
              <p className="mt-1">Admin: admin.demo@example.com / demo-admin-123</p>
              <p>Member: member.demo@example.com / demo-member-123</p>
            </div>

            <div className="text-center">
              <Link
                to="/contact"
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Or use the public contact form →
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
