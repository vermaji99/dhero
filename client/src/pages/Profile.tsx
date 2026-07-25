
import { User, Mail, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Layout } from '../components/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'

export function ProfilePage() {
  const { user } = useAuthStore()

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="text-lg font-medium text-gray-900">{user?.fullName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-700">{user?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-700 capitalize">{user?.role?.toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="text-gray-700">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
