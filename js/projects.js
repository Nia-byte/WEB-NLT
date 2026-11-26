/* ── PROJECT DATA for the case-study page (pages/case.html?p=<slug>, rendered by js/case.js) ──
   Fields left as '' are hidden on the page until you fill them in:
     tagline   one-line subtitle under the project name
     liveUrl   adds "Visit live site ↗" and a live, scrollable preview inside the blue section
     sector, focus, year   extra rows in the project meta list
   headline / summary are the project statement; summary is one paragraph or a list of them (the first is the meta description).
   Image numbers refer to /assets/work/<slug>-<n>.jpg (0–5). hero = [side, video poster, side], frame = mobile-screens frame,
   pairs = the two image pairs. palette = [name, hex] swatches shown beside the Visual language copy.
   Optional extras (sections stay hidden when left out):
     client     full company name for the meta list (defaults to name)
     scope      meta "Scope" text (defaults to services)
     heroImage  true: the intro box shows /assets/work/<slug>-hero.jpg (+ -sm) instead of the phones and video;
                or an image path (e.g. '/marathon-m/marathon-mobile-mockup.jpg') to show that single file instead
     partners   { title, intro, names, outro } client/partner name list
     journey    { title, text, steps } site navigation row
     points     replaces the studio key points under "What makes it work."
     mark       { title, text, label, caption } logo / identity block
     closer     { title, intro, cta, text, signoff } how the client's site closes
     design     image path shown full width in the Design block
     visual     { title, text } Visual language copy, shown beside the palette swatches */
window.NLT = {
    studio: {
        email: 'info@nialuretech.co.za',
        location: '',                       // e.g. 'Johannesburg, South Africa' — shown in the footer row
        timeZone: 'Africa/Johannesburg',    // live clock in the footer (same zone as the work2 studio clock)
        clockLabel: 'Johannesburg',
        // Key points: the home page differentiators
        points: [
            { title: 'Built With Purpose', text: 'Every decision we make is intentional.' },
            { title: 'Motion That Captivates', text: "First impressions are felt before they're understood." },
            { title: 'Designed to Scale', text: "We don't hand you a pretty template and disappear." },
        ],
        // Process podiums: steps 02–04 of the 4-step project launch process
        steps: ['Design & Build', 'Refine', 'Launch & Support'],
        story: {
            first: ['Build with', 'purpose.'],
            second: ['Designed with', 'allure.'],
            text: 'We transform visionary ideas into digital realities that captivate audiences and drive meaningful results.',
        },
    },
    projects: [
        {
            slug: 'marathon-m', name: 'Marathon M', video: '/assets/videos/MARATHON-M.mp4',
            services: ['Corporate website', 'Brand presentation', 'Digital enquiry experience'],
            tagline: 'Big ideas. Strong partnerships. A place to begin.', liveUrl: 'https://www.marathonm.co.za/', year: '',
            client: 'Marathon M (Pty) Ltd',
            sector: 'Creative production · Project-based services',
            scope: 'Corporate website · Brand presentation · Digital enquiry experience',
            focus: 'Building credibility and turning new opportunities into meaningful conversations.',
            headline: 'A digital presence built around people, partnerships and possibility.',
            summary: [
                "Marathon M's website introduces the company through a clean, visual-first experience. ",
                "Designed to take visitors from an initial introduction to a meaningful conversation, the website brings together the company's identity, its professional network and a straightforward way to enquire about future projects.",
            ],
            heroImage: '/marathon-m/marathon-mobile-mockup.jpg',
            design: '/marathon-m/marathon-tablet-mockup-wide.jpg',
            partners: {
                title: "A network of recognised names.",
                intro: "The website's People We've Worked With section showcases a diverse collection of established brands and organisations, including:",
                names: ['Mercedes-Benz', 'Takealot', 'Standard Bank', 'FirstRand', 'United Nations', 'UNESCO', 'Brand South Africa', 'Red Bull', 'Miss South Africa', 'Miss Universe', 'AFHCO', 'Naspers', 'National Youth Development Agency'],
                outro: 'A collection that spans business, finance, culture, media and international organisations.',
            },
            journey: {
                title: 'A straightforward journey.',
                text: 'A simple navigation structure gives visitors a direct route to discovering the company, learning more about its background and getting in touch.',
                steps: ['Home', 'About', 'Services', 'Contact'],
            },
            points: [
                { title: 'People build credibility', text: 'The About page places people and professional relationships at the heart of the presentation. Its collection of recognised brand identities helps establish a sense of reach and experience.' },
                { title: 'A clear starting point', text: 'Four main navigation links keep the experience easy to follow. Visitors can move from the introduction to the company\'s background and contact information without unnecessary complexity.' },
                { title: 'Enquiries with purpose', text: 'The contact form asks for more than basic contact details. Project timelines, event dates, venues, budgets and personal vision help create a more informed starting point for a potential collaboration.' },
            ],
            mark: {
                title: 'More than a name. A recognisable identity.',
                text: 'The Marathon M logo features a distinctive geometric M enclosed within a simple frame. Its strong, minimal construction gives the company a recognisable visual signature.',
                label: 'The Marathon M mark',
                caption: 'A bold letterform. A clean structure. An identity that is easy to recognise.',
            },
            closer: {
                title: "Let's talk about your next chapter.",
                intro: 'The website closes its journey with an invitation:',
                cta: 'WORK WITH US.',
                text: [
                    'A direct call to action encourages visitors to bring their next idea, event or project to the table.',
                    "Rather than ending with a static company introduction, Marathon M makes the next step clear: start a conversation, share the vision and explore what's possible.",
                ],
                signoff: "Let's Create.",
            },
            visual: {
                title: 'Minimal structure. A strong identity. People at the centre.',
                text: [
                    'The website combines a distinctive geometric logo with people-focused photography and a portfolio of recognised brand identities.',
                    'The result is a visual presentation that balances a professional corporate presence with a more human introduction to the company.',
                ],
                tags: ['Geometric identity', 'People-led imagery', 'Recognisable brand identities'],
            },
            hero: [1, 0, 4], stage: [2, 3, 5], frame: [3, 0, 4], pairs: [[3, 2], [5, 1]],
            palette: [['Umber', '#483018'], ['Silver', '#D8D8D8'], ['Ink', '#181818']],
        },
        {
            slug: 'velvet-edge', name: 'Velvet & Edge Solutions', video: '/assets/videos/VELVET & EDGE.mp4',
            services: ['Empower', 'Transform', 'Succeed'],
            tagline: '', liveUrl: 'https://www.velvetandedge.co.za/', sector: '', focus: '', year: '',
            headline: 'A fast, responsive build shaped around the brand.',
            summary: 'We partnered with Velvet & Edge Solutions to design and develop their website: a fast, responsive build shaped around the brand and made to turn visitors into customers.',
            heroImage: '/velvet&edge/velvet-edge-mobile-mockup.jpg',
            design: '/velvet&edge/velvet-edge-tablet-mockup.jpg',
            journey: {
                title: 'A short, focused path.',
                text: "Three pages take visitors from the introduction to the company's story and a direct way to get in touch.",
                steps: ['Home', 'About', 'Contact'],
            },
            visual: {
                title: 'Confident pink. Refined serif.',
                text: 'A vivid pink accent, soft off-white and deep charcoal give the brand a polished stage. Elegant serif headlines add warmth and authority.',
            },
            hero: [1, 0, 2], stage: [3, 4, 5], frame: [1, 3, 2], pairs: [[1, 4], [2, 5]],
            palette: [['Pink', '#D84890'], ['Off-white', '#F0F0F0'], ['Charcoal', '#303030']],
        },
    ],
    // Not shown on the site yet. Move an entry into `projects` above (and add it to index.html / pages/work.html) to publish it.
    drafts: [
        {
            slug: 'geffphotography', name: 'GeffPhotography', video: '/assets/videos/GEFFPHOTOGRAPHY.mp4',
            services: ['Website design', 'Development'],
            tagline: '', liveUrl: '', sector: '', focus: '', year: '',
            headline: 'A fast, responsive build shaped around the brand.',
            summary: 'We partnered with GeffPhotography to design and develop their website: a fast, responsive build shaped around the brand and made to turn visitors into customers.',
            hero: [2, 0, 3], stage: [1, 4, 5], frame: [2, 4, 3], pairs: [[2, 3], [1, 5]],
            palette: [['Accent', '#184848'], ['Light', '#FFFFFF'], ['Dark', '#000000']],
        },
        {
            slug: 'niaimani', name: 'Niaimani Cleaning Services', video: '/assets/videos/NIAIMANI.mp4',
            services: ['Website design', 'Development'],
            tagline: '', liveUrl: '', sector: '', focus: '', year: '',
            headline: 'A fast, responsive build shaped around the brand.',
            summary: 'We partnered with Niaimani Cleaning Services to design and develop their website: a fast, responsive build shaped around the brand and made to turn visitors into customers.',
            hero: [1, 0, 2], stage: [2, 3, 4], frame: [1, 3, 4], pairs: [[1, 4], [2, 3]],
            palette: [['Accent', '#4878F0'], ['Light', '#FFFFFF'], ['Dark', '#303030']],
        },
    ],
};
