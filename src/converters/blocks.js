// blocks.js
import { alignFromClassName, scaleFromUrl } from '../helpers/image.js';
import { getYTVideoId } from '../helpers/video.js';

const imageBlock = (elem, href, nextElem) => {
  // Strip /@@images/image if present
  const url = elem.src.split('/@@images')[0];

  const block = {
    '@type': 'image',
    url,
    alt: elem.alt || '',
    title: elem.title || '',
  };

  if (href) {
    const title = href.split('://')[1];
    block.href = [
      {
        '@id': href,
        title: title,
      },
    ];
  }

  // Map class names to image formats and alignments
  const classMap = {
    'fhnw-tiny-large': { format: 'large', align: 'center' },
    'fhnw-tiny-large-float': { format: 'large', align: 'left' },
    'fhnw-tiny-onethird-no-float': { format: 'third', align: 'center' },
    'fhnw-tiny-onethird': { format: 'third', align: 'left' },
    'fhnw-tiny-square': { format: 'half', align: 'center' },
    'fhnw-tiny-square-float': { format: 'half', align: 'left' },
    'fhnw-tiny-portrait': { format: 'portrait', align: 'left' },
  };

  let fhnwImage = false;
  // Set format and align based on class
  const classNames = elem.className.split(' ');
  for (const className of classNames) {
    if (classMap[className]) {
      // fhnw way
      block.format = classMap[className].format;
      block.align = classMap[className].align;
      block.size = 'l';
      fhnwImage = true;
      break;
    }
  }

  if (!block.format) {
    // default for fhnw
    block.format = 'large';
  }

  // plone way
  if (!fhnwImage) {
    switch (alignFromClassName(elem.className)) {
      case 'left':
        block.align = 'left';
        block.size = 'm';
        break;
      case 'right':
        block.align = 'right';
        block.size = 'm';
        break;
      case 'center':
        block.align = 'center';
        block.size = 'l';
        break;
    }

    const scale = scaleFromUrl(elem.src);
    if (scale !== null) {
      switch (scale) {
        case 'large':
          block.size = 'l';
          break;
        case 'thumb':
        case 'tile':
          block.size = 's';
          break;
        default:
          block.size = 'm';
          break;
      }
    }
  }

  // Set image description from the next element if it's a caption
  if (
    nextElem &&
    nextElem.tagName === 'P' &&
    nextElem.classList.contains('richtext__imagelegend')
  ) {
    block.description = nextElem.textContent;
  }

  // Pass through data attributes to block data
  for (const [k, v] of Object.entries(elem.dataset)) {
    block[k] = v;
  }

  return block;
};

const headingBlock = (elem) => {
  const block = {
    '@type': 'heading',
    alignment: 'left',
    heading: elem.textContent,
    tag: elem.tagName.toLowerCase(),
  };
  return block;
};

const iframeBlock = (elem) => {
  const youtubeId = getYTVideoId(elem.src);
  const block = {};
  if (youtubeId.length === 0) {
    block['@type'] = 'html';
    block.html = elem.outerHTML;
  } else {
    block['@type'] = 'video';
    block.url = `https://youtu.be/${youtubeId}`;
  }
  return block;
};

const videoBlock = (elem) => {
  let src = elem.src;
  if (src === '') {
    // If src is empty search for the first source element
    const child = elem.firstElementChild;
    if (child.tagName === 'SOURCE') {
      src = child.src;
    }
  }
  const youtubeId = getYTVideoId(src);
  const block = {
    '@type': 'video',
  };
  if (youtubeId.length === 0) {
    block.url = src;
  } else {
    block.url = `https://youtu.be/${youtubeId}`;
  }
  return block;
};

const buttonBlock = (elem) => {
  const block = {
    '@type': '__button',
    title: elem.textContent,
    href: [
      {
        '@id': elem.href,
        title: elem.textContent,
      },
    ],
    inneralign: 'left',
    styles: {
      variation: elem.classList.contains('tiny_link_button_primary')
        ? 'black'
        : 'white',
    },
  };
  return block;
};

const elementsWithConverters = {
  IMG: imageBlock,
  VIDEO: videoBlock,
  IFRAME: iframeBlock,
  // Added heading tags to elementsWithConverters
  H1: headingBlock,
  H2: headingBlock,
  H3: headingBlock,
  H4: headingBlock,
  H5: headingBlock,
  H6: headingBlock,
};

export {
  iframeBlock,
  imageBlock,
  videoBlock,
  headingBlock, // Export headingBlock
  getYTVideoId,
  elementsWithConverters,
  buttonBlock,
};
