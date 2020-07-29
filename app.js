const puppeteer = require('puppeteer');

const instagramSearchParams = {
    // url of the post you want to analyse
    instagramURL: 'https://www.instagram.com/p/CDHEzLFhYwG/',
    // property to store the load button selector, inside an elements with this class
    // if this stops working, you can find the correct class selector by inspect the button with the developer tools of your favorite browser
    instagramLoadMoreSelector: '.dCJp8',
    // property to find all links inside a span, inside an element with this class (this span is the content of the comment)
    // if this stops working, you can find the correct class selector by inspect the button with the developer tools of your favorite browser
    instagramCommentSelector: '.C4VMK span a'
};

async function countComments(instagramSearchParams){

    const { instagramURL, instagramLoadMoreSelector, instagramCommentSelector } = instagramSearchParams;

    async function loadMore(page, selector){
        const moreButton = await page.$(selector);
        if (moreButton){ 
            console.log('More');
            await moreButton.click();
            await page.waitFor(selector, {timeout: 3000}).catch( () => { console.log("Done!") });
            await loadMore(page, selector);
        }
    }

    async function getComments(page, selector){
        const comments = await page.$$eval(selector, links => {
            return links.map( link => link.innerText )
        });
        return comments
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(instagramURL);
    await loadMore(page, instagramLoadMoreSelector);
    const mentions = await getComments(page, instagramCommentSelector);
    const counted = count(mentions);
    const sorted = sort(counted);
    sorted.forEach( mention => console.log(mention) )
    
    await browser.close()
};

function count(mentions){
    const countMentions = {};
    mentions.forEach( mention => {
        countMentions[mention] = ( countMentions[mention] || 0 ) + 1;
    } );
    return countMentions
}

function sort(mentionsToSort) {
    const mentions = Object.entries(mentionsToSort);
    const orderedMentions = mentions.sort( (a, b) => { return b[1] - a[1] });
    return orderedMentions;
};

countComments(instagramSearchParams);