import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join as pathJoin } from 'node:path'
import chalk from 'chalk'
import { command } from 'cleye'
import * as dotenv from 'dotenv'
import { parse as iniParse, stringify as iniStringify } from 'ini'

import { intro, outro } from '@tyck/prompts'

import { COMMANDS } from '../CommandsEnum'
import { getI18nLocal } from '../i18n'

dotenv.config()

export enum CONFIG_KEYS {
   MOJI_OPENAI_API_KEY = 'MOJI_OPENAI_API_KEY',
   MOJI_OPENAI_MAX_TOKENS = 'MOJI_OPENAI_MAX_TOKENS',
   MOJI_OPENAI_BASE_PATH = 'MOJI_OPENAI_BASE_PATH',
   MOJI_DESCRIPTION = 'MOJI_DESCRIPTION',
   MOJI_MODEL = 'MOJI_MODEL',
   MOJI_LANGUAGE = 'MOJI_LANGUAGE',
   MOJI_MESSAGE_TEMPLATE_PLACEHOLDER = 'MOJI_MESSAGE_TEMPLATE_PLACEHOLDER',
}

export const DEFAULT_MODEL_TOKEN_LIMIT = 4096

export enum CONFIG_MODES {
   get = 'get',
   set = 'set',
}

function validateConfig(key: string, condition: any, validationMessage: string) {
   if (!condition) {
      outro(
      `${chalk.red('✖')} Unsupported config key ${key}: ${validationMessage}`,
      )

      process.exit(1)
   }
}

export const configValidators = {
   [CONFIG_KEYS.MOJI_OPENAI_API_KEY](value: any, config: any = {}) {
      validateConfig(CONFIG_KEYS.MOJI_OPENAI_API_KEY, value, 'Cannot be empty')
      validateConfig(
         CONFIG_KEYS.MOJI_OPENAI_API_KEY,
         value.startsWith('sk-'),
         'Must start with "sk-"',
      )
      validateConfig(
         CONFIG_KEYS.MOJI_OPENAI_API_KEY,
         config[CONFIG_KEYS.MOJI_OPENAI_BASE_PATH] || value.length === 51,
         'Must be 51 characters long',
      )

      return value
   },

   [CONFIG_KEYS.MOJI_DESCRIPTION](value: any) {
      validateConfig(
         CONFIG_KEYS.MOJI_DESCRIPTION,
         typeof value === 'boolean',
         'Must be true or false',
      )

      return value
   },

   [CONFIG_KEYS.MOJI_OPENAI_MAX_TOKENS](value: any) {
      // If the value is a string, convert it to a number.
      if (typeof value === 'string') {
         value = Number.parseInt(value)
         validateConfig(
            CONFIG_KEYS.MOJI_OPENAI_MAX_TOKENS,
            !isNaN(value),
            'Must be a number',
         )
      }
      validateConfig(
         CONFIG_KEYS.MOJI_OPENAI_MAX_TOKENS,
         value ? typeof value === 'number' : undefined,
         'Must be a number',
      )

      return value
   },

   [CONFIG_KEYS.MOJI_LANGUAGE](value: any) {
      validateConfig(
         CONFIG_KEYS.MOJI_LANGUAGE,
         getI18nLocal(value),
      `${value} is not supported yet`,
      )
      return getI18nLocal(value)
   },

   [CONFIG_KEYS.MOJI_OPENAI_BASE_PATH](value: any) {
      validateConfig(
         CONFIG_KEYS.MOJI_OPENAI_BASE_PATH,
         typeof value === 'string',
         'Must be string',
      )
      return value
   },

   [CONFIG_KEYS.MOJI_MODEL](value: any) {
      validateConfig(
         CONFIG_KEYS.MOJI_MODEL,
         [
            'gpt-3.5-turbo',
            'gpt-4',
            'gpt-3.5-turbo-16k',
            'gpt-3.5-turbo-0613',
            'ft:gpt-3.5-turbo-0613:nyxb::8HxpgD3D',
            'gpt-4-1106-preview',
         ].includes(value),
      `${value} is not supported yet, use 'gpt-4', 'gpt-3.5-turbo-16k' (default), 'gpt-3.5-turbo-0613' or 'gpt-3.5-turbo'`,
      )
      return value
   },
   [CONFIG_KEYS.MOJI_MESSAGE_TEMPLATE_PLACEHOLDER](value: any) {
      validateConfig(
         CONFIG_KEYS.MOJI_MESSAGE_TEMPLATE_PLACEHOLDER,
         value.startsWith('$'),
      `${value} must start with $, for example: '$msg'`,
      )
      return value
   },
}

export type ConfigType = {
   [key in CONFIG_KEYS]?: any;
}

const configPath = pathJoin(homedir(), '.conmitmoji')

export function getConfig(): ConfigType | null {
   const configFromEnv = {
      MOJI_OPENAI_API_KEY: process.env.MOJI_OPENAI_API_KEY,
      MOJI_OPENAI_MAX_TOKENS: process.env.MOJI_OPENAI_MAX_TOKENS
         ? Number(process.env.MOJI_OPENAI_MAX_TOKENS)
         : undefined,
      MOJI_OPENAI_BASE_PATH: process.env.MOJI_OPENAI_BASE_PATH,
      MOJI_DESCRIPTION: process.env.MOJI_DESCRIPTION === 'true',
      MOJI_MODEL: process.env.MOJI_MODEL || 'gpt-4-1106-preview',
      MOJI_LANGUAGE: process.env.MOJI_LANGUAGE || 'en',
      MOJI_MESSAGE_TEMPLATE_PLACEHOLDER:
      process.env.MOJI_MESSAGE_TEMPLATE_PLACEHOLDER || '$msg',
   }

   const configExists = existsSync(configPath)
   if (!configExists)
      return configFromEnv

   const configFile = readFileSync(configPath, 'utf8')
   const config = iniParse(configFile)

   for (const configKey of Object.keys(config)) {
      if (
         !config[configKey]
      || ['null', 'undefined'].includes(config[configKey])
      ) {
         config[configKey] = undefined
         continue
      }
      try {
         const validator = configValidators[configKey as CONFIG_KEYS]
         const validValue = validator(
            config[configKey] ?? configFromEnv[configKey as CONFIG_KEYS],
            config,
         )

         config[configKey] = validValue
      }
      catch (error) {
         outro(
        `'${configKey}' name is invalid, it should be either 'MOJI_${configKey.toUpperCase()}' or it doesn't exist.`,
         )
         outro(
        `Manually fix the '.env' file or global '~/.conmitmoji' config file.`,
         )
         process.exit(1)
      }
   }

   return config
}

export function setConfig(keyValues: [key: string, value: string][]) {
   const config = getConfig() || {}

   for (const [configKey, configValue] of keyValues) {
      if (!configValidators.hasOwnProperty(configKey))
         throw new Error(`Unsupported config key: ${configKey}`)

      let parsedConfigValue

      try {
         parsedConfigValue = JSON.parse(configValue)
      }
      catch (error) {
         parsedConfigValue = configValue
      }

      const validValue
      = configValidators[configKey as CONFIG_KEYS](parsedConfigValue)
      config[configKey as CONFIG_KEYS] = validValue
   }

   writeFileSync(configPath, iniStringify(config), 'utf8')

   outro(`${chalk.green('✔')} Config successfully set`)
}

export const configCommand = command(
   {
      name: COMMANDS.config,
      parameters: ['<mode>', '<key=values...>'],
   },
   async (argv) => {
      intro('conmitmoji — config')
      try {
         const { mode, keyValues } = argv._

         if (mode === CONFIG_MODES.get) {
            const config = getConfig() || {}
            for (const key of keyValues)
               outro(`${key}=${config[key as keyof typeof config]}`)
         }
         else if (mode === CONFIG_MODES.set) {
            await setConfig(
               keyValues.map(keyValue => keyValue.split('=') as [string, string]),
            )
         }
         else {
            throw new Error(
          `Unsupported mode: ${mode}. Valid modes are: "set" and "get"`,
            )
         }
      }
      catch (error) {
         outro(`${chalk.red('✖')} ${error}`)
         process.exit(1)
      }
   },
)
