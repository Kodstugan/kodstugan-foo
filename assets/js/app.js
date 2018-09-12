const URL = 'https://www.datavetenskap.nu/feeds/all.atom.xml';
const STAGE_INTERVAL = 900; // seconds
const SLIDE_INTERVAL = 120;  // seconds
const SLIDE_WIDTH = 50;  // percentage
const FETCH_INTERVAL = 900; // seconds
const AMOUNT_ENTRIES = 10;

// Don't change these.
const SLIDES_CSS_WIDTH = AMOUNT_ENTRIES * SLIDE_WIDTH;
const SLIDE_CSS_WIDTH = ((SLIDES_CSS_WIDTH / AMOUNT_ENTRIES) / SLIDES_CSS_WIDTH) * 100;

let wrapper;
let images;

// Vue -------------------------------------------------------------------------

// Initialize a new Vue instance.
let app = new Vue({
  el  : '#app',
  data: {
    stage       : 0,
    slides_width: 0,
    slide_width : 0,
    images_width: 0,
    image_width : 0,
    entries     : [],
    images      : [
      'https://foo.kodstugan.io/images/1.jpg',
      'https://foo.kodstugan.io/images/2.jpg'
    ]
  }
});

// XML fetch -------------------------------------------------------------------

// Create a new XML request handler.
const request = new XMLHttpRequest();

request.onreadystatechange = function ()
{
  if (this.readyState === 4 && this.status === 200)
  {
    // Parse the response.
    const parser = new DOMParser();
    const xml = parser.parseFromString(this.responseText, 'text/xml');

    // Get all entries.
    const entries = xml.getElementsByTagName('entry');

    // Clear Vue data.
    app.entries = [];

    // Populate the array with AMOUNT_ENTRIES latest entries.
    for (i = 0; i < AMOUNT_ENTRIES; i++)
    {
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
        title    : title,
        published: published,
        updated  : updated,
        content  : content
      };

      app.entries.push(entry);
    }

    app.slides_width = SLIDES_CSS_WIDTH + '%';
    app.slide_width = SLIDE_CSS_WIDTH + '%';
    app.images_width = app.images.length * 100 + '%';
  }
};

// Initial fetch.
request.open('GET', URL);
request.send();

// Let's check for new entries in an interval.
setInterval(function ()
{
  request.open('GET', URL);
  request.send();
}, FETCH_INTERVAL * 1000);

function convertToHTML(message)
{
  return message
    .replace(/&apos;/g, '\'')
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

setInterval(function ()
{
  let wrapper_slide;
  let images_slide;

  if (app.stage === 1)
  {
    app.stage = 0;
  }
  else
  {
    app.stage = 1;

  }
}, STAGE_INTERVAL * 1000);

// Slide -----------------------------------------------------------------------

const bar = document.getElementsByClassName('bar')[0];
bar.style.animationDuration = SLIDE_INTERVAL + 's';

let i = 0;
let j = 0;

const IMAGES_CSS_WIDTH = app.images.length * 100;
const IMAGE_CSS_WIDTH = ((IMAGES_CSS_WIDTH / app.images.length) / IMAGES_CSS_WIDTH) * 100;

app.images_width = IMAGES_CSS_WIDTH + '%';
app.image_width = IMAGE_CSS_WIDTH + '%';

setInterval(function ()
{
  if (app.stage === 0)
  {
    wrapper = document.getElementsByClassName('slides')[0];

    if (i >= 100 - SLIDE_CSS_WIDTH)
    {
      i = 0;
    }
    else
    {
      i += SLIDE_CSS_WIDTH;
    }

    wrapper.style.transform = 'translate3D(-' + i + '%, 0, 0)';
  }
  else
  {
    images = document.getElementsByClassName('images')[0];

    if (j >= 100 - IMAGE_CSS_WIDTH)
    {
      j = 0;
    }
    else
    {
      j += IMAGE_CSS_WIDTH;
    }

    images.style.transform = 'translate3D(-' + j + '%, 0, 0)';
  }
}, SLIDE_INTERVAL * 1000);
