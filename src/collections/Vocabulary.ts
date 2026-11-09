import { revalidateTag } from 'next/cache'
import type { CollectionConfig } from 'payload'

const refreshVocabulary = () => {
  revalidateTag('vocabulary', 'max')
}

export const Vocabulary: CollectionConfig = {
  slug: 'vocabulary',
  access: {
    create: ({ req }) => req.user?.collection === 'admins',
    delete: ({ req }) => req.user?.collection === 'admins',
    read: () => true,
    update: ({ req }) => req.user?.collection === 'admins',
  },
  admin: {
    group: 'Study library',
    useAsTitle: 'word',
    defaultColumns: ['word', 'reading', 'language', 'level', 'status'],
  },
  hooks: {
    afterChange: [() => refreshVocabulary()],
    afterDelete: [() => refreshVocabulary()],
  },
  fields: [
    { name: 'word', type: 'text', required: true, index: true },
    { name: 'reading', type: 'text', required: true },
    { name: 'romanization', type: 'text' },
    { name: 'meaning', type: 'textarea', required: true },
    {
      name: 'language',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'japanese',
      options: ['japanese', 'korean', 'spanish', 'english', 'indonesian'],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: ['new', 'learning', 'known'],
    },
    { name: 'level', type: 'text' },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'examples',
      type: 'array',
      fields: [
        { name: 'sentence', type: 'text', required: true },
        { name: 'reading', type: 'text' },
        { name: 'translation', type: 'text', required: true },
      ],
    },
    { name: 'etymology', type: 'textarea' },
    { name: 'source', type: 'text' },
    {
      name: 'conjugations',
      type: 'array',
      fields: [
        { name: 'form', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
  ],
}
