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

function INIT_MAIN_PROMPT(language: string): ChatCompletionRequestMessage {
   return {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: `${IDENTITY} Your mission is to create clean and comprehensive commit messages as per the conventional emoji commits convention and explain WHAT were the changes and mainly WHY the changes were done. I'll send you an output of 'git diff --staged' command, and you are to convert it into a commit message.
    ${
      config?.MOJI_DESCRIPTION
        ? 'Add a short description of WHY the changes are done after the commit message. Don\'t start it with "This commit", just describe the changes.'
        : 'Don\'t add any descriptions to the commit, only commit message.'
    }
    Use the present tense. Lines must not be longer than 74 characters. Use ${language} for the commit message.`,
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
      content: `${config?.MOJI_EMOJI ? '🐛 ' : ''}${translation.commitFix}
${config?.MOJI_EMOJI ? '✨ ' : ''}${translation.commitFeat}
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
