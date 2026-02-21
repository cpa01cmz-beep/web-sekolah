import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/PageHeader';
import { SlideUp } from '@/components/animations';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings, useUpdateSettings } from '@/hooks/useAdmin';
import type { Settings } from '@shared/types';
import { toast } from 'sonner';
import { THEME_COLORS } from '@/theme/colors';
import { useState, useMemo } from 'react';

const defaultSettings: Settings = {
  schoolName: '',
  academicYear: '2026-2027',
  semester: 1,
  allowRegistration: true,
  maintenanceMode: false,
};

export function AdminSettingsPage() {
  const { data: settings, isLoading, error } = useSettings();
  const updateSettings = useUpdateSettings({
    onSuccess: () => toast.success('Settings saved successfully!'),
    onError: (err) => toast.error(`Failed to save settings: ${err.message}`),
  });

  const mergedSettings = useMemo(() => ({ ...defaultSettings, ...settings }), [settings]);

  const [localEdits, setLocalEdits] = useState<Partial<Settings>>({});

  const formData = { ...mergedSettings, ...localEdits };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(formData);
  };

  const updateField = <K extends keyof Settings>(field: K, value: Settings[K]) => {
    setLocalEdits((prev) => ({ ...prev, [field]: value }));
  };

  if (error) {
    return (
      <SlideUp className="space-y-6">
        <PageHeader title="School Settings" />
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load settings. Please try again.</p>
          </CardContent>
        </Card>
      </SlideUp>
    );
  }

  return (
    <SlideUp className="space-y-6">
      <PageHeader title="School Settings" />
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
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="school-name"
                    value={formData.schoolName}
                    onChange={(e) => updateField('schoolName', e.target.value)}
                    placeholder="Enter school name"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="academic-year">Current Academic Year</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={formData.academicYear}
                    onValueChange={(value) => updateField('academicYear', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Current Semester</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={formData.semester.toString()}
                    onValueChange={(value) => updateField('semester', parseInt(value, 10))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                )}
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
                <Input
                  id="primary-color"
                  type="color"
                  defaultValue={THEME_COLORS.PRIMARY}
                  className="w-24"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Manage system-wide settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-registration" className="flex flex-col space-y-1">
                  <span>Allow Registration</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Allow new users to register accounts.
                  </span>
                </Label>
                {isLoading ? (
                  <Skeleton className="h-6 w-11" />
                ) : (
                  <Switch
                    id="allow-registration"
                    checked={formData.allowRegistration}
                    onCheckedChange={(checked) => updateField('allowRegistration', checked)}
                  />
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                  <span>Maintenance Mode</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Put the system in maintenance mode. Only admins can access.
                  </span>
                </Label>
                {isLoading ? (
                  <Skeleton className="h-6 w-11" />
                ) : (
                  <Switch
                    id="maintenance-mode"
                    checked={formData.maintenanceMode}
                    onCheckedChange={(checked) => updateField('maintenanceMode', checked)}
                  />
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} isLoading={updateSettings.isPending}>
              {updateSettings.isPending ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </div>
      </form>
    </SlideUp>
  );
}
