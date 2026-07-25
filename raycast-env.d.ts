/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Server Base URL - Base URL of Coach Watts instance (default: https://coachwatts.com or your self-hosted URL) */
  "baseUrl": string,
  /** API Key (Optional) - Optional API Key. If left blank, Raycast will authenticate via OAuth 2.0 with PKCE. */
  "apiKey"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `today` command */
  export type Today = ExtensionPreferences & {}
  /** Preferences accessible in the `workouts` command */
  export type Workouts = ExtensionPreferences & {}
  /** Preferences accessible in the `wellness` command */
  export type Wellness = ExtensionPreferences & {}
  /** Preferences accessible in the `ask-coach` command */
  export type AskCoach = ExtensionPreferences & {}
  /** Preferences accessible in the `sync` command */
  export type Sync = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `today` command */
  export type Today = {}
  /** Arguments passed to the `workouts` command */
  export type Workouts = {}
  /** Arguments passed to the `wellness` command */
  export type Wellness = {}
  /** Arguments passed to the `ask-coach` command */
  export type AskCoach = {}
  /** Arguments passed to the `sync` command */
  export type Sync = {}
}

