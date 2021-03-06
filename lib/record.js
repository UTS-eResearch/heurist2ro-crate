
const SchemaItem = require('./schemaItem').SchemaItem;
const getLabel = require('./schemaItem').getLabel;
const { Dir } = require('fs');
const pairtree = require("pairtree");

class Record {
    constructor(record, converter) {
        // record: an xml2JSON object - pre-parsed
        // converter: an h2roc object 
        this.record = record;
        this.converter = converter;
        this.config = converter.config;
        this.crate = converter.crate;
        this.extraContext = converter.extraContext;
    }

    async getType(type, conceptID) {

        if (this.converter.config.typeLookup[type]) {
            // Using  standard schema.org type
            type = this.converter.config.typeLookup[type];
        } 
        else {
            const schitem = new SchemaItem({
                conceptID: conceptID, 
                type: "Class", 
                config: this.config, 
                originalName: type, 
                crate: this.crate,
                extraContext: this.extraContext
            });
           const propertyDefinition = await schitem.getConcept();
           type = propertyDefinition["rdfs:label"];
            
        }
        return type
    }

    async toItem() {
        //<type id="55" conceptID="1125-26">Educational institution</type>

        const type = await this.getType(this.record.type[0]["_"], this.record.type[0]["$"].conceptID);

        
        const item = {
            "@id": this.converter.getId(this.record.id[0]),
            "name": this.record.title[0],
            "@type": type
        };

        if (this.record.raw && this.record.year) {
            item["startDate"] = this.record.raw[0];
            if (this.record.raw[1]) {
                item["endDate"] = this.record.raw[1];
          
            }
        }
        /*
        Geographical info - TODO: handle more than jsut points
        <geo>
            <type>point</type>
            <wkt>POINT(144.759351 -37.016167)</wkt>
            </geo>

        */
        
       

        //<detail conceptID="1125-150" name="Occupation title" id="1028" basename="Occupation type" termID="7405" termConceptID="1125-5062" ParentTerm="Occupation">Headmaster</detail>

        for (let detail of this.record.detail) {
            const prop = detail["$"].name;
            const conceptID = detail["$"].conceptID;
            if (prop) {
                //const legalProp = prop.replace(/\W/g, "_");
                //console.log(detail["$"]);
                const schitem = new SchemaItem({
                                                            conceptID: conceptID, 
                                                            type: "Property", 
                                                            config: this.config, 
                                                            originalName: prop, 
                                                            crate: this.crate,
                                                            extraContext: this.extraContext
                                                        });
                const propertyDefinition = await schitem.getConcept();
                const propID = propertyDefinition["rdfs:label"];
                if (detail.geo) {
                    for (let p of detail.geo) {
                        if (p.type[0] === "point") {
                            const pointID = this.converter.getId(p.wkt[0]);
                            const coords = p.wkt[0].replace(/POINT\(/, "").replace(")", "").split(/\s+/);
                            if (!this.converter.crate.getItem(pointID)) {
                                const newGeo = {
                                    "@id": pointID,
                                    "@type": "GeoLocation",
                                    "name":  pointID,
                                    "latitude": coords[1],
                                    "longitude": coords[0]
                                }
                                this.crate.addItem(newGeo);                              
                        }
                        item.geo = {"@id": pointID};
                     }
                    }
                }
                if (detail["$"].isRecordPointer === "true") {
                    item[propID] = { "@id": this.converter.getId(detail["_"]) };
                } else if (detail["$"].termID && detail["$"].ParentTerm) {
                    const termID = this.converter.getId(detail["$"].termID);
                    const termType = getLabel(detail["$"].ParentTerm, "Class");
                    
                    //const termID = `#${detail["$"].termID}_${termType}`;
                    if (!this.converter.crate.getItem(termID)) {
                        const newTerm = {
                            "@id": termID,
                            "@type": termType,
                            "name":  detail["_"]
                        }
                        this.converter.crate.addItem(newTerm);
                        if (this.converter.config.collectionTypes.includes(termType)) {
                            this.converter.collections[termType].hasMember.push({ "@id": termID });
                        }
                    }
                    item[propID] = { "@id": termID};
                     
                }
                else if (detail.file) {
                    const file = {
                        "@type": "File",
                        "name": detail.file[0].origName[0],
                        "encodingFormat": detail.file[0].mimeType,
                        "fileSize": ``, //${detail.file[0].fileSize[0]["_"]}${detail.file[0].fileSize[0]["$"].units}
                    };
                    if (detail.file[0].origName[0] === "_remote") {
                        file["@id"] = detail.file[0].url[0];
                    } else {
                        file["@id"] = `${pairtree.path(detail.file[0].id[0]).replace(/^\//, "")}${detail.file[0].origName[0]}`;
                        file.url = `https://heuristplus.sydney.edu.au/heurist/?db=ExpertNation&file=${detail.file[0].nonce[0]}`

                        // TODO - do we need to be smarter about file storage - this won't scale?
                        await this.converter.downloadFile(file); 
                    }
                   
                    this.converter.crate.addItem(file);
                    item["hasFile"] = { "@id": file["@id"] };
                    // https://heuristplus.sydney.edu.au/heurist/?db=ExpertNation

                }
                else {
                    item[propID] = detail["_"];
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