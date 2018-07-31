const URL = 'http://www.datavetenskap.nu/feeds/all.atom.xml'
const SLIDE_INTERVAL = 10;  // seconds
const SLIDE_WIDTH    = 50;  // percentage
const FETCH_INTERVAL = 900; // seconds
const AMOUNT_ENTRIES = 10;

// Don't change these.
const SLIDES_CSS_WIDTH = AMOUNT_ENTRIES * SLIDE_WIDTH;
const SLIDE_CSS_WIDTH  = ((SLIDES_CSS_WIDTH/AMOUNT_ENTRIES) / SLIDES_CSS_WIDTH) * 100;

// Vue -------------------------------------------------------------------------

// Initialize a new Vue instance.
var app = new Vue({
  el: '#app',
  data: {
    slides_width: 0,
    slide_width: 0,
    entries: []
  }
})

// XML fetch -------------------------------------------------------------------

// Create a new XML request handler.
const request = new XMLHttpRequest();

request.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    // Parse the response.
    const parser = new DOMParser();
    const xml = parser.parseFromString(this.responseText,"text/xml");

    // Get all entries.
    const entries = xml.getElementsByTagName('entry');

    // Clear Vue data.
    app.entries = []

    // Populate the array with the 10 latest entries.
    for(i = 0; i < AMOUNT_ENTRIES; i++){
      let title = entries[i].getElementsByTagName('title')[0].innerHTML;
      let content = entries[i].getElementsByTagName('content')[0].innerHTML;
      let published = entries[i].getElementsByTagName('published')[0].innerHTML;
      let updated = entries[i].getElementsByTagName('updated')[0].innerHTML;

      // XML feed content is using &lt, &gt, &amp instead of correct HTML tags.
      title = convertToHTML(title);
      content = convertToHTML(content);

      // Convert to correct date format.
      published = new Date(published).toLocaleDateString('sv-SE').toString();
      updated = new Date(published).toLocaleDateString('sv-SE').toString();

      const entry = {
        title: title,
        published: published,
        updated: updated,
        content: content
      }

      app.entries.push(entry);
    }

    app.slides_width = SLIDES_CSS_WIDTH + "%";
    app.slide_width = SLIDE_CSS_WIDTH + "%";
  }
};

// Initial fetch.
request.open('GET', URL);
request.send();

// Let's check for new entries in an interval.
setInterval(function(){
  request.open('GET', URL);
  request.send();
}, FETCH_INTERVAL * 1000);

function convertToHTML(message){
  return message
  .replace(/&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&gt;/g, '>')
  .replace(/&lt;/g, '<')
  .replace(/&amp;/g, '&');
}

// Slide -----------------------------------------------------------------------

const wrapper = document.getElementsByClassName('slides')[0];
const bar = document.getElementsByClassName('bar')[0];

let i = 0;
let j = 0;

setInterval(function(){
  wrapper.style.transform = "translateX(-" + i + "%)";

  if(i >= 100 - SLIDE_CSS_WIDTH){
    wrapper.style.transform = "translateX(0%)";
    i = 0;
  }else{
    i += SLIDE_CSS_WIDTH;
  }

}, SLIDE_INTERVAL * 1000);

bar.style.animationDuration = SLIDE_INTERVAL + "s";
