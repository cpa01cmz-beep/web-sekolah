import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { validateName, validateEmail, validatePhone, validateNisn } from '@/utils/validation';

interface PPDBFormData {
  name: string;
  placeOfBirth: string;
  dateOfBirth: string;
  nisn: string;
  school: string;
  level: string;
  email: string;
  phone: string;
}

interface PPDBFormProps {
  onSubmit?: (data: PPDBFormData) => void;
}

export function PPDBForm({ onSubmit }: PPDBFormProps) {
  const [formData, setFormData] = useState<PPDBFormData>({
    name: '',
    placeOfBirth: '',
    dateOfBirth: '',
    nisn: '',
    school: '',
    level: '',
    email: '',
    phone: '',
  });
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const nameError = useMemo(() => validateName(formData.name, showValidationErrors, 3), [formData.name, showValidationErrors]);
  const nisnError = useMemo(() => validateNisn(formData.nisn, showValidationErrors, 10), [formData.nisn, showValidationErrors]);
  const emailError = useMemo(() => validateEmail(formData.email, showValidationErrors), [formData.email, showValidationErrors]);
  const phoneError = useMemo(() => validatePhone(formData.phone, showValidationErrors, 10, 13), [formData.phone, showValidationErrors]);

  const handleInputChange = useCallback((field: keyof PPDBFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    if (nameError || nisnError || emailError || phoneError) {
      toast.error('Mohon lengkapi formulir dengan benar.');
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    } else {
      toast.success('Pendaftaran berhasil dikirim! Silakan cek email untuk instruksi selanjutnya.');
      setFormData({
        name: '',
        placeOfBirth: '',
        dateOfBirth: '',
        nisn: '',
        school: '',
        level: '',
        email: '',
        phone: '',
      });
      setShowValidationErrors(false);
    }
  }, [nameError, nisnError, emailError, phoneError, onSubmit, formData]);

  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Formulir Pendaftaran</h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FormField
          id="name"
          label="Nama Lengkap"
          error={nameError}
          helperText="Masukkan nama lengkap sesuai akta kelahiran"
          required
        >
          <Input
            id="name"
            placeholder="Masukkan nama lengkap"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? 'name-error' : 'name-helper'}
          />
          {nameError && (
            <p id="name-error" className="text-xs text-destructive flex items-center gap-1" role="alert" aria-live="polite">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {nameError}
            </p>
          )}
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="placeOfBirth"
            label="Tempat Lahir"
            helperText="Kota tempat lahir"
            required
          >
            <Input
              id="placeOfBirth"
              placeholder="Tempat lahir"
              value={formData.placeOfBirth}
              onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
              required
              aria-required="true"
            />
          </FormField>
          <FormField
            id="dateOfBirth"
            label="Tanggal Lahir"
            helperText="Tanggal lahir sesuai akta"
            required
          >
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              required
              aria-required="true"
            />
          </FormField>
        </div>

        <FormField
          id="nisn"
          label="NISN"
          error={nisnError}
          helperText="Nomor Induk Siswa Nasional (10 digit)"
          required
        >
          <Input
            id="nisn"
            placeholder="Nomor Induk Siswa Nasional"
            value={formData.nisn}
            onChange={(e) => handleInputChange('nisn', e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!nisnError}
            aria-describedby={nisnError ? 'nisn-error' : 'nisn-helper'}
          />
          {nisnError && (
            <p id="nisn-error" className="text-xs text-destructive flex items-center gap-1" role="alert" aria-live="polite">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {nisnError}
            </p>
          )}
        </FormField>

        <FormField
          id="school"
          label="Asal Sekolah"
          helperText="Nama sekolah sebelumnya"
          required
        >
          <Input
            id="school"
            placeholder="Nama sekolah sebelumnya"
            value={formData.school}
            onChange={(e) => handleInputChange('school', e.target.value)}
            required
            aria-required="true"
          />
        </FormField>

        <div className="space-y-2">
          <Label htmlFor="level">Jenjang yang Dituju</Label>
          <Select onValueChange={(value) => handleInputChange('level', value)}>
            <SelectTrigger aria-label="Pilih jenjang pendidikan">
              <SelectValue placeholder="Pilih jenjang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="smp">SMP (Kelas 7)</SelectItem>
              <SelectItem value="sma">SMA (Kelas 10)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <FormField
          id="email"
          label="Email Orang Tua"
          error={emailError}
          helperText="Email aktif untuk menerima konfirmasi"
          required
        >
          <Input
            id="email"
            type="email"
            placeholder="email@contoh.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'email-error' : 'email-helper'}
          />
          {emailError && (
            <p id="email-error" className="text-xs text-destructive flex items-center gap-1" role="alert" aria-live="polite">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {emailError}
            </p>
          )}
        </FormField>

        <FormField
          id="phone"
          label="Nomor Telepon"
          error={phoneError}
          helperText="Nomor WhatsApp yang bisa dihubungi"
          required
        >
          <Input
            id="phone"
            type="tel"
            placeholder="081234567890"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
            aria-required="true"
            aria-invalid={!!phoneError}
            aria-describedby={phoneError ? 'phone-error' : 'phone-helper'}
          />
          {phoneError && (
            <p id="phone-error" className="text-xs text-destructive flex items-center gap-1" role="alert" aria-live="polite">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {phoneError}
            </p>
          )}
        </FormField>

        <Button type="submit" className="w-full">Daftar Sekarang</Button>
      </form>
    </div>
  );
}
