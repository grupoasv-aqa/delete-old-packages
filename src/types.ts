import { Range } from "semver"

export enum PackageType {
  Npm = "npm",
  Maven = "maven",
  Rubygems = "rubygems",
  Docker = "docker",
  Nuget = "nuget",
  Container = "container",
}

export type Input = {
  names: string[]
  versionPattern?: RegExp
  semverPattern?: Range
  specificVersion?: string
  keep: number
  type?: PackageType
  token: string
  dryRun: boolean
  user: string
  organization: string
  owner: string
  repo: string
}

export type RestInput = Input & {
  type: PackageType
}

export type Package = {
  name: string
  versions: PackageVersion[]
}

export type PackageVersion = {
  id: string
  names: string[]
}

export interface QueryStrategy {
  queryPackages(input: Input): Promise<Package[]>
}

export interface DeleteStrategy {
  deletePackageVersion(input: Input, name: string, id: string): Promise<void>
}
