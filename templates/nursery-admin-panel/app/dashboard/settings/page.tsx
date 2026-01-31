'use client'

import React from "react"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91 9876543210',
  })
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      // In production, call API to update profile
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setIsSaving(true)
    try {
      // In production, call API to change password
      toast.success('Password changed successfully!')
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="store">Store Settings</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Profile Information
            </h2>
            <form onSubmit={handleProfileSave} className="space-y-6">
              {/* Avatar */}
              <div>
                <Label>Avatar</Label>
                <div className="mt-3 flex items-center gap-4">
                  <img
                    src={user?.avatar || "/placeholder.svg"}
                    alt={user?.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <Button type="button" variant="outline" className="gap-2 bg-transparent">
                    <Upload className="w-4 h-4" />
                    Change Avatar
                  </Button>
                </div>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              {/* Current Password */}
              <div>
                <Label htmlFor="current">Current Password</Label>
                <Input
                  id="current"
                  type="password"
                  value={passwordData.current}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, current: e.target.value })
                  }
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="new">New Password</Label>
                <Input
                  id="new"
                  type="password"
                  value={passwordData.new}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new: e.target.value })
                  }
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirm: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Two-Factor Authentication
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Add an extra layer of security to your account
            </p>
            <Button variant="outline">Enable 2FA</Button>
          </Card>
        </TabsContent>

        {/* Store Settings Tab */}
        <TabsContent value="store" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Store Information
            </h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  defaultValue="Rooftop Nursery"
                />
              </div>

              <div>
                <Label htmlFor="storeEmail">Store Email</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  defaultValue="admin@rooftop.com"
                />
              </div>

              <div>
                <Label htmlFor="storePhone">Store Phone</Label>
                <Input
                  id="storePhone"
                  defaultValue="+91 9876543210"
                />
              </div>

              <Button>Save Store Settings</Button>
            </div>
          </Card>

          {/* Shipping Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Shipping Settings
            </h2>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Configure shipping methods and rates
              </p>
              <Button variant="outline">Manage Shipping</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
