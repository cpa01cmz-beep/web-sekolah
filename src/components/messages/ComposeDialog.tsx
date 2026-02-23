import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/ui/form-field'
import { Send } from 'lucide-react'
import { useFormValidation } from '@/hooks/useFormValidation'
import { validateRecipient, validateSubject, validateMessage } from '@/utils/validation'
import type { SchoolUser } from '@shared/types'

interface ComposeDialogProps {
  recipients: SchoolUser[]
  recipientLabel: string
  recipientPlaceholder: string
  onSend: (recipientId: string, subject: string, content: string) => void
  isLoading: boolean
}

const composeValidators = {
  recipientId: validateRecipient,
  subject: (value: string, show: boolean) => validateSubject(value, show, 3, 100),
  content: (value: string, show: boolean) => validateMessage(value, show, 10),
}

export function ComposeDialog({
  recipients,
  recipientLabel,
  recipientPlaceholder,
  onSend,
  isLoading,
}: ComposeDialogProps) {
  const [open, setOpen] = useState(false)
  const [recipientId, setRecipientId] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')

  const formData = useMemo(
    () => ({ recipientId, subject, content }),
    [recipientId, subject, content]
  )
  const {
    errors,
    validateAll,
    reset: resetValidation,
  } = useFormValidation(formData, {
    validators: composeValidators,
  })

  const handleClose = useCallback(() => {
    setRecipientId('')
    setSubject('')
    setContent('')
    resetValidation()
    setOpen(false)
  }, [resetValidation])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        handleClose()
      } else {
        setOpen(true)
      }
    },
    [handleClose]
  )

  const handleSend = () => {
    if (!validateAll()) return
    onSend(recipientId, subject.trim(), content.trim())
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Send className="h-4 w-4 mr-2" aria-hidden="true" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <FormField id="recipient" label={recipientLabel} error={errors.recipientId} required>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger>
                <SelectValue placeholder={recipientPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {recipients.map(recipient => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            id="message-subject"
            label="Subject"
            error={errors.subject}
            helperText="Enter a brief subject (3-100 characters)"
            required
          >
            <Input
              placeholder="Enter subject..."
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </FormField>
          <FormField
            id="message-content"
            label="Message"
            error={errors.content}
            helperText="Type your message (minimum 10 characters)"
            required
          >
            <Textarea
              placeholder="Type your message..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
            />
          </FormField>
          <Button
            onClick={handleSend}
            disabled={!recipientId || !subject.trim() || !content.trim()}
            isLoading={isLoading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" aria-hidden="true" />
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
