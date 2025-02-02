import { group, info, warning } from "@actions/core"
import { processPackages } from "./process/process"
import { DeleteStrategy, Input, QueryStrategy } from "./types"

export async function executeAction(input: Input, queryStrategy: QueryStrategy, deleteStrategy: DeleteStrategy) {
  if (input.dryRun) {
    warning("Dry run is set")
    warning("No package versions will be actually deleted")
  }

  info("Fetching packages")

  const packages = await queryStrategy.queryPackages(input)

  await group(`Found ${packages.length} package(s) before filtering`, async () => {
    packages.forEach((it) => {
      info(`${it.name} with ${it.versions.length} version(s)`)
    })

    return Promise.resolve()
  })

  const processedPackages = processPackages(input, packages)

  if (processedPackages.length <= 0) {
    info("No versions to delete")

    return
  }

  await group(`Found ${processedPackages.length} package(s) after filtering`, async () => {
    processedPackages.forEach((it) => {
      info(`${it.name} with ${it.versions.length} version(s): ${JSON.stringify(it.versions)}`)
    })

    return Promise.resolve()
  })

  await group("Deleting packages", async () => {
    await Promise.all(
      processedPackages
        .flatMap((pkg) => pkg.versions.map((version) => ({ name: pkg.name, version })))
        .map(async ({ name, version }) => {
          info(`Deleting version ${version.names.join(", ")} of package ${name}`)

          if (!input.dryRun) {
            await deleteStrategy.deletePackageVersion(input, name, version.id)
          }
        })
    )
  })

  info(`${processedPackages.flatMap((pkg) => pkg.versions).length} package versions(s) deleted`)
}
