import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { FormSuccess } from '@/components/ui/form-success';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { validateName, validateEmail, validatePhone, validateNisn, validateRequired } from '@/utils/validation';
import { useFormValidation } from '@/hooks/useFormValidation';

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { errors, validateAll, reset: resetValidation } = useFormValidation(formData, {
    validators: {
      name: (value, show) => validateName(value, show, 3),
      placeOfBirth: (value, show) => validateRequired(value, show, 'Tempat lahir'),
      dateOfBirth: (value, show) => validateRequired(value, show, 'Tanggal lahir'),
      nisn: (value, show) => validateNisn(value, show, 10),
      school: (value, show) => validateRequired(value, show, 'Asal sekolah'),
      level: (value, show) => validateRequired(value, show, 'Jenjang pendidikan'),
      email: validateEmail,
      phone: (value, show) => validatePhone(value, show, 10, 13),
    },
  });

  const handleInputChange = useCallback((field: keyof PPDBFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: String(value) }));
  }, []);

  const handleReset = () => {
    setIsSuccess(false);
    resetValidation();
  };

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('Mohon lengkapi formulir dengan benar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
      setIsSuccess(true);
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
      resetValidation();
    } catch (error) {
      toast.error('Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateAll, onSubmit, formData, resetValidation]);

  if (isSuccess) {
    return (
      <FormSuccess
        title="Pendaftaran Berhasil!"
        description="Terima kasih telah mendaftar. Silakan cek email Anda untuk instruksi selanjutnya."
        action={{
          label: "Daftar Siswa Lain",
          onClick: handleReset,
        }}
      />
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Formulir Pendaftaran</h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FormField
          id="name"
          label="Nama Lengkap"
          error={errors.name}
          helperText="Masukkan nama lengkap sesuai akta kelahiran"
          required
        >
          <Input
            placeholder="Masukkan nama lengkap"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={isSubmitting}
            required
            aria-busy={isSubmitting}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="placeOfBirth"
            label="Tempat Lahir"
            error={errors.placeOfBirth}
            helperText="Kota tempat lahir"
            required
          >
            <Input
              placeholder="Tempat lahir"
              value={formData.placeOfBirth}
              onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
              disabled={isSubmitting}
              required
              aria-busy={isSubmitting}
            />
          </FormField>
          <FormField
            id="dateOfBirth"
            label="Tanggal Lahir"
            error={errors.dateOfBirth}
            helperText="Tanggal lahir sesuai akta"
            required
          >
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              disabled={isSubmitting}
              required
              aria-busy={isSubmitting}
            />
          </FormField>
        </div>

        <FormField
          id="nisn"
          label="NISN"
          error={errors.nisn}
          helperText="Nomor Induk Siswa Nasional (10 digit)"
          required
        >
          <Input
            placeholder="Nomor Induk Siswa Nasional"
            value={formData.nisn}
            onChange={(e) => handleInputChange('nisn', e.target.value)}
            disabled={isSubmitting}
            required
            aria-busy={isSubmitting}
          />
        </FormField>

        <FormField
          id="school"
          label="Asal Sekolah"
          error={errors.school}
          helperText="Nama sekolah sebelumnya"
          required
        >
          <Input
            placeholder="Nama sekolah sebelumnya"
            value={formData.school}
            onChange={(e) => handleInputChange('school', e.target.value)}
            disabled={isSubmitting}
            required
            aria-busy={isSubmitting}
          />
        </FormField>

        <FormField
          id="level"
          label="Jenjang yang Dituju"
          error={errors.level}
          helperText="Pilih jenjang pendidikan yang dituju"
          required
        >
          <Select onValueChange={(value) => handleInputChange('level', value)} disabled={isSubmitting}>
            <SelectTrigger id="level" aria-labelledby="level-label" aria-busy={isSubmitting}>
              <SelectValue placeholder="Pilih jenjang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="smp">SMP (Kelas 7)</SelectItem>
              <SelectItem value="sma">SMA (Kelas 10)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="email"
          label="Email Orang Tua"
          error={errors.email}
          helperText="Email aktif untuk menerima konfirmasi"
          required
        >
          <Input
            type="email"
            placeholder="email@contoh.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={isSubmitting}
            required
            aria-busy={isSubmitting}
          />
        </FormField>

        <FormField
          id="phone"
          label="Nomor Telepon"
          error={errors.phone}
          helperText="Nomor WhatsApp yang bisa dihubungi"
          required
        >
          <Input
            type="tel"
            placeholder="081234567890"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={isSubmitting}
            required
            aria-busy={isSubmitting}
          />
        </FormField>

        <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Mengirim...' : 'Daftar Sekarang'}
        </Button>
      </form>
    </div>
  );
}
