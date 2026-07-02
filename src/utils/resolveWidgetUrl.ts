/**
 * 将 Widget 数据源 URL 中的 {{variables.xxx}} / {{xxx}} 占位符替换为运行时变量值。
 */
export function resolveWidgetUrl(
  url: string,
  variables: Record<string, unknown> = {},
): string {
  return url.replace(/\{\{(?:variables\.)?(\w+)\}\}/g, (_, name: string) => {
    const val = variables[name]
    if (val === undefined || val === null) return ''
    return encodeURIComponent(String(val))
  })
}
