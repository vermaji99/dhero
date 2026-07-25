
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CheckCircle2, Send } from 'lucide-react'
import { leadsApi } from '../services/api'
import { LeadSource } from '../types'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { Label } from '../components/ui/Label'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'

const contactSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.nativeEnum(LeadSource).optional().default(LeadSource.WEBSITE),
  message: z.string().max(1000, 'Message is too long').optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      source: LeadSource.WEBSITE,
    },
  })

  const createLeadMutation = useMutation({
    mutationFn: leadsApi.createPublic,
    onSuccess: () => {
      reset()
    },
  })

  const onSubmit = handleSubmit((data) => {
    createLeadMutation.mutate(data)
  })

  if (createLeadMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
            <p className="text-gray-500 mb-6">
              We've received your message and will get back to you soon.
            </p>
            <Link to="/login">
              <Button variant="primary">Go to login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Contact Us</CardTitle>
          <p className="text-gray-500 mt-2">Fill out the form below and we'll get back to you.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} />
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register('company')} />
              </div>
            </div>

            <div>
              <Label htmlFor="source">How did you hear about us?</Label>
              <Select id="source" {...register('source')}>
                {Object.values(LeadSource).map((source) => (
                  <option key={source} value={source}>
                    {source.charAt(0) + source.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={5}
                {...register('message')}
                className={errors.message ? 'border-red-500' : ''}
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
              )}
            </div>

            {createLeadMutation.isError && (
              <p className="text-red-500 text-sm">
                {createLeadMutation.error.message}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={createLeadMutation.isPending}
            >
              {createLeadMutation.isPending ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Message
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Already have an account? Sign in →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
