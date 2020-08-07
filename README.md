# heurist2ro-crate
Heurist XML export format to RO-Crate converter

## Install 

Type:
```
npm install .
npm link # so you can use h2ro anywhere
```

## Run it


Type:
```
node h2roc test_data/EN_test_sefton.xml
```

This will create a new crate in `new-crate` built from the test data using default data for the flags below.

To see the HTML view of the crate:

```
open new_crate/ro-crate-preview.html
```

To get help:

```
>node h2roc -h
Usage: h2roc [options] <i>

Converts an Heurist XML file to an RO Crate and copies data from the --files directory specified

Options:
  -V, --version                        output the version number
  -c, --config [config]                Configuration file (default: "test_data/expert-nation.config.json")
  -d, --domain [domain]                A prefix for the dataset IDs (default: "test")
  -o, --out [out]                      Output directory in which to write the new ro-crate (default: "new_crate")
  -b, --baseCrate [RO-Crate template]  Basic RO-Crate metadata file into which data should be added (default: "test_data/template-ro-crate-metadata.json")
  -f, --files [files]                  Data directory from which to copy files 
  -h, --help                           output usage information
```



