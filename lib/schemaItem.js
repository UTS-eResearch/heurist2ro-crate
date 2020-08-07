const axios = require('axios');
const xml2js = require("xml2js");
const ROCrate = require("ro-crate").ROCrate;
 
function  getLabel(name, type) {
  var label;
  if (type === "Class") {
    label = name.replace(/^./, name[0].toUpperCase()); 
  } else {
    label = name.replace(/^./, name[0].toLowerCase()); 
  }
  label = label.replace(/ (\w)/g, function(match, p1){return p1.toUpperCase()});
  label = label.replace(/\W+/g, "_");
  return label;
}

class SchemaItem {
    constructor(opts) {
      const {conceptID, type, config, name, crate, extraContext} = opts;
      this.crate = crate;
      this.name = name;
      this.conceptID = conceptID;
      this.type = type;
      this.extraContext = extraContext || {};
      this.typeTable = {};
      this.id = `${config.namespace}${type}/${conceptID}`
    }

   
    
    async getConcept(){
        var queryType = null;
        var elementType = null;
        var descriptionElement = null;
        var rdfType = null;
        if (this.type === "Class"){
          queryType = "rty";
          elementType = "RecordTypes";
          descriptionElement = "rty_Description";
          rdfType = "rdfs:Class";

        } else if (this.type === "Property") {
          queryType = "dty";
          elementType = "DetailTypes";
          descriptionElement = "dty_Documentation";
          rdfType = "rdf:Property";
        } else {
          return null;
        }
       
        if (this.crate) {
          const existing = this.crate.getItem(this.id);
          if (existing) {
            return existing;
          }
        }
        const url = `https://heuristplus.sydney.edu.au/heurist/admin/describe/getDBStructureAsXML.php?db=ExpertNation&${queryType}=${this.conceptID}`;
        var name, description, label;
        const response = await axios.get(url);
        //console.log(response);
        const itemXml = await xml2js.parseStringPromise(response.data);
        //console.log(response.data);
        const detail = itemXml.hml_structure[elementType][0][queryType][0];
        name = detail[`${queryType}_Name`][0];
        description = detail[descriptionElement][0];
        label = getLabel(name, this.type)
        this.extraContext[label] = this.id;
        const newItem = {
            "@id" : this.id,
            "@type" : rdfType,
            "name" : name,
            "rdfs:comment" : description,
            "rdfs:label": label
        }
        // TODO: Add to context?
        if (this.crate) {
          this.crate.addItem(newItem);
        }
        return newItem;
       }
    }
module.exports = {SchemaItem: SchemaItem, getLabel: getLabel};
