let app = new Vue({
    el     : '#app',
    data   : {
      settings    : {
        url             : 'https://www.datavetenskap.nu/feeds/all.atom.xml',
        stage_interval  : 900,
        slide_interval  : 60,
        slide_width     : 50,
        fetch_interval  : 1800,
        amount_entries  : 0,
        slides_css_width: 0,
        slide_css_width : 0,
        images_css_width: 0,
        image_css_width : 0
      },
      time        : '',
      id          : -1,
      active      : false,
      stage       : 0,
      slides_width: 0,
      slide_width : 0,
      images_width: 0,
      image_width : 0,
      entries     : [],
      images      :
        [
            'https://foo.kodstugan.io/images/footv.jpg',
            'https://foo.kodstugan.io/images/infodv.jpg',
            'https://foo.kodstugan.io/images/hostmote.jpg',
            'https://foo.kodstugan.io/images/styrelsepub.jpg'
        ]
    },
    mounted: function ()
    {
      const self = this;
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
          self.entries = [];

          // Get today's date and set expiration constant
          const TWO_WEEKS = (14 * 24 * 60 * 60 * 1000);
          const today = new Date();

          // Populate the array with latest entries.
          for (let i = 0; i < entries.length; i++)
          {
            let title = entries[i].getElementsByTagName('title')[0].innerHTML;
            let content = entries[i].getElementsByTagName('content')[0].innerHTML;
            let published = entries[i].getElementsByTagName('published')[0].innerHTML;
            let updated = entries[i].getElementsByTagName('updated')[0].innerHTML;

            // XML feed content is using &lt, &gt, &amp instead of correct HTML tags.
            title = self.convertToHTML(title);
            content = self.convertToHTML(content);

            // Convert to correct date format.
            published = new Date(published).toLocaleDateString('sv-SE').toString();
            updated = new Date(published).toLocaleDateString('sv-SE').toString();

            const entry = {
              title    : title,
              published: published,
              updated  : updated,
              content  : content
            };

            // Don't publish entries that are older than two weeks.
            if (new Date(published).getTime() + TWO_WEEKS >= today.getTime())
            {
              self.entries.push(entry);
              self.settings.amount_entries += 1;
            }
          }

          self.updateLayout();

          if (self.active)
          {
            return;
          }

          const bar = document.getElementsByClassName('bar')[0];

          self.startSlide();
          self.startLoad(bar);

          setInterval(function ()
          {
            request.open('GET', self.settings.url);
            request.send();
          }, self.settings.fetch_interval * 1000);

          setInterval(function ()
          {
            const bar = document.getElementsByClassName('bar')[0];

            let element = self.stage === 0 ? 'slides' : 'images';
            let wrapper = document.getElementById(element);
            let stage = self.stage === 0 ? 1 : 0;

            self.showOverlay();

            setTimeout(function ()
            {
              app.stage = stage;
              clearInterval(self.id);
            }, 500);

            setTimeout(function ()
            {
              wrapper.style.transform = 'translate3D(0, 0, 0)';
            }, 600);

            setTimeout(function ()
            {
              self.hideOverlay();
              self.startSlide();
              self.startLoad(bar);
            }, 1100);
          }, self.settings.stage_interval * 1000);


          self.active = true;
        }
      };

      request.open('GET', this.settings.url);
      request.send();

      this.updateClock();

      setInterval(function ()
      {
        self.updateClock();
      }, 60 * 1000);
    }
    ,
    methods: {
      updateLayout : function ()
      {
        this.settings.slides_css_width = (this.settings.amount_entries > 0) ? this.settings.amount_entries *
          this.settings.slide_width : 100;
        this.settings.slide_css_width = (this.settings.amount_entries > 0) ? ((this.settings.slides_css_width /
          this.settings.amount_entries) /
          this.settings.slides_css_width) * 100 : 100;

        this.slides_width = this.settings.slides_css_width + '%';
        this.slide_width = this.settings.slide_css_width + '%';

        this.settings.images_css_width = this.images.length * 100;
        this.settings.image_css_width = ((this.settings.images_css_width / this.images.length) /
          this.settings.images_css_width) * 100;

        this.images_width = this.settings.images_css_width + '%';
        this.image_width = this.settings.image_css_width + '%';
      },
      updateClock  : function ()
      {
        let current = new Date();
        let minutes = current.getMinutes();
        let hours = current.getHours();

        minutes = (minutes < 10) ? '0' + minutes : minutes;
        hours = (hours < 10) ? '0' + hours : hours;

        this.time = (hours + ':' + minutes);
      },
      convertToHTML: function (message)
      {
        return message
          .replace(/&apos;/g, '\'')
          .replace(/&quot;/g, '"')
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&amp;/g, '&');
      },
      startLoad    : function (element)
      {
        const self = this;

        setTimeout(function ()
        {
          element.style.transition = 'none';
          element.style.width = '0%';

          setTimeout(function ()
          {
            element.style.transition = 'width ' + self.settings.slide_interval + 's linear';
            element.style.width = '100%';
          }, 50);
        }, 50);
      },
      showOverlay  : function ()
      {
        const overlay = document.getElementsByClassName('overlay')[0];
        overlay.style.opacity = 1;
      },
      hideOverlay  : function ()
      {
        const overlay = document.getElementsByClassName('overlay')[0];
        overlay.style.opacity = 0;
      },
      startSlide   : function ()
      {
        const self = this;
        const bar = document.getElementsByClassName('bar')[0];

        let i = 0;

        this.id = setInterval(function ()
        {
          let element = self.stage === 0 ? 'slides' : 'images';
          let increment = self.stage === 0 ? self.settings.slide_css_width : self.settings.image_css_width;

          let wrapper = document.getElementById(element);
          self.startLoad(bar);

          if (i + increment >= 100 - (increment / 2))
          {
            i = 0;
          }
          else
          {
            i += increment;
          }

          wrapper.style.transform = 'translate3D(-' + i + '%, 0, 0)';
        }, self.settings.slide_interval * 1000);
      }
    }
  })
;

