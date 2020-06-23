const fs = require("fs-extra");
const ROCrate = require("ro-crate").ROCrate;
const path = require("path");
const Config = require("./config");
const Record = require("./record")
// TODO - add parameters - make this generic

class H2rocConverter {
    constructor(opts) {
      this.opts = opts;
      this.promises = [];
      this.config  = new Config(opts.configPath);

      this.crate = new ROCrate(this.opts.crateTemplate);
      this.crate.index();
      this.rootDataset = this.crate.getRootDataset();
      this.rootDataset.hasMember = [];
      this.addCollections();
    }
    // Getter
    addCollections() {
        this.collections = {}; //Keep track of collections so we can add to them

        for (const collection of this.config.collectionTypes) {
            const collectionItem = {
                "@id": `#${collection}`,
                "name": `Collection: ${collection}`,
                "hasMember": []
            }

            this.collections[collection] = collectionItem;
            this.rootDataset.hasMember.push({"@id": collectionItem["@id"]});
            this.crate.addItem(collectionItem);
        }   
    }
    convert() {

        this.crate.utils.asArray(this.rootDataset["@type"]).push("RepositoryCollection");     
        // DEBUG - TODO - remove
        fs.writeFileSync("data.json", JSON.stringify(this.opts.hxml, null, 2));
        for (let rec of this.opts.hxml.hml.records[0].record) {
            const record = new Record(rec, this);
            this.crate.addItem(record.toItem());
        }
        return Promise.all(this.promises)
    }
     
   

    async copy (id){
        try {
            this.promises.push(fs.copyFile(path.join(this.opts.filesDir, id), path.join(this.opts.destDir, id)).then(()=>{
                console.log("Copied", id);
            }));
        } catch(err) {
            console.log(err);
        }
    }
    getId(id) {
        return `#${this.opts.domain}_${id}`;
    }
  }
  

module.exports = H2rocConverter;