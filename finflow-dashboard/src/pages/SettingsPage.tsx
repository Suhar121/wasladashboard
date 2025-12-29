import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Settings, Key, Building2 } from 'lucide-react';

export default function SettingsPage() {
  const { changePassword } = useAuth();
  const { centerName, setCenterName } = useData();
  const { toast } = useToast();
  
  const [newCenterName, setNewCenterName] = useState(centerName);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCenterNameSave = () => {
    if (newCenterName.trim()) {
      setCenterName(newCenterName.trim());
      toast({ title: "Center name updated successfully" });
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 4) {
      toast({
        title: "Password too short",
        description: "Password must be at least 4 characters.",
        variant: "destructive",
      });
      return;
    }

    const success = changePassword(oldPassword, newPassword);
    
    if (success) {
      toast({ title: "Password changed successfully" });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({
        title: "Invalid current password",
        description: "Please enter your correct current password.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your coaching center settings</p>
        </div>

        {/* Center Name */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Center Name
            </CardTitle>
            <CardDescription>
              This name appears in the sidebar and reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={newCenterName}
              onChange={(e) => setNewCenterName(e.target.value)}
              placeholder="Your Coaching Center Name"
            />
            <Button onClick={handleCenterNameSave} disabled={!newCenterName.trim()}>
              Save Name
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your access password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button type="submit" disabled={!oldPassword || !newPassword || !confirmPassword}>
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              About This App
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Coaching Center Finance Dashboard</strong> helps you manage student fees, 
              track expenses, and monitor your coaching center's financial health.
            </p>
            <p>
              All data is stored locally in your browser. To preserve data across devices, 
              consider upgrading to cloud storage.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
