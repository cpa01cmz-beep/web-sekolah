import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { FormFieldInput } from '@/components/ui/form-field-input'
import { FormSuccess } from '@/components/ui/form-success'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import {
  validateName,
  validateEmail,
  validatePhone,
  validateNisn,
  validateRequired,
} from '@/utils/validation'
import { useFormValidation } from '@/hooks/useFormValidation'

interface PPDBFormData {
  name: string
  placeOfBirth: string
  dateOfBirth: string
  nisn: string
  school: string
  level: string
  email: string
  phone: string
}

interface PPDBFormProps {
  onSubmit?: (data: PPDBFormData) => void
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
  })
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const {
    errors,
    validateAll,
    reset: resetValidation,
  } = useFormValidation(formData, {
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
  })

  const handleInputChange = useCallback((field: keyof PPDBFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: String(value) }))
  }, [])

  const handleReset = useCallback(() => {
    setIsSuccess(false)
    resetValidation()
  }, [resetValidation])

  const successAction = useMemo(
    () => ({
      label: 'Daftar Siswa Lain',
      onClick: handleReset,
    }),
    [handleReset]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!validateAll()) {
        toast.error('Mohon lengkapi formulir dengan benar.')
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit?.(formData)
        setIsSuccess(true)
        toast.success(
          'Pendaftaran berhasil dikirim! Silakan cek email untuk instruksi selanjutnya.'
        )
        setFormData({
          name: '',
          placeOfBirth: '',
          dateOfBirth: '',
          nisn: '',
          school: '',
          level: '',
          email: '',
          phone: '',
        })
        resetValidation()
      } catch (error) {
        toast.error('Pendaftaran gagal. Silakan coba lagi.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateAll, onSubmit, formData, resetValidation]
  )

  if (isSuccess) {
    return (
      <FormSuccess
        title="Pendaftaran Berhasil!"
        description="Terima kasih telah mendaftar. Silakan cek email Anda untuk instruksi selanjutnya."
        action={successAction}
      />
    )
  }

  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Formulir Pendaftaran</h2>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FormFieldInput
          id="name"
          label="Nama Lengkap"
          error={errors.name}
          helperText="Masukkan nama lengkap sesuai akta kelahiran"
          placeholder="Masukkan nama lengkap"
          value={formData.name}
          onChange={value => handleInputChange('name', value)}
          disabled={isSubmitting}
          required
          autoComplete="name"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormFieldInput
            id="placeOfBirth"
            label="Tempat Lahir"
            error={errors.placeOfBirth}
            helperText="Kota tempat lahir"
            placeholder="Tempat lahir"
            value={formData.placeOfBirth}
            onChange={value => handleInputChange('placeOfBirth', value)}
            disabled={isSubmitting}
            required
            autoComplete="address-level2"
          />
          <FormFieldInput
            id="dateOfBirth"
            label="Tanggal Lahir"
            type="date"
            error={errors.dateOfBirth}
            helperText="Tanggal lahir sesuai akta"
            placeholder="Tanggal lahir"
            value={formData.dateOfBirth}
            onChange={value => handleInputChange('dateOfBirth', value)}
            disabled={isSubmitting}
            required
            autoComplete="bday"
          />
          <FormFieldInput
            id="dateOfBirth"
            label="Tanggal Lahir"
            type="date"
            error={errors.dateOfBirth}
            helperText="Tanggal lahir sesuai akta"
            placeholder="Tanggal lahir"
            value={formData.dateOfBirth}
            onChange={value => handleInputChange('dateOfBirth', value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <FormFieldInput
          id="nisn"
          label="NISN"
          error={errors.nisn}
          helperText="Nomor Induk Siswa Nasional (10 digit)"
          placeholder="Nomor Induk Siswa Nasional"
          value={formData.nisn}
          onChange={value => handleInputChange('nisn', value)}
          disabled={isSubmitting}
          required
        />

        <FormFieldInput
          id="school"
          label="Asal Sekolah"
          error={errors.school}
          helperText="Nama sekolah sebelumnya"
          placeholder="Nama sekolah sebelumnya"
          value={formData.school}
          onChange={value => handleInputChange('school', value)}
          disabled={isSubmitting}
          required
          autoComplete="school-name"
        />

        <FormField
          id="level"
          label="Jenjang yang Dituju"
          error={errors.level}
          helperText="Pilih jenjang pendidikan yang dituju"
          required
        >
          <Select
            onValueChange={value => handleInputChange('level', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="level" aria-labelledby="level-label" aria-busy={isSubmitting}>
              <SelectValue placeholder="Pilih jenjang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="smp">SMP (Kelas 7)</SelectItem>
              <SelectItem value="sma">SMA (Kelas 10)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormFieldInput
          id="email"
          label="Email Orang Tua"
          type="email"
          error={errors.email}
          helperText="Email aktif untuk menerima konfirmasi"
          placeholder="email@contoh.com"
          value={formData.email}
          onChange={value => handleInputChange('email', value)}
          disabled={isSubmitting}
          required
          autoComplete="email"
        />

        <FormFieldInput
          id="phone"
          label="Nomor Telepon"
          type="tel"
          error={errors.phone}
          helperText="Nomor WhatsApp yang bisa dihubungi"
          placeholder="081234567890"
          value={formData.phone}
          onChange={value => handleInputChange('phone', value)}
          disabled={isSubmitting}
          required
          autoComplete="tel"
        />

        <FormFieldInput
          id="phone"
          label="Nomor Telepon"
          type="tel"
          error={errors.phone}
          helperText="Nomor WhatsApp yang bisa dihubungi"
          placeholder="081234567890"
          value={formData.phone}
          onChange={value => handleInputChange('phone', value)}
          disabled={isSubmitting}
          required
        />

        <Button type="submit" className="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Mengirim...' : 'Daftar Sekarang'}
        </Button>
      </form>
    </div>
  )
}
