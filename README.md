<h1 align="center"/>ConmitMoji <sup><em>AI power</em></sup></h1>

<p align="center">
Follow Conventional Emoji Commits convention
</p>

</br>

## Setup ConmitMoji as a CLI tool

You can use ConmitMoji by simply running it via the CLI like this `moji`. 2 seconds and your staged changes are committed with a meaningful message.

1. Install ConmitMoji globally to use in any repository:

   ```sh
   npm install -g conmitmoji
   ```

   MacOS may ask to run the command with `sudo` when installing a package globally.

2. Get your API key from [OpenAI](https://platform.openai.com/account/api-keys). Make sure that you add your payment details, so the API works.

3. Set the key to ConmitMoji config:

   ```sh
   moji config set MOJI_OPENAI_API_KEY=<your_api_key>
   ```

   Your API key is stored locally in the `~/.conmitmoji` config file.

## Usage

You can call ConmitMoji directly to generate a commit message for your staged changes:

```sh
git add <files...>
conmitmoji
```

You can also use the `moji` shortcut:

```sh
git add <files...>
moji
```

## Configuration

### Local per repo configuration

Create a `.env` file and add ConmitMoji config variables there like this:

```env
MOJI_OPENAI_API_KEY=<your OpenAI API token>
MOJI_OPENAI_MAX_TOKENS=<max response tokens from OpenAI API>
MOJI_OPENAI_BASE_PATH=<may be used to set proxy path to OpenAI api>
MOJI_DESCRIPTION=<postface a message with ~3 sentences description of the changes>
MOJI_MODEL=<either 'gpt-4', 'gpt-3.5-turbo-16k' (default), 'gpt-3.5-turbo-0613' or 'gpt-3.5-turbo'>
MOJI_LANGUAGE=<locale, scroll to the bottom to see options>
MOJI_MESSAGE_TEMPLATE_PLACEHOLDER=<message template placeholder, default: '$msg'>
```

### Global config for all repos

Local config still has more priority than Global config, but you may set `MOJI_MODEL` and `MOJI_LOCALE` globally and set local configs for `MOJI_DESCRIPTION` per repo which is more convenient.

Simply set any of the variables above like this:

```sh
moji config set MOJI_MODEL=gpt-4
```

### Switch to GPT-4 or other models

By default, ConmitMoji uses fine tuned `ft:gpt-3.5-turbo-0613:nyxb::8HxpgD3D` model.

You may switch to GPT-4 which performs better, but costs ~x15 times more 🤠

```sh
moji config set MOJI_MODEL=gpt-4
```

or for as a cheaper option:

```sh
moji config set MOJI_MODEL=gpt-3.5-turbo
```

Make sure that you spell it `gpt-4` (lowercase) and that you have API access to the 4th model. Even if you have ChatGPT+, that doesn't necessarily mean that you have API access to GPT-4.

### Locale configuration

To globally specify the language used to generate commit messages:

```sh
# de, German ,Deutsch
moji config set MOJI_LANGUAGE=de
moji config set MOJI_LANGUAGE=German
moji config set MOJI_LANGUAGE=Deutsch

# fr, French, française
moji config set MOJI_LANGUAGE=fr
moji config set MOJI_LANGUAGE=French
moji config set MOJI_LANGUAGE=française
```

The default language setting is **English**
All available languages are currently listed in the [i18n](https://github.com/nyxb/conmitmoji/tree/master/src/i18n) folder

## Git flags

The `conmitmoji` or `moji` commands can be used in place of the `git commit -m "${generatedMessage}"` command. This means that any regular flags that are used with the `git commit` command will also be applied when using `conmitmoji` or `moji`.

```sh
moji --no-verify
```

is translated to :

```sh
git commit -m "${generatedMessage}" --no-verify
```

To include a message in the generated message, you can utilize the template function, for instance:

```sh
moji '#205: $msg’
```

> conmitmoji examines placeholders in the parameters, allowing you to append additional information before and after the placeholders, such as the relevant Issue or Pull Request. Similarly, you have the option to customize the MOJI_MESSAGE_TEMPLATE_PLACEHOLDER configuration item, for example, simplifying it to $m!"

### Message Template Placeholder Config

#### Overview

The `MOJI_MESSAGE_TEMPLATE_PLACEHOLDER` feature in the `conmitmoji` tool allows users to embed a custom message within the generated commit message using a template function. This configuration is designed to enhance the flexibility and customizability of commit messages, making it easier for users to include relevant information directly within their commits.

#### Implementation Details

In our codebase, the implementation of this feature can be found in the following segment:

```javascript
commitMessage = messageTemplate.replace(
  config?.MOJI_MESSAGE_TEMPLATE_PLACEHOLDER,
  commitMessage
);
```

This line is responsible for replacing the placeholder in the `messageTemplate` with the actual `commitMessage`.

#### Usage

For instance, using the command `moji '$msg #205’`, users can leverage this feature. The provided code represents the backend mechanics of such commands, ensuring that the placeholder is replaced with the appropriate commit message.

#### Committing with the Message

Once users have generated their desired commit message, they can proceed to commit using the generated message. By understanding the feature's full potential and its implementation details, users can confidently use the generated messages for their commits.

### Ignore files

You can remove files from being sent to OpenAI by creating a `.conmitmojiignore` file. For example:

```ignorelang
path/to/large-asset.zip
**/*.jpg
```

This helps prevent conmitmoji from uploading artifacts and large files.

By default, conmitmoji ignores files matching: `*-lock.*` and `*.lock`

## Git hook (KILLER FEATURE)

You can set ConmitMoji as Git [`prepare-commit-msg`](https://git-scm.com/docs/githooks#_prepare_commit_msg) hook. Hook integrates with your IDE Source Control and allows you to edit the message before committing.

To set the hook:

```sh
moji hook set
```

To unset the hook:

```sh
moji hook unset
```

To use the hook:

```sh
git add <files...>
git commit
```

Or follow the process of your IDE Source Control feature, when it calls `git commit` command — ConmitMoji will integrate into the flow.

## Setup ConmitMoji as a GitHub Action (BETA) 🔥

ConmitMoji is now available as a GitHub Action which automatically improves all new commits messages when you push to remote!

This is great if you want to make sure all of the commits in all of your repository branches are meaningful and not lame like `fix1` or `done2`.

Create a file `.github/workflows/conmitmoji.yml` with the contents below:

```yml
name: ConmitMoji Action

on:
  push:
    # this list of branches is often enough,
    # but you may still ignore other public branches
    branches-ignore: [main master dev development release]

jobs:
  conmitmoji:
    timeout-minutes: 10
    name: ConmitMoji
    runs-on: ubuntu-latest
    permissions: write-all
    steps:
      - name: Setup Node.js Environment
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: nyxb/conmitmoji@github-action-v1.0.4
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

        env:
          # set openAI api key in repo actions secrets,
          # for openAI keys go to: https://platform.openai.com/account/api-keys
          # for repo secret go to: <your_repo_url>/settings/secrets/actions
          MOJI_OPENAI_API_KEY: ${{ secrets.MOJI_OPENAI_API_KEY }}

          # customization
          MOJI_OPENAI_MAX_TOKENS: 500
          MOJI_OPENAI_BASE_PATH: ''
          MOJI_DESCRIPTION: false
          MOJI_MODEL: gpt-3.5-turbo-16k
          MOJI_LANGUAGE: en
```

That is it. Now when you push to any branch in your repo — all NEW commits are being improved by your never-tired AI.

Make sure you exclude public collaboration branches (`main`, `dev`, `etc`) in `branches-ignore`, so ConmitMoji does not rebase commits there while improving the messages.

Interactive rebase (`rebase -i`) changes commits' SHA, so the commit history in remote becomes different from your local branch history. This is okay if you work on the branch alone, but may be inconvenient for other collaborators.

## Payments

You pay for your requests to OpenAI API on your own.

ConmitMoji stores your key locally.

ConmitMoji by default uses fine tuned ft:gpt-3.5-turbo-0613:nyxb::8HxpgD3D model, it should not exceed $0.10 per casual working day.

You may switch to gpt-4, it's better, but more expensive.
