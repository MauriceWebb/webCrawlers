const fetch = require('node-fetch');
const cheerio = require('cheerio');

let aminoAcidsPage =
	'https://www.urmc.rochester.edu/encyclopedia/collection.aspx?subtopicid=3596';
let urls = [];
let aminoAcids = [];

// create a async function that accepts an url and builds an obj based on the scraped data...
const getUrls = async url => {
	// let urls = [];
	await fetch(url)
		.then(res => res.text())
		// .then( data => console.log( data ) )
		.then(html => {
			// enable cheerio's jQuery-like selector...
			const $ = cheerio.load(html);
			// target all aminoAcid section anchor tags...
			const aminoAcids = $('article ul li a');
			// go through the each anchor element and push it's href into urls array...
			aminoAcids.each((i, a) => {
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
const scrapeAminoAcids = (url, i) => {
	// send web scraper to the passd url...
	fetch(url)
		// grab the source code...
		.then(res => res.text())
		// .then( data => console.log( data ) )
		.then(html => {
			// enable cheerio's jQuery-like selector...
			const $ = cheerio.load(html);
			// target the section we need...
			const aminoAcid = $('.buct');
			const els = aminoAcid.children();
			// create an obj template...
			let aminoAcidObj = { name: null }; // null'd name will be changed...
			let ref = ''; // empty ref will be changed...
			// go through the each child element and build obj template...
			els.each((i, el) => {
				if ($(el)[0].name === 'h1') {
					// change aminoAcidObj.name to the current element's text...
					aminoAcidObj.name = $(el)
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
					// create a key in the aminoAcidObj with the text and set it's value to an empty array...
					aminoAcidObj[key] = [];
				} else if ($(el)[0].name === 'p') {
					let p = $(el)
						.text()
						.replace(/\s\s+/g, '');
					// push the p to the current ref'd key in the aminoAcidObj...
					aminoAcidObj[ref].push(p);
				}
			});
			// push constructed aminoAcidObj into the aminoAcids array...
			aminoAcids.push(aminoAcidObj);
			// console.log(aminoAcids);
		});
	if (i === urls.length - 1) {
		setTimeout(_ => {
			console.log(aminoAcids);
			console.log(`PRINTED ${i + 1} AMINO ACIDS`);
			console.log(`There are ${urls.length} Urls!`);
		}, i + 4000);
	}
};

const scrapePage = async url => {
	await getUrls(url);
	await urls.map((link, index) => scrapeAminoAcids(link, index));
	// await console.log(aminoAcids);
	// if (aminoAcids.length == urls.length) {
	// 	console.log(aminoAcids.length);
	// }
};

scrapePage(aminoAcidsPage);

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
                    aminoAcid[Object.keys(obj)[i]]
            ...
            */
