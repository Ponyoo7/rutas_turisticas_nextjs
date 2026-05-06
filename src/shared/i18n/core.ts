export type TranslationValues = Record<string, string | number>

export type TranslationTree = {
  [key: string]: string | TranslationTree
}

const isTranslationTree = (
  value: string | TranslationTree | undefined,
): value is TranslationTree =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const getTranslationNode = (messages: TranslationTree, key: string) => {
  const segments = key.split('.')
  let current: string | TranslationTree | undefined = messages

  for (const segment of segments) {
    if (!isTranslationTree(current)) return undefined
    current = current[segment]
  }

  return typeof current === 'string' ? current : undefined
}

export const translateMessage = (
  messages: TranslationTree,
  key: string,
  values?: TranslationValues,
) => {
  const template = getTranslationNode(messages, key)

  if (!template) return key
  if (!values) return template

  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey: string) => {
    const value = values[rawKey.trim()]

    return value == null ? '' : String(value)
  })
}
