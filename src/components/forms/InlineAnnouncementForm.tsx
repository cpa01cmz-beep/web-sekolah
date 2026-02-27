import { useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { validateTitle, validateContent } from '@/utils/validation'
import { useFormValidation } from '@/hooks/useFormValidation'

interface InlineAnnouncementFormProps {
  onSave: (data: { title: string; content: string }) => void
  isLoading: boolean
}

export const InlineAnnouncementForm = memo(function InlineAnnouncementForm({
  onSave,
  isLoading,
}: InlineAnnouncementFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const formData = { title, content }
  const { errors, validateAll } = useFormValidation(formData, {
    validators: {
      title: (value, show) => validateTitle(value, show, 5),
      content: (value, show) => validateContent(value, show, 10),
    },
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateAll()) {
        return
      }
      onSave({ title: title.trim(), content: content.trim() })
    },
    [title, content, validateAll, onSave]
  )

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }, [])

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }, [])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="title"
        label="Title"
        error={errors.title}
        helperText="Enter a descriptive title (minimum 5 characters)"
        required
      >
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Announcement Title"
          disabled={isLoading}
          aria-busy={isLoading}
        />
      </FormField>
      <FormField
        id="content"
        label="Content"
        error={errors.content}
        helperText="Provide detailed information (minimum 10 characters)"
        required
      >
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Write your announcement here..."
          rows={5}
          disabled={isLoading}
          aria-busy={isLoading}
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? 'Posting...' : 'Post Announcement'}
      </Button>
    </form>
  )
})
InlineAnnouncementForm.displayName = 'InlineAnnouncementForm'
