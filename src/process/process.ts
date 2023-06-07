import semverCoerce from "semver/functions/coerce"
import semverSatisfies from "semver/functions/satisfies"
import { Input, Package, PackageVersion } from "../types"
import { info } from "@actions/core"

export function processPackages(input: Input, packages: Package[]): Package[] {
  return packages
    .map(({ name, versions }) => ({ name, versions: findVersionsToDelete(input, name, versions).slice(input.specificVersion?0:input.keep) }))
    .filter((it) => it.versions.length >= 1)
}

export function findVersionsToDelete(input: Input, name: string, versions: PackageVersion[]): PackageVersion[] {
  if(input.specificVersion) {
    info(`Filtering ${name} by specificVersion ${input.specificVersion}`)
    return versions.filter((version) => {
      return version.names.some((name) => {
        return input.specificVersion && input.specificVersion===name
      })
    })
  } else
  if (input.semverPattern) {
    info(`Filtering ${name} by semverPattern ${input.semverPattern}`)
    return versions.filter((version) => {
      return version.names.some((name) => {
        const semver = semverCoerce(name)

        return semver && input.semverPattern && semverSatisfies(semver, input.semverPattern)
      })
    })
  } else if (input.versionPattern) {
    info(`Filtering ${name} by versionPattern ${input.versionPattern}`)
    return versions.filter((version) => {
      return version.names.some((name) => input.versionPattern?.test(name))
    })
  } else {
    info(`NO FILTERING ON ${name}!!!`)
    return versions
  }
}
