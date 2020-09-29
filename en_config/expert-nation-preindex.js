const ROCrate = require("ro-crate").ROCrate;
const program = require("commander");
const { readFile, writeFileSync } = require("fs-extra");
const path = require("path");

//
var dir;
program
  .version("0.1.0")
  .description(
    "Pre-processes an ExpertNation RO-Crate to extract facet info"
  )
  .arguments("<i>")
  .action((i) => {dir = i})
program.parse(process.argv);


async function addFacets(crate) {

    crate.index();
    for (let item of crate.getGraph()) {
        if (item["@type"] === "MilitaryService") {
            let placesMatch = item.name.match(/.*\[\s*(.*?)\s*\].*/);
            if (placesMatch) {
                item._militaryServicePlace = placesMatch[1].split(/, */);
            }
        }
    }
    return crate;

}

//dir = program.dir ;

async function main() {
    const crate = new ROCrate(JSON.parse(await readFile(path.join(dir, "ro-crate-metadata.json"))));
    const outputCrate = await addFacets(crate);
    writeFileSync(path.join(dir, "ro-crate-metadata.json"), JSON.stringify(outputCrate, null, 2));
}
main();
