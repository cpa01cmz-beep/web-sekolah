import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
export function AdminSettingsPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">School Settings</h1>
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Update your school's basic information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="school-name">School Name</Label>
                <Input id="school-name" defaultValue="Akademia Pro High School" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academic-year">Current Academic Year</Label>
                <Select defaultValue="2023-2024">
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-2024">2023-2024</SelectItem>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize the look and feel of the portal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">School Logo</Label>
                <Input id="logo" type="file" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <Input id="primary-color" type="color" defaultValue="#0D47A1" className="w-24" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage automated notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="grade-notif" className="flex flex-col space-y-1">
                  <span>Grade Updates</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Send email notifications to parents when new grades are posted.
                  </span>
                </Label>
                <Switch id="grade-notif" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="announcement-notif" className="flex flex-col space-y-1">
                  <span>New Announcements</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Notify all users when a school-wide announcement is made.
                  </span>
                </Label>
                <Switch id="announcement-notif" defaultChecked />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit">Save All Settings</Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}