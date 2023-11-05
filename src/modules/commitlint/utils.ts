import fs from 'node:fs/promises'

import { COMMITLINT_LLM_CONFIG_PATH } from './constants'
import type { CommitlintLLMConfig } from './types'

/**
 * Removes the "\n" only if occurring twice
 */
export function removeDoubleNewlines(input: string): string {
   const pattern = /\\n\\n/g
   if (pattern.test(input)) {
      const newInput = input.replace(pattern, '')
      return removeDoubleNewlines(newInput)
   }

   return input
}

export async function commitlintLLMConfigExists(): Promise<boolean> {
   let exists
   try {
      await fs.access(COMMITLINT_LLM_CONFIG_PATH)
      exists = true
   }
   catch (e) {
      exists = false
   }

   return exists
}

export async function writeCommitlintLLMConfig(commitlintLLMConfig: CommitlintLLMConfig): Promise<void> {
   await fs.writeFile(
      COMMITLINT_LLM_CONFIG_PATH,
      JSON.stringify(commitlintLLMConfig, null, 2),
   )
}

export async function getCommitlintLLMConfig(): Promise<CommitlintLLMConfig> {
   const content = await fs.readFile(COMMITLINT_LLM_CONFIG_PATH)
   const commitLintLLMConfig = JSON.parse(
      content.toString(),
   ) as CommitlintLLMConfig
   return commitLintLLMConfig
}
