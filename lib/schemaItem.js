const axios = require('axios');
const xml2js = require("xml2js");

class SchemaItem {
    constructor(conceptID, type) {
      console.log("constructor")
      this.conceptID = conceptID;
      this.type = type;
    }
    async getConcept(){
        console.log("Concept")
        var queryType = null;
        var elementType = null;
        var descriptionElement = null;
        if (this.type === "Class"){
          queryType = "rty";
          elementType = "RecordTypes";
          descriptionElement = "rty_Description";
        } else if (this.type === "Property") {
          queryType = "dty";
          elementType = "DetailTypes";
          descriptionElement = "dty_Documentation";
        } else {return null}
        const url = `https://heuristplus.sydney.edu.au/heurist/admin/describe/getDBStructureAsXML.php?db=ExpertNation&${queryType}=${this.conceptID}`;
        console.log(url)
        const response = await axios.get(url);


          const itemXml = await xml2js.parseStringPromise(response.data);
          //console.log(response.data);
          const detail = itemXml.hml_structure[elementType][0][queryType][0];
          const newItem = {
              "@id" : "#" + detail[`${queryType}_ID`][0],
              "@type" : this.type,
              "name" : detail[`${queryType}_Name`][0],
              "description" : detail[descriptionElement][0]

          }
          return newItem
           }
    }
module.exports = SchemaItem;
