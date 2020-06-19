const fs = require("fs-extra");
const ROCrate = require("ro-crate").ROCrate;
const path = require("path");
const Config = require("./config");
// TODO - add parameters - make this generic

class H2rocConverter {
    constructor(opts) {
      this.opts = opts;
      this.promises = [];
      this.config  = new Config(opts.configPath);
    }
    // Getter
    convert() {

        this.crate = new ROCrate(this.opts.crateTemplate);
        this.crate.index();
        const rootDataset = this.crate.getRootDataset();
        this.crate.utils.asArray(rootDataset["@type"]).push("RepositoryCollection");
        rootDataset.hasMember = [];
        const collections = {}; //Keep track of collections so we can add to them
        for (const collection of this.config.collectionTypes) {

            const collectionItem = {
                "@id": `#${collection}`,
                "name": `Collection: ${collection}`,
                "hasMember": []
            }
            collections[collection] = collectionItem;
            rootDataset.hasMember.push({"@id": collectionItem["@id"]});
            this.crate.addItem(collectionItem);
        }   
        
        // DEBUG - TODO - remove
        fs.writeFileSync("data.json", JSON.stringify(this.opts.hxml, null, 2));

        for (let record of this.opts.hxml.hml.records[0].record) {
            var type = record.type[0]["_"];
            if (this.config.typeLookup[type]){
                type = this.config.typeLookup[type];
            } else {
                type = type.replace(/ /g, "_");
            }
            const item = {
                "@id": this.getId(record.id[0]),
                "name": record.title[0],
                "@type": type
            }
            
            for (let detail of record.detail) {
                const prop = detail["$"].name;
                if (prop) {
                    const legalProp = prop.replace(/\W/g, "_");
                    if (detail["$"].isRecordPointer==="true") {
                        item[legalProp] = {"@id": this.getId(detail["_"])}
                    } else if (detail.file) {
                        var id;
                        if (detail.file[0].origName[0] === "_remote") {
                            id = detail.file[0].url[0];
                        } else {
                            id = `ulf_${detail.file[0].id[0]}_${detail.file[0].origName[0]}`; 
                            // TODO - do we need to be smarter about file storage - this won't scale?
                                this.copy(id);
                            
                        }
                        const file = {
                            "@id": id,
                            "@type": "File",
                            "encodingFormat": detail.file[0].mimeType,
                            "fileSize": `` //${detail.file[0].fileSize[0]["_"]}${detail.file[0].fileSize[0]["$"].units}
                        }
                        this.crate.addItem(file);
                        item["hasFile"] = {"@id": id};
                    } else {
                        item[legalProp] = detail["_"];
                    }
            }
            }
            if (this.config.collectionTypes.includes(type)) {
                collections[type].hasMember.push({"@id": item["@id"]});
            }
            this.crate.addItem(item);
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