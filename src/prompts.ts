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
  = 'You are to act as the author of a commit message in git. Follow the Conventional Emoji Commits specification: start each commit with an emoji and a type (e.g., 🩹 fix: or ✨ feat:), optionally followed by a scope. Use present tense, keep lines under 74 characters. Include BREAKING CHANGE if necessary.'

export const RULES = `
  - Commits MUST start with an emoji and a type, optionally followed by a scope: <emoji><type>(<scope>): <description>
  - ONLY the following emojis and their corresponding scopes are allowed:
    🩹 :adhesive_bandage: (fix) - Corrections of bugs or issues.
    🤖 :robot: (ci) - Changes to CI configuration files or scripts.
    🛠️ :hammer_and_wrench: (build) - Changes that affect the build system or external dependencies.
    🧹 :broom: (chore) - Routine tasks or minor maintenance activities.
    📚 :books: (docs) - Changes or additions to documentation.
    ✨ :sparkles: (feat) - Introduction of a new feature or capability.
    ⚡️ :rocket: (perf) - Optimizations that improve system performance.
    ♻️ :recycle: (refactor) - Code revisions without changing functionality.
    ⏪ :rewind: (revert) - Reverting a previous commit.
    🎨 :art: (style) - Code style changes that don't affect functionality.
    🧪 :test_tube: (test) - Changes related to tests.
    🎭 :performing_arts: (animations) - Changes related to animation functionalities or effects.
    🌍 :earth_africa: (common) - General changes or updates that don't fit into other specific categories.
    🔍 :mag: (compiler) - Modifications related to code compilation or transformation processes.
    🔧 :wrench: (compiler-cli) - Changes to any command-line interface related to compilation.
    💙 :blue_heart: (core) - Fundamental changes or updates that affect the core functionalities.
    🧩 :jigsaw: (elements) - Updates related to individual components or elements.
    📝 :memo: (forms) - Changes related to form handling, input validation, or user input.
    📡 :satellite: (http) - Modifications related to HTTP requests, API calls, or data fetching.
    🗣️ :speaking_head: (language-service) - Updates to language services or translation functionalities.
    🌐 :globe_with_meridians: (platform-browser) - Changes related to browser-specific functionalities or features.
    🌌 :milky_way: (platform-browser-dynamic) - Dynamic implementations or updates for browser-specific functionalities.
    🖥️ :desktop_computer: (platform-server) - Changes related to server-side functionalities or back-end changes.
    🕸️ :spider_web: (platform-webworker) - Modifications related to web workers or background processing.
    🕷️ :spider: (platform-webworker-dynamic) - Dynamic implementations or updates for web worker functionalities.
    🛣️ :motorway: (router) - Updates related to routing, navigation, or URL management.
    📊 :bar_chart: (service-worker) - Changes related to service workers or offline capabilities.
    ⬆️ :arrow_up: (upgrade) - Modifications related to version upgrades or dependency updates.
    📦 :package: (packaging) - Changes that affect packaging, bundling, or distribution.
    📜 :scroll: (changelog) - Updates to logs, documentation, or annotations.
    📘 :blue_book: (aio) - Changes related to documentation or informational content.
  - Use present tense, keep lines under 74 characters.
  - Include BREAKING CHANGE with 🚨 or ❗ when necessary.
  - The description MUST immediately follow the colon and space after the type/scope prefix.
  - A longer commit body MAY be provided after the short description, separated by a blank line.
  - Footers follow a convention similar to git trailer format and MAY be included after the body, separated by a blank line.
  - BREAKING CHANGE MUST be uppercase and indicated in the type/scope prefix of a commit or as a footer.
  - Types other than ✨feat and 🩹fix MAY be used.
  - Commits MUST NOT be treated as case sensitive, except for 🚨 BREAKING CHANGE.
  `

function INIT_MAIN_PROMPT(language: string): ChatCompletionRequestMessage {
   return {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: `${IDENTITY} 
      Please adhere to the following rules when creating commit messages:
      ${RULES}
      Your mission is to create clean and comprehensive commit messages as per the conventional emoji commits convention and explain WHAT were the changes and mainly WHY the changes were done. I'll send you an output of 'git diff --staged' command, and you are to convert it into a commit message.
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
