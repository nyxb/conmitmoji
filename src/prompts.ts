import type {
   ChatCompletionRequestMessage,
} from 'openai'
import {
   ChatCompletionRequestMessageRoleEnum,
} from 'openai'
import { getConfig } from './commands/config'
import type { ConsistencyPrompt } from './types'
import type { I18nLocals } from './i18n'
import { i18n } from './i18n'

const config = getConfig()
const translation = i18n[(config?.MOJI_LANGUAGE as I18nLocals) || 'en']

export const IDENTITY
  = 'You are to act as the author of a commit message in git.'

export const EMOJIS
  = { 'fix': '🩹', 'ci': '🤖', 'build': '🛠️', 'chore': '🧹', 'docs': '📚', 'feat': '✨', 'perf': '⚡️', 'refactor': '♻️', 'revert': '⏪', 'style': '🎨', 'test': '🧪', 'animations': '🎭', 'common': '🌍', 'compiler': '🔍', 'compiler-cli': '🔧', 'core': '💙', 'elements': '🧩', 'forms': '📝', 'http': '📡', 'language-service': '🗣️', 'platform-browser': '🌐', 'platform-browser-dynamic': '🌌', 'platform-server': '🖥️', 'platform-webworker': '🕸️', 'platform-webworker-dynamic': '🕷️', 'router': '🛣️', 'service-worker': '📊', 'upgrade': '⬆️', 'packaging': '📦', 'changelog': '📜', 'aio': '📘' }

function INIT_MAIN_PROMPT(language: string): ChatCompletionRequestMessage {
   // Erstellen Sie einen String, der die Emoji-Typ-Zuordnung darstellt
   const emojiList = Object.entries(EMOJIS)
      .map(([type, emoji]) => `${emoji} - ${type}`)
      .join(', ')

   const descriptionInstruction = config?.MOJI_DESCRIPTION
      ? 'Include a short description explaining WHY the changes were made.'
      : 'Do not include a description unless the changes are complex.'

   const issueInstruction = 'Do not reference issues unless they are mentioned in the git diff output.'

   return {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: `${IDENTITY} Your mission is to create clean and comprehensive commit messages as per the conventional commit convention. When generating a commit message based on the 'git diff --staged' output provided, follow these guidelines:
     - Start each commit with an emoji that corresponds to the change type: ${emojiList}.
     - Follow the conventional commit structure: <emoji> <type>(<scope>): <description>.
     - ${descriptionInstruction}
     - ${issueInstruction}
     Remember to use the present tense and keep lines under 74 characters. Use ${language} for the commit message.`,
   }
}

export const INIT_DIFF_PROMPT: ChatCompletionRequestMessage = {
   role: ChatCompletionRequestMessageRoleEnum.User,
   content: `diff --git a/src/server.ts b/src/server.ts
    index ad4db42..f3b18a9 100644
    --- a/src/server.ts
    +++ b/src/server.ts
    @@ -10,7 +10,7 @@
    import {
        initWinstonLogger();
        
        const app = express();
        -const port = 7799;
        +const PORT = 7799;
        
        app.use(express.json());
        
        @@ -34,6 +34,6 @@
        app.use((_, res, next) => {
            // ROUTES
            app.use(PROTECTED_ROUTER_URL, protectedRouter);
            
            -app.listen(port, () => {
                -  console.log(\`Server listening on port \${port}\`);
                +app.listen(process.env.PORT || PORT, () => {
                    +  console.log(\`Server listening on port \${PORT}\`);
                });`,
}

function INIT_CONSISTENCY_PROMPT(translation: ConsistencyPrompt): ChatCompletionRequestMessage {
   return {
      role: ChatCompletionRequestMessageRoleEnum.Assistant,
      content: `
${config?.MOJI_DESCRIPTION ? translation.commitDescription : ''}`,
   }
}

export async function getMainCommitPrompt(): Promise<
  ChatCompletionRequestMessage[]
> {
   return [
      INIT_MAIN_PROMPT(translation.localLanguage),
      INIT_DIFF_PROMPT,
      INIT_CONSISTENCY_PROMPT(translation),
   ]
}
