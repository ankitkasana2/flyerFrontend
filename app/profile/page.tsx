"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { observer } from "mobx-react-lite"
import { useStore } from "@/stores/StoreProvider"
import { Save, User, Mail, Calendar, Shield, Phone, LockKeyhole, Eye, EyeOff } from "lucide-react"

import { useToast } from "@/hooks/use-toast"

const ProfilePage = observer(() => {
  const { authStore } = useStore()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: authStore.user?.name || "",
    email: authStore.user?.email || "",
    phone: authStore.user?.phone || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("")

  // Synchronize form data when user becomes available or changed
  useEffect(() => {
    if (authStore.user) {
      setFormData({
        name: authStore.user.name || "",
        email: authStore.user.email || "",
        phone: authStore.user.phone || "",
      })
    }
  }, [authStore.user])

  if (!authStore.user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Please sign in to view your profile</h1>
        <Button onClick={() => authStore.handleAuthModal()}>Sign In</Button>
      </div>
    )
  }

  const user = authStore.user;

  const handleSave = async () => {
    try {
      setProfileSaving(true)
      await authStore.updateProfile(formData)
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordSuccessMessage("")

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill all password fields.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Weak password",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      setPasswordSaving(true)
      const result = await authStore.changePassword(passwordData.currentPassword, passwordData.newPassword)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      const successMessage = result?.message || "Your password has been changed successfully."
      setPasswordSuccessMessage(successMessage)
      toast({
        title: "Password updated",
        description: successMessage,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setPasswordSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>


          <Card className="bg-gradient-to-br from-red-950/20 to-black border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                
                
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge >{user.provider}</Badge>
                    <Badge variant="outline" className="text-xs">
                      Member since {new Date(user.createdAt).getFullYear()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* name  */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10  border-border bg-gray-950 border text-white
              placeholder:text-gray-600 rounded-lg h-10 shadow-md
              focus-visible:!ring-0 focus-visible:!outline-none
              focus-visible:!shadow-[0_0_15px_rgba(185,32,37,0.8)]
              transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* email  */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        value={formData.email}
                      
                        disabled={true}
                        className="pl-10  border-border bg-gray-950 border text-white
              placeholder:text-gray-600 rounded-lg h-10 shadow-md
              focus-visible:!ring-0 focus-visible:!outline-none
              focus-visible:!shadow-[0_0_15px_rgba(185,32,37,0.8)]
              transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* phone number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        maxLength={10}
                        disabled={!isEditing}
                        className="pl-10  border-border bg-gray-950 border text-white
              placeholder:text-gray-600 rounded-lg h-10 shadow-md
              focus-visible:!ring-0 focus-visible:!outline-none
              focus-visible:!shadow-[0_0_15px_rgba(185,32,37,0.8)]
              transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        value={new Date(user.createdAt).toLocaleDateString()}
                        disabled
                        className="pl-10 border-border bg-gray-950 border text-white
              placeholder:text-gray-600 rounded-lg h-10 shadow-md
              focus-visible:!ring-0 focus-visible:!outline-none
              focus-visible:!shadow-[0_0_15px_rgba(185,32,37,0.8)]
              transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input value="Standard Customer" disabled className="pl-10 border-border bg-gray-950 border text-white
              placeholder:text-gray-600 rounded-lg h-10 shadow-md
              focus-visible:!ring-0 focus-visible:!outline-none
              focus-visible:!shadow-[0_0_15px_rgba(185,32,37,0.8)]
              transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="bg-transparent hover:!bg-primary hover:!text-white hover cursor-pointer">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={profileSaving} className="hover:cursor-pointer">
                      <Save className="w-4 h-4 mr-2" />
                      {profileSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-950/20 to-black border-border mt-6">
            <CardHeader>
              <CardTitle className="text-card-foreground">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="pl-10 pr-10 border-border bg-gray-950 border text-white placeholder:text-gray-600 rounded-lg h-10 shadow-md focus-visible:!ring-0 focus-visible:!outline-none focus-visible:!shadow-[0_0_15px_rgba(185,32,37,0.8)] transition-all duration-300"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="pl-10 pr-10 border-border bg-gray-950 border text-white placeholder:text-gray-600 rounded-lg h-10 shadow-md focus-visible:!ring-0 focus-visible:!outline-none focus-visible:!shadow-[0_0_15px_rgba(185,32,37,0.8)] transition-all duration-300"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 border-border bg-gray-950 border text-white placeholder:text-gray-600 rounded-lg h-10 shadow-md focus-visible:!ring-0 focus-visible:!outline-none focus-visible:!shadow-[0_0_15px_rgba(185,32,37,0.8)] transition-all duration-300"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleChangePassword} disabled={passwordSaving}>
                  {passwordSaving ? "Updating..." : "Update Password"}
                </Button>
              </div>
              {passwordSuccessMessage ? (
                <p className="text-sm text-green-400">{passwordSuccessMessage}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
})

export default ProfilePage
