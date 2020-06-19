

class Config {
    constructor(config) {
        this.typeLookup = config.typeLookup
        this.collectionTypes = config.collectionTypes
        //   "followReverseProperty":  {}
            
        this.templates = {
            "Person": null
        } //TODO

    }

    hasOwnPage(item) {
        if (!Array.isArray(item["@type"])) {
            item["@type"] = [ item["@type"]];
        }
        return  this.collectionTypes.filter(value => item["@type"].includes(value)).length > 0
    }
}

module.exports =  Config;