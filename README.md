# AliDL Video Downloader

A browser extension that detects and downloads product videos from AliExpress/Alibaba.

## Features
- Detects embedded videos on product pages
- Simple one-click download interface
- Handles multiple video sources

## Technical Highlights
- Content script injection
- DOM video element detection
- Chrome downloads API integration

## Known Limitations
- Doesn't support blob URLs (may be a way but not yet.)
- May miss some dynamically loaded videos / description videos
- Alibaba occasionally changes their video delivery system

> *"This started as a learning project to understand browser extensions and e-commerce video systems.
>  While it works for many cases, Alibaba's frequently changing infrastructure presents ongoing challenges."*

## Development Learnings
- Challenges of working with complex e-commerce sites
- Importance of specific URL pattern matching
- Handling Chrome extension permissions
- Dealing with anti-bot and anti-scraper measures (especially in other versions)



## Background

I started this because I had wanted an extension like this a few years ago, I thought this would be a good project
to learn some things with and get my feet wet. I suppose it was but it turned out to be tougher than I thought.

Some of the things I discovered:
1. Alibaba/Aliexpress use multiple video delivery systems
2. They both have anti bot/ anti scraping measures and proxy URLs etc.
3. Tried many different methods to make this work well (straight dom detection, network monitoring, and user selection.
4. Eventually decided to just simplify to this system and keep it for now. I may work on it more later.


## Technical Constraints

- Chrome extensions have limited wild carding support for urls in manifest, probably for security.
- Alibaba / Aliexpress have intentionally obfuscated media delivery systems. Shouldnt be surprised since them limiting right click save is why I wanted to make this.
- Some videos may require Auth tokens
- There always seemed to be pesky videos like those in the description I couldnt fetch no matter which method I used.



## Future Improvements

- [ ] Deeper Alibaba/Aliexpress URL pattern analysis
- [ ] Video quality selection better dupe / unwanted video prevention
- [ ] Image support


---

**Note to Viewers**: This project represents my first browser extension and the very real challenges of working with production e-commerce systems. I welcome feedback from more experienced developers!
