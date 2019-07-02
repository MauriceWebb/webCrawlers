const fetch = require('node-fetch');
const cheerio = require('cheerio');

let mineralsPage =
	'https://www.urmc.rochester.edu/encyclopedia/collection.aspx?subtopicid=3599';
let urls = [];
let minerals = [];

// create a async function that accepts an url and builds an obj based on the scraped data...
const getUrls = async url => {
	// let urls = [];
	await fetch(url)
		.then(res => res.text())
		// .then( data => console.log( data ) )
		.then(html => {
			// enable cheerio's jQuery-like selector...
			const $ = cheerio.load(html);
			// target all mineral section anchor tags...
			const minerals = $('article ul li a');
			// go through the each anchor element and push it's href into urls array...
			minerals.each((i, a) => {
				// let link = $(a).attr('href');
				let link = $(a)
					.text()
					.replace(/\s/, '_')
					.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
					.replace(/\s/, '');
				urls.push(
					String(
						`https://www.urmc.rochester.edu/encyclopedia/content.aspx?contenttypeid=19&contentid=${link}`
					)
				);
			});
		});
};

// create a function that accepts an url and builds an obj based on the scraped data...
const scrapeMineral = (url, i) => {
	// send web scraper to the passd url...
	fetch(url)
		// grab the source code...
		.then(res => res.text())
		// .then( data => console.log( data ) )
		.then(html => {
			// enable cheerio's jQuery-like selector...
			const $ = cheerio.load(html);
			// target the section we need...
			const mineral = $('.buct');
			const els = mineral.children();
			// create an obj template...
			let mineralObj = { name: null }; // null'd name will be changed...
			let ref = ''; // empty ref will be changed...
			// go through the each child element and build obj template...
			els.each((i, el) => {
				if ($(el)[0].name === 'h1') {
					// change mineralObj.name to the current element's text...
					mineralObj.name = $(el)
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
					// create a key in the mineralObj with the text and set it's value to an empty array...
					mineralObj[key] = [];
				} else if ($(el)[0].name === 'p') {
					let p = $(el)
						.text()
						.replace(/\s\s+/g, '');
					// push the p to the current ref'd key in the mineralObj...
					mineralObj[ref].push(p);
				}
			});
			// push constructed mineralObj into the minerals array...
			minerals.push(mineralObj);
			// console.log(minerals);
		});
	if (i === urls.length - 1) {
		setTimeout(_ => {
			console.log(minerals);
			console.log(`PRINTED ${i + 1} MINERALS`);
			console.log(`There are ${urls.length} Urls!`);
		}, i + 3000);
	}
};

const scrapePage = async url => {
	await getUrls(url);
	await urls.map((link, index) => scrapeMineral(link, index));
	// await console.log(minerals);
	// if (minerals.length == urls.length) {
	// 	console.log(minerals.length);
	// }
};

scrapePage(mineralsPage);

//=================================
/* ____NOTES____
            ...
            grab the element's next p element's text...
                console.log($(el).next('p').text());
                
                get the element...
                console.log($(el));

                get the element's tag name...
                console.log($(el)[0].name);
                
                get the element's text...
                console.log($(el)[0].children[0].data);
                console.log( $(el).text().replace(/\s\s+/g, '') ); // this is cleaner! The regEx gets rid of unnecessary white space

                get the next element's data... ( by adding: .next() )
                    tag name...
                    console.log( $(el).next()[0].name );

                    text...
                    console.log( $(el).next().text().replace(/\s\s+/g, '') );
                    
                    get an object's key by index...
                    mineral[Object.keys(obj)[i]]
            ...
            */
