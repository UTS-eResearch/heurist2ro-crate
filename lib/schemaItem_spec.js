/* This is part of Calcyte a tool for implementing the DataCrate data packaging
spec.  Copyright (C) 2018  University of Technology Sydney

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


const assert = require('assert');
const chai = require('chai');
chai.use(require('chai-fs'));


const fs = require("fs-extra");
const xml2js = require("xml2js");

const ROCrate = require("ro-crate").ROCrate;

const SchemaItem = require('./schemaItem');



describe('Simple Schema Test', function () {
    it('Returns a schema item', async function () {
      const item = new SchemaItem();
      const term = await item.getConcept();
      assert.equal(term, null, "expecting nothing")
      const item2 = new SchemaItem("2-26", "Property")
      const term2 = await item2.getConcept();
      assert.equal(term2.name, "Country", "expecting concept to be Country")
      const item3 = new SchemaItem("2-10", "Class")
      const term3 = await item3.getConcept();
      assert.equal(term3.name, "Person", "expecting concept to be Person")
    });

});
