

class Record {
    constructor(record, converter) {
        // record: an xml2JSON object - pre-parsed
        // converter: an h2roc object 
        this.record = record;
        this.converter = converter;
    }
    toItem() {
        var type = this.record.type[0]["_"];
        if (this.converter.config.typeLookup[type]) {
            type = this.converter.config.typeLookup[type];
        }
        else {
            type = type.replace(/ /g, "_");
        }
        const item = {
            "@id": this.converter.getId(this.record.id[0]),
            "name": this.record.title[0],
            "@type": type
        };
        for (let detail of this.record.detail) {
            const prop = detail["$"].name;
            if (prop) {
                const legalProp = prop.replace(/\W/g, "_");
                if (detail["$"].isRecordPointer === "true") {
                    item[legalProp] = { "@id": this.converter.getId(detail["_"]) };
                }
                else if (detail.file) {
                    var id;
                    if (detail.file[0].origName[0] === "_remote") {
                        id = detail.file[0].url[0];
                    }
                    else {
                        id = `ulf_${detail.file[0].id[0]}_${detail.file[0].origName[0]}`;
                        // TODO - do we need to be smarter about file storage - this won't scale?
                        this.converter.copy(id);
                    }
                    const file = {
                        "@id": id,
                        "@type": "File",
                        "encodingFormat": detail.file[0].mimeType,
                        "fileSize": `` //${detail.file[0].fileSize[0]["_"]}${detail.file[0].fileSize[0]["$"].units}
                    };
                    this.converter.crate.addItem(file);
                    item["hasFile"] = { "@id": id };
                }
                else {
                    item[legalProp] = detail["_"];
                }
            }
        }
        if (this.converter.config.collectionTypes.includes(type)) {
            this.converter.collections[type].hasMember.push({ "@id": item["@id"] });
        }
        this.converter.item = item;
        return item;
    }

}
module.exports = Record;