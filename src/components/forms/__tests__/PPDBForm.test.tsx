import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PPDBForm } from '@/components/forms/PPDBForm'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('PPDBForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render form title', () => {
      render(<PPDBForm />)
      expect(screen.getByText(/Formulir Pendaftaran/i)).toBeInTheDocument()
    })

    it('should render all required form fields', () => {
      render(<PPDBForm />)
      expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Tempat Lahir/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Tanggal Lahir/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/NISN/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Asal Sekolah/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Jenjang yang Dituju/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Nomor Telepon/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<PPDBForm />)
      expect(screen.getByRole('button', { name: /Daftar Sekarang/i })).toBeInTheDocument()
    })

    it('should render helper text for each field', () => {
      render(<PPDBForm />)
      expect(screen.getByText(/Masukkan nama lengkap sesuai akta kelahiran/i)).toBeInTheDocument()
      expect(screen.getByText(/Nomor Induk Siswa Nasional/i)).toBeInTheDocument()
    })
  })

  describe('Input Interaction', () => {
    it('should allow typing in name field', async () => {
      const user = userEvent.setup()
      render(<PPDBForm />)

      const nameInput = screen.getByLabelText(/Nama Lengkap/i)
      await user.type(nameInput, 'John Doe')

      expect(nameInput).toHaveValue('John Doe')
    })

    it('should allow typing in place of birth field', async () => {
      const user = userEvent.setup()
      render(<PPDBForm />)

      const placeInput = screen.getByLabelText(/Tempat Lahir/i)
      await user.type(placeInput, 'Jakarta')

      expect(placeInput).toHaveValue('Jakarta')
    })

    it('should allow selecting date of birth', async () => {
      const user = userEvent.setup()
      render(<PPDBForm />)

      const dateInput = screen.getByLabelText(/Tanggal Lahir/i)
      await user.type(dateInput, '2010-01-15')

      expect(dateInput).toHaveValue('2010-01-15')
    })

    it('should allow typing in NISN field', async () => {
      const user = userEvent.setup()
      render(<PPDBForm />)

      const nisnInput = screen.getByLabelText(/NISN/i)
      await user.type(nisnInput, '1234567890')

      expect(nisnInput).toHaveValue('1234567890')
    })

    it('should allow typing in school field', async () => {
      const user = userEvent.setup()
      render(<PPDBForm />)

      const schoolInput = screen.getByLabelText(/Asal Sekolah/i)
      await user.type(schoolInput, 'SD Negeri 1')

      expect(schoolInput).toHaveValue('SD Negeri 1')
    })

    it('should allow typing in phone field', async () => {
      const user = userEvent.setup()
      render(<PPDBForm />)

      const phoneInput = screen.getByLabelText(/Nomor Telepon/i)
      await user.type(phoneInput, '081234567890')

      expect(phoneInput).toHaveValue('081234567890')
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit with form data when form is valid', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<PPDBForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/Nama Lengkap/i), 'John Doe')
      await user.type(screen.getByLabelText(/Tempat Lahir/i), 'Jakarta')
      await user.type(screen.getByLabelText(/Tanggal Lahir/i), '2010-01-15')
      await user.type(screen.getByLabelText(/NISN/i), '1234567890')
      await user.type(screen.getByLabelText(/Asal Sekolah/i), 'SD Negeri 1')
      await user.type(screen.getByLabelText(/Nomor Telepon/i), '081234567890')

      await user.click(screen.getByRole('button', { name: /Daftar Sekarang/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
    })

    it('should show success state after successful submission', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<PPDBForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/Nama Lengkap/i), 'John Doe')
      await user.type(screen.getByLabelText(/Tempat Lahir/i), 'Jakarta')
      await user.type(screen.getByLabelText(/Tanggal Lahir/i), '2010-01-15')
      await user.type(screen.getByLabelText(/NISN/i), '1234567890')
      await user.type(screen.getByLabelText(/Asal Sekolah/i), 'SD Negeri 1')
      await user.type(screen.getByLabelText(/Nomor Telepon/i), '081234567890')

      await user.click(screen.getByRole('button', { name: /Daftar Sekarang/i }))

      await waitFor(() => {
        expect(screen.getByText(/Pendaftaran Berhasil!/i)).toBeInTheDocument()
      })
    })

    it('should show error toast when submission fails', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
      const { toast } = await import('sonner')
      render(<PPDBForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/Nama Lengkap/i), 'John Doe')
      await user.type(screen.getByLabelText(/Tempat Lahir/i), 'Jakarta')
      await user.type(screen.getByLabelText(/Tanggal Lahir/i), '2010-01-15')
      await user.type(screen.getByLabelText(/NISN/i), '1234567890')
      await user.type(screen.getByLabelText(/Asal Sekolah/i), 'SD Negeri 1')
      await user.type(screen.getByLabelText(/Nomor Telepon/i), '081234567890')

      await user.click(screen.getByRole('button', { name: /Daftar Sekarang/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Pendaftaran gagal. Silakan coba lagi.')
      })
    })
  })

  describe('Loading State', () => {
    it('should disable submit button when submitting', async () => {
      const user = userEvent.setup()
      const onSubmit = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<PPDBForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/Nama Lengkap/i), 'John Doe')
      await user.type(screen.getByLabelText(/Tempat Lahir/i), 'Jakarta')
      await user.type(screen.getByLabelText(/Tanggal Lahir/i), '2010-01-15')
      await user.type(screen.getByLabelText(/NISN/i), '1234567890')
      await user.type(screen.getByLabelText(/Asal Sekolah/i), 'SD Negeri 1')
      await user.type(screen.getByLabelText(/Nomor Telepon/i), '081234567890')

      await user.click(screen.getByRole('button', { name: /Daftar Sekarang/i }))

      expect(screen.getByRole('button', { name: /Mengirim\.\.\./i })).toBeDisabled()
    })

    it('should set aria-busy on submit button when submitting', async () => {
      const user = userEvent.setup()
      const onSubmit = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<PPDBForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/Nama Lengkap/i), 'John Doe')
      await user.type(screen.getByLabelText(/Tempat Lahir/i), 'Jakarta')
      await user.type(screen.getByLabelText(/Tanggal Lahir/i), '2010-01-15')
      await user.type(screen.getByLabelText(/NISN/i), '1234567890')
      await user.type(screen.getByLabelText(/Asal Sekolah/i), 'SD Negeri 1')
      await user.type(screen.getByLabelText(/Nomor Telepon/i), '081234567890')

      await user.click(screen.getByRole('button', { name: /Daftar Sekarang/i }))

      const button = screen.getByRole('button', { name: /Mengirim\.\.\./i })
      expect(button).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('Success State', () => {
    it('should show success message after successful submission', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<PPDBForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/Nama Lengkap/i), 'John Doe')
      await user.type(screen.getByLabelText(/Tempat Lahir/i), 'Jakarta')
      await user.type(screen.getByLabelText(/Tanggal Lahir/i), '2010-01-15')
      await user.type(screen.getByLabelText(/NISN/i), '1234567890')
      await user.type(screen.getByLabelText(/Asal Sekolah/i), 'SD Negeri 1')
      await user.type(screen.getByLabelText(/Nomor Telepon/i), '081234567890')

      await user.click(screen.getByRole('button', { name: /Daftar Sekarang/i }))

      await waitFor(() => {
        expect(screen.getByText(/Terima kasih telah mendaftar/i)).toBeInTheDocument()
      })
    })

    it('should show reset button in success state', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<PPDBForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/Nama Lengkap/i), 'John Doe')
      await user.type(screen.getByLabelText(/Tempat Lahir/i), 'Jakarta')
      await user.type(screen.getByLabelText(/Tanggal Lahir/i), '2010-01-15')
      await user.type(screen.getByLabelText(/NISN/i), '1234567890')
      await user.type(screen.getByLabelText(/Asal Sekolah/i), 'SD Negeri 1')
      await user.type(screen.getByLabelText(/Nomor Telepon/i), '081234567890')

      await user.click(screen.getByRole('button', { name: /Daftar Sekarang/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Daftar Siswa Lain/i })).toBeInTheDocument()
      })
    })

    it('should reset form when reset button is clicked', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<PPDBForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/Nama Lengkap/i), 'John Doe')
      await user.type(screen.getByLabelText(/Tempat Lahir/i), 'Jakarta')
      await user.type(screen.getByLabelText(/Tanggal Lahir/i), '2010-01-15')
      await user.type(screen.getByLabelText(/NISN/i), '1234567890')
      await user.type(screen.getByLabelText(/Asal Sekolah/i), 'SD Negeri 1')
      await user.type(screen.getByLabelText(/Nomor Telepon/i), '081234567890')

      await user.click(screen.getByRole('button', { name: /Daftar Sekarang/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Daftar Siswa Lain/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Daftar Siswa Lain/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/Nama Lengkap/i)).toHaveValue('')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<PPDBForm />)
      expect(screen.getByLabelText(/Nama Lengkap/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Tempat Lahir/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Tanggal Lahir/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/NISN/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Asal Sekolah/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Jenjang yang Dituju/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Nomor Telepon/i)).toBeInTheDocument()
    })

    it('should have required attribute on required fields', () => {
      render(<PPDBForm />)
      expect(screen.getByLabelText(/Nama Lengkap/i)).toBeRequired()
      expect(screen.getByLabelText(/Tempat Lahir/i)).toBeRequired()
      expect(screen.getByLabelText(/Tanggal Lahir/i)).toBeRequired()
      expect(screen.getByLabelText(/NISN/i)).toBeRequired()
      expect(screen.getByLabelText(/Asal Sekolah/i)).toBeRequired()
      expect(screen.getByLabelText(/Nomor Telepon/i)).toBeRequired()
    })

    it('should have autoComplete attributes on fields', () => {
      render(<PPDBForm />)
      expect(screen.getByLabelText(/Nama Lengkap/i)).toHaveAttribute('autocomplete', 'name')
      expect(screen.getByLabelText(/Tanggal Lahir/i)).toHaveAttribute('autocomplete', 'bday')
      expect(screen.getByLabelText(/Nomor Telepon/i)).toHaveAttribute('autocomplete', 'tel')
    })

    it('should have aria-busy on submit button during submission', async () => {
      const user = userEvent.setup()
      const onSubmit = vi
        .fn()
        .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<PPDBForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/Nama Lengkap/i), 'John Doe')
      await user.type(screen.getByLabelText(/Tempat Lahir/i), 'Jakarta')
      await user.type(screen.getByLabelText(/Tanggal Lahir/i), '2010-01-15')
      await user.type(screen.getByLabelText(/NISN/i), '1234567890')
      await user.type(screen.getByLabelText(/Asal Sekolah/i), 'SD Negeri 1')
      await user.type(screen.getByLabelText(/Nomor Telepon/i), '081234567890')

      await user.click(screen.getByRole('button', { name: /Daftar Sekarang/i }))

      const button = screen.getByRole('button', { name: /Mengirim\.\.\./i })
      expect(button).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in name', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<PPDBForm onSubmit={onSubmit} />)

      const nameInput = screen.getByLabelText(/Nama Lengkap/i)
      await user.type(nameInput, "O'Conner Jr.")

      expect(nameInput).toHaveValue("O'Conner Jr.")
    })

    it('should handle long text in school field', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<PPDBForm onSubmit={onSubmit} />)

      const schoolInput = screen.getByLabelText(/Asal Sekolah/i)
      await user.type(schoolInput, 'SD Negeri Persiapan Gainesville')

      expect(schoolInput).toHaveValue('SD Negeri Persiapan Gainesville')
    })

    it('should handle phone number with various formats', async () => {
      const user = userEvent.setup()
      render(<PPDBForm />)

      const phoneInput = screen.getByLabelText(/Nomor Telepon/i)
      await user.type(phoneInput, '+6281234567890')

      expect(phoneInput).toHaveValue('+6281234567890')
    })
  })
})
