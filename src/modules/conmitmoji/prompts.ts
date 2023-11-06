import { EmojiCommitTypes, isBreakingChange } from './config'

export function createCommitPrompt(
   type: EmojiCommitTypes,
   scope: string,
   description: string,
   body?: string,
   footer?: string,
): string {
   let commitMessage = `${type}${scope ? `(${scope})` : ''}: ${description}`

   if (body)
      commitMessage += `\n\n${body}`

   if (footer)
      commitMessage += `\n\n${footer}`

   if (isBreakingChange(type))
      commitMessage += `\n\n🚨 BREAKING CHANGE: ${description}`

   return commitMessage
}

// Beispielnutzung:
const exampleCommit = createCommitPrompt(
   EmojiCommitTypes.FEAT,
   'parser',
   'add ability to parse arrays',
)
console.log(exampleCommit)
