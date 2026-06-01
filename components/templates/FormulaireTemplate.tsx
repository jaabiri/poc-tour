'use client'

import { useState } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { Container, SectionLabel } from '@/components/ui'

import type { Formulaire } from '@/payload-types'

/**
 * FormulaireTemplate — T10 online form (Payload Form Builder).
 *
 * Client Component: it owns the field values, required-field validation and the
 * submission lifecycle, then POSTs to Payload's REST `form-submissions`
 * endpoint. On success it either swaps in the confirmation message (RichText) or
 * redirects, per the form's `confirmationType`.
 *
 * Styling follows BlockRenderer.tsx exactly: semantic design tokens only
 * (CLAUDE.md §1/§2 — no arbitrary Tailwind values, no raw palette colours).
 *
 * Per the template contract it returns ONLY the page's main content (no
 * Topbar/SiteHeader/SiteFooter, no outer <main>, no breadcrumb — the dispatcher
 * route supplies that chrome).
 */

/** One member of the Form Builder field union. */
type FormField = NonNullable<NonNullable<Formulaire['fields']>[number]>

/** Field block types that render an actual user input (i.e. not `message`). */
type InputField = Exclude<FormField, { blockType: 'message' }>

/** A field's submitted value as held in component state. */
type FieldValue = string | boolean

/** A two-letter helper: width as a responsive column span on a 12-col grid. */
const widthClass = (width?: number | null): string => {
  // `width` is a percentage (Form Builder convention). Map to half / full so the
  // layout stays on the semantic grid without arbitrary values.
  if (typeof width === 'number' && width > 0 && width <= 50) return 'sm:col-span-6'
  return 'sm:col-span-12'
}

/** Shared input chrome (token-only). */
const inputClass =
  'bg-surface-main border-border-main text-text-primary focus-visible:border-brand-primary w-full rounded-md border px-4 py-3 text-base leading-relaxed outline-none transition-colors'

/** Shared label chrome (token-only). */
const labelClass = 'text-brand-primary-dark mb-1.5 block text-sm font-semibold'

/** A required-field marker. */
function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-action ml-1">
      *
    </span>
  )
}

/** Render the visible label for an input field, with optional required marker. */
function FieldLabel({
  field,
  htmlFor,
}: {
  field: InputField
  htmlFor: string
}) {
  const text = field.label ?? field.name
  return (
    <label htmlFor={htmlFor} className={labelClass}>
      {text}
      {'required' in field && field.required ? <RequiredMark /> : null}
    </label>
  )
}

/** Two-letter country/state placeholder helper: Form Builder ships these as free
 * text inputs in this POC (no bundled lists), so we render a plain text input. */
function FormulaireTemplateInner({ form }: { form: Formulaire }) {
  const fields = (form.fields ?? []).filter(
    (f): f is FormField => f !== null && typeof f === 'object',
  )

  // State: minimal — a flat map of field name → value. Derived UI (errors) is
  // computed during submit, not stored as duplicated state.
  const [values, setValues] = useState<Record<string, FieldValue>>(() => {
    const initial: Record<string, FieldValue> = {}
    for (const f of fields) {
      if (f.blockType === 'message' || f.blockType === 'upload') continue
      if (f.blockType === 'checkbox') {
        initial[f.name] = f.defaultValue ?? false
      } else if (f.blockType === 'number' || f.blockType === 'select' || f.blockType === 'text' || f.blockType === 'textarea') {
        initial[f.name] = f.defaultValue != null ? String(f.defaultValue) : ''
      } else {
        initial[f.name] = ''
      }
    }
    return initial
  })

  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle',
  )

  const setValue = (name: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const validate = (): boolean => {
    const next: Record<string, boolean> = {}
    for (const f of fields) {
      if (f.blockType === 'message' || f.blockType === 'upload') continue
      if (!('required' in f) || !f.required) continue
      const v = values[f.name]
      if (f.blockType === 'checkbox') {
        if (v !== true) next[f.name] = true
      } else if (typeof v !== 'string' || v.trim() === '') {
        next[f.name] = true
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'submitting') return
    if (!validate()) {
      setStatus('error')
      return
    }
    setStatus('submitting')
    try {
      const submissionData = Object.entries(values).map(([field, value]) => ({
        field,
        value: String(value),
      }))
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: form.id, submissionData }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      if (form.confirmationType === 'redirect' && form.redirect?.url) {
        window.location.href = form.redirect.url
        return
      }
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  // Success + message confirmation: replace the form with the confirmation
  // message in place (no redirect configured / message mode).
  if (status === 'success' && form.confirmationType !== 'redirect') {
    return (
      <Container className="py-12">
        <div className="bg-surface-main border-border-main mx-auto max-w-2xl rounded-xl border p-8">
          <SectionLabel>Confirmation</SectionLabel>
          {form.confirmationMessage ? (
            <div className="prose-touraine text-text-primary mt-4 leading-relaxed">
              <RichText data={form.confirmationMessage} />
            </div>
          ) : (
            <p className="text-text-primary mt-4 text-lg leading-relaxed">
              Votre demande a bien été envoyée. Merci.
            </p>
          )}
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <SectionLabel>Formulaire</SectionLabel>
        <h1 className="font-display text-brand-primary-dark mb-7 mt-2.5 text-3xl font-bold leading-tight">
          {form.title}
        </h1>

        <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-12">
          {fields.map((field, i) => {
            const key = field.id ?? `${field.blockType}-${i}`

            // Static rich-text block — not an input.
            if (field.blockType === 'message') {
              return (
                <div key={key} className="sm:col-span-12">
                  {field.message ? (
                    <div className="prose-touraine text-text-primary leading-relaxed">
                      <RichText data={field.message} />
                    </div>
                  ) : null}
                </div>
              )
            }

            // Upload is intentionally out of scope for this POC: render a
            // disabled, accessible note rather than a non-functional control.
            if (field.blockType === 'upload') {
              return (
                <div key={key} className="sm:col-span-12">
                  <span className={labelClass}>{field.label ?? field.name}</span>
                  <div className="bg-surface-page border-border-main text-text-muted rounded-md border border-dashed p-4 text-sm">
                    L&apos;envoi de fichier n&apos;est pas disponible sur ce formulaire.
                  </div>
                </div>
              )
            }

            const inputId = `field-${field.name}`
            const hasError = errors[field.name] === true
            const describedBy = hasError ? `${inputId}-error` : undefined
            const errorRing = hasError ? 'border-action' : ''

            // Checkbox: inline label + box.
            if (field.blockType === 'checkbox') {
              const checked = values[field.name] === true
              return (
                <div key={key} className={widthClass(field.width)}>
                  <label htmlFor={inputId} className="flex items-start gap-3">
                    <input
                      id={inputId}
                      name={field.name}
                      type="checkbox"
                      checked={checked}
                      required={field.required ?? undefined}
                      aria-invalid={hasError || undefined}
                      aria-describedby={describedBy}
                      onChange={(e) => setValue(field.name, e.target.checked)}
                      className="border-border-main text-action mt-0.5 size-5 rounded-sm border"
                    />
                    <span className="text-text-primary text-sm leading-relaxed">
                      {field.label ?? field.name}
                      {field.required ? <RequiredMark /> : null}
                    </span>
                  </label>
                  {hasError ? (
                    <p id={describedBy} className="text-action mt-1.5 text-sm">
                      Ce champ est obligatoire.
                    </p>
                  ) : null}
                </div>
              )
            }

            const value = typeof values[field.name] === 'string' ? (values[field.name] as string) : ''

            // Select.
            if (field.blockType === 'select') {
              return (
                <div key={key} className={widthClass(field.width)}>
                  <FieldLabel field={field} htmlFor={inputId} />
                  <select
                    id={inputId}
                    name={field.name}
                    value={value}
                    required={field.required ?? undefined}
                    aria-invalid={hasError || undefined}
                    aria-describedby={describedBy}
                    onChange={(e) => setValue(field.name, e.target.value)}
                    className={`${inputClass} ${errorRing}`}
                  >
                    <option value="">Sélectionner…</option>
                    {(field.options ?? []).map((opt) => (
                      <option key={opt.id ?? opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {hasError ? (
                    <p id={describedBy} className="text-action mt-1.5 text-sm">
                      Ce champ est obligatoire.
                    </p>
                  ) : null}
                </div>
              )
            }

            // Textarea.
            if (field.blockType === 'textarea') {
              return (
                <div key={key} className={widthClass(field.width)}>
                  <FieldLabel field={field} htmlFor={inputId} />
                  <textarea
                    id={inputId}
                    name={field.name}
                    value={value}
                    rows={5}
                    required={field.required ?? undefined}
                    aria-invalid={hasError || undefined}
                    aria-describedby={describedBy}
                    onChange={(e) => setValue(field.name, e.target.value)}
                    className={`${inputClass} ${errorRing} resize-y`}
                  />
                  {hasError ? (
                    <p id={describedBy} className="text-action mt-1.5 text-sm">
                      Ce champ est obligatoire.
                    </p>
                  ) : null}
                </div>
              )
            }

            // Remaining single-line inputs: text, email, number, country, state.
            const inputType =
              field.blockType === 'email'
                ? 'email'
                : field.blockType === 'number'
                  ? 'number'
                  : 'text'

            return (
              <div key={key} className={widthClass(field.width)}>
                <FieldLabel field={field} htmlFor={inputId} />
                <input
                  id={inputId}
                  name={field.name}
                  type={inputType}
                  value={value}
                  required={field.required ?? undefined}
                  aria-invalid={hasError || undefined}
                  aria-describedby={describedBy}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  className={`${inputClass} ${errorRing}`}
                />
                {hasError ? (
                  <p id={describedBy} className="text-action mt-1.5 text-sm">
                    Ce champ est obligatoire.
                  </p>
                ) : null}
              </div>
            )
          })}

          <div className="sm:col-span-12">
            {status === 'error' ? (
              <p role="alert" className="text-action mb-4 text-sm font-semibold">
                Une erreur est survenue. Veuillez vérifier les champs obligatoires et réessayer.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="bg-brand-primary text-text-inverse hover:bg-brand-primary-mid rounded-md px-6 py-3 text-base font-semibold no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'submitting'
                ? 'Envoi en cours…'
                : (form.submitButtonLabel ?? 'Envoyer')}
            </button>
          </div>
        </form>
      </div>
    </Container>
  )
}

export function FormulaireTemplate({ form }: { form: Formulaire }) {
  // `key` resets all internal state if a different form is rendered in place.
  return <FormulaireTemplateInner key={form.id} form={form} />
}

export default FormulaireTemplate
