
sample:
	h2roc -c test_data/expert-nation.config.json -d https://expertnation2020.edu.au -o sample_crate EN_test_sefton.xml
	sample_html 

sample_html:
	rocstatic -c test_data/expertNation-html.config.json sample_crate/ 

all: real html
real: 
	h2roc -c test_data/expert-nation.config.json -d https://expertnation2020.edu.au ExpertNation.xml
	
html:
	rocstatic -c test_data/expertNation-html.config.json new_crate/ 

ocfl: 
	 node make-ocfl.js --repo expert-nation --name expert-nation  new_crate/
	