const fetch = require('node-fetch');
const cheerio = require('cheerio');

let vitaminsPage =
	'https://www.urmc.rochester.edu/encyclopedia/collection.aspx?subtopicid=3601';
let urls = [];
let vitamins = [];

const scrapeVitamin = (url, i) => {
	// send web scraper to the passd url...
	fetch(url)
		// grab the source code...
		.then(res => res.text())
		// .then( data => console.log( data ) )
		.then(html => {
			// enable cheerio's jQuery-like selector...
			const $ = cheerio.load(html);
			// target the section we need...
			const vitamin = $('.buct');
			const els = vitamin.children();
			// create an obj template...
			let vitaminObj = { name: null }; // null'd name will be changed...
			let ref = ''; // empty ref will be changed...
			// go through the each child element and build obj template...
			els.each((i, el) => {
				if ($(el)[0].name === 'h1') {
					// change vitaminObj.name to the current element's text...
					vitaminObj.name = $(el)
						.text()
						.replace(/\s\s+/g, '');
				} else if ($(el)[0].name === 'h2') {
					// get rid of special characters and replace spaces with underscores...
					let key = $(el)
						.text()
						.replace(/\s\s+/g, '')
						.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
						.replace(/\s/, '_');
					// set the current ref value to the current key...
					ref = key;
					// create a key in the vitaminObj with the text and set it's value to an empty array...
					vitaminObj[ref] = [];
				} else if ($(el)[0].name === 'p') {
					let p = $(el)
						.text()
						.replace(/\s\s+/g, '');
					if (ref === '') {
						ref = 'Other_names';
						vitaminObj[ref] = [];
						vitaminObj[ref].push(p);
					} else {
						vitaminObj[ref].push(p);
					}
					// push the p to the current ref'd key in the vitaminObj...
					// vitaminObj[ref].push(p);
				} else if ($(el)[0].name === 'ul') {
					if (vitaminObj.name.trim() === 'Vitamin B Complex') {
						let ul = $(el)
							.text()
							.replace(/[\n\r]/g, '')
							.trim()
							.replace(/\s+/g, '')
							.replace(/[)]/g, '),')
							.replace(/[(]/g, ' (')
							.replace(/Choline/, 'Choline,')
							.replace(/Inositol/, 'Inositol,')
							.replace(/,\s*$/, '')
							.split(',');
						// push the ul to the current ref'd key in the vitaminObj...
						vitaminObj[ref].push(ul);
						return;
					} else if (vitaminObj.name.trim() === 'Beta-Carotene') {
						let ul = $(el)
							.text()
							.replace(/[\n\r]/g, '')
							.trim()
							.replace(/\s/, '_')
							.trim()
							.replace(/\s+/g, ' ')
							.replace(/_/, ' ')
							.replace(/\s*$/, '')
							.trim()
							.replace(/\s\s/, ' ')
							.split(' ');
						// push the ul to the current ref'd key in the vitaminObj...
						vitaminObj[ref].push(ul);
						console.log(ul);
						return;
					} else if (vitaminObj.name.trim() === 'Choline') {
						let ul = $(el)
							.text()
							.replace(/[\n\r]/g, '')
							.trim()
							.replace(/\s/gi, '_')
							.replace(/__+/g, ',')
							.replace(/_/g, ' ')
							.split(',');
						// push the ul to the current ref'd key in the vitaminObj...
						vitaminObj[ref].push(ul);
						console.log(ul);
						return;
					} else if (vitaminObj.name.trim() === 'Vitamin A') {
						let text = $(el)
							.find($('li'))
							.text()
							.replace(/^ +/gm, '')
							.replace(/^[ \t]+/, '')
							.replace(/[ \t]+$/, '')
							.replace(/^\n+/gm, '')
							.trim()
							.replace(/\n/g, '_')
							.split('_');
						// push the ul to the current ref'd key in the vitaminObj...
						vitaminObj[ref].push(text);
						// console.log(text);
						return;
                    } 
				}
			});
			// push constructed vitaminObj into the vitamins array...
			// vitamins.push(vitaminObj);
            // console.log(vitamins);
            console.dir( JSON.parse( JSON.stringify( vitaminObj ) ) );
		});
};

const testVitamin =
	'https://www.urmc.rochester.edu/encyclopedia/content.aspx?contenttypeid=19&contentid=VitaminA';
scrapeVitamin(testVitamin);
