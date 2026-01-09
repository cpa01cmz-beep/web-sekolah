import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/ui/form-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

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

  const getNameError = () => {
    if (!formData.name) return showValidationErrors ? 'Nama lengkap wajib diisi' : undefined;
    if (formData.name.length < 3) return 'Nama lengkap minimal 3 karakter';
    return undefined;
  };

  const getNisnError = () => {
    if (!formData.nisn) return showValidationErrors ? 'NISN wajib diisi' : undefined;
    if (!/^\d+$/.test(formData.nisn)) return 'NISN harus berupa angka';
    if (formData.nisn.length !== 10) return 'NISN harus 10 digit';
    return undefined;
  };

  const getEmailError = () => {
    if (!formData.email) return showValidationErrors ? 'Email wajib diisi' : undefined;
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Format email tidak valid';
    return undefined;
  };

  const getPhoneError = () => {
    if (!formData.phone) return showValidationErrors ? 'Nomor telepon wajib diisi' : undefined;
    if (!/^\d+$/.test(formData.phone)) return 'Nomor telepon harus berupa angka';
    if (formData.phone.length < 10 || formData.phone.length > 13) return 'Nomor telepon harus 10-13 digit';
    return undefined;
  };

  const handleInputChange = (field: keyof PPDBFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    if (getNameError() || getNisnError() || getEmailError() || getPhoneError()) {
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
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Formulir Pendaftaran</h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FormField
          id="name"
          label="Nama Lengkap"
          error={getNameError()}
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
            aria-invalid={!!getNameError()}
            aria-describedby={getNameError() ? 'name-error' : 'name-helper'}
          />
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
          error={getNisnError()}
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
            aria-invalid={!!getNisnError()}
            aria-describedby={getNisnError() ? 'nisn-error' : 'nisn-helper'}
          />
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
          error={getEmailError()}
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
            aria-invalid={!!getEmailError()}
            aria-describedby={getEmailError() ? 'email-error' : 'email-helper'}
          />
        </FormField>

        <FormField
          id="phone"
          label="Nomor Telepon"
          error={getPhoneError()}
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
            aria-invalid={!!getPhoneError()}
            aria-describedby={getPhoneError() ? 'phone-error' : 'phone-helper'}
          />
        </FormField>

        <Button type="submit" className="w-full">Daftar Sekarang</Button>
      </form>
    </div>
  );
}
