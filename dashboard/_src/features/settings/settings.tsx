import React, { useState } from 'react'
import { Bell, Shield, Store, User } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth.provider'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

export const Route = createFileRoute('/_authenticated/settings')({
  component: Settings,
})

function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your changes have been saved.',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account settings" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            Store
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="card-elevated p-6 space-y-6 max-w-2xl">
            <h3 className="font-serif text-lg font-semibold">
              Profile Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue={user?.name} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user?.email} type="email" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue="+91 98765 43210" />
              </div>
            </div>
            <Button onClick={handleSave} className="btn-primary-gradient">
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <div className="card-elevated p-6 space-y-6 max-w-2xl">
            <h3 className="font-serif text-lg font-semibold">
              Change Password
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" />
              </div>
            </div>
            <Button onClick={handleSave} className="btn-primary-gradient">
              Update Password
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="store" className="mt-6">
          <div className="card-elevated p-6 space-y-6 max-w-2xl">
            <h3 className="font-serif text-lg font-semibold">
              Store Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label>Store Name</Label>
                <Input defaultValue="Rooftop Nursery" />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input defaultValue="contact@rooftopnursery.com" />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input defaultValue="+91 1234 567890" />
              </div>
            </div>
            <Button onClick={handleSave} className="btn-primary-gradient">
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="card-elevated p-6 space-y-6 max-w-2xl">
            <h3 className="font-serif text-lg font-semibold">
              Email Notifications
            </h3>
            <div className="space-y-4">
              {[
                'New orders',
                'Order updates',
                'Low stock alerts',
                'Vendor applications',
              ].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span>{item}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
            <Button onClick={handleSave} className="btn-primary-gradient">
              Save Preferences
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
