// fromHtml.js
import jsdom from 'jsdom';
import {
  iframeBlock,
  imageBlock,
  videoBlock,
  headingBlock, // Added headingBlock import
} from './blocks.js';
import { draftTableBlock, draftTextBlock } from './draftjs.js';
import { slateTableBlock, slateTextBlock } from './slate.js';
import { groupInlineNodes, isInline, isWhitespace } from '../helpers/dom.js';

const { JSDOM } = jsdom;

const dom = new JSDOM();
const DOMParser = dom.window.DOMParser;
const parser = new DOMParser();

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT = 8;

// Added H1-H6 to elementsWithConverters
const elementsWithConverters = [
  'IMG',
  'VIDEO',
  'TABLE',
  'IFRAME',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
];

const elementsShouldHaveText = [
  'B',
  'BLOCKQUOTE',
  'BODY',
  'CODE',
  'DEL',
  'DIV',
  'EM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'I',
  'P',
  'PRE',
  'S',
  'SPAN',
  'STRONG',
  'SUB',
  'SUP',
  'TABLE',
  'U',
];

const shouldKeepWrapper = (el) => {
  if (elementsShouldHaveText.includes(el.tagName)) {
    const textContent = el.textContent.trim();
    return textContent ? true : false;
  }
  return true;
};

const blockFromElement = (el, defaultTextBlock, href, nextElem) => {
  let textBlock = slateTextBlock;
  let tableBlock = slateTableBlock;
  if (defaultTextBlock === 'draftjs') {
    tableBlock = draftTableBlock;
    textBlock = draftTextBlock;
  }
  let raw = {};
  switch (el.tagName) {
    case 'IMG':
      raw = imageBlock(el, href, nextElem); // Pass nextElem to imageBlock
      break;
    case 'VIDEO':
      raw = videoBlock(el);
      break;
    case 'TABLE':
      raw = tableBlock(el);
      break;
    case 'IFRAME':
      raw = iframeBlock(el);
      break;
    // Added cases for headings
    case 'H1':
    case 'H2':
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6':
      raw = headingBlock(el);
      break;
    default:
      raw = textBlock(el);
      break;
  }
  return raw;
};

const skipCommentsAndWhitespace = (elements) => {
  return Array.from(elements).filter((node) => {
    if (node.nodeType === COMMENT) {
      return false;
    }
    if (node.nodeType === TEXT_NODE && isWhitespace(node.textContent)) {
      return false;
    }
    if (node.nodeType === ELEMENT_NODE) {
      // Ignore empty elements
      if (
        node.textContent.trim() === '' &&
        !['IMG', 'BR', 'HR', 'IFRAME'].includes(node.tagName)
      ) {
        return false;
      }
    }
    return true;
  });
};

const extractElementsWithConverters = (el, defaultTextBlock, href) => {
  const result = [];
  if (el.tagName === 'A') {
    href = el.getAttribute('href');
  }
  // First, traverse all childNodes
  for (const child of Array.from(el.childNodes)) {
    const tmpResult = extractElementsWithConverters(
      child,
      defaultTextBlock,
      href,
    );
    if (tmpResult.length > 0) {
      result.push(...tmpResult);
    }
  }
  if (elementsWithConverters.includes(el.tagName)) {
    const parent = el.parentElement;
    if (parent) {
      parent.removeChild(el);
    }
    if (shouldKeepWrapper(el)) {
      result.push(blockFromElement(el, defaultTextBlock, href));
    }
  }

  return result;
};

const convertFromHTML = (input, defaultTextBlock) => {
  const document = parser.parseFromString(input, 'text/html');
  let result = [];
  let elements = skipCommentsAndWhitespace(document.body.childNodes);

  // If there is a single div at the top level, ignore it
  if (elements.length === 1 && elements[0].tagName === 'DIV') {
    elements = skipCommentsAndWhitespace(
      document.body.firstElementChild.childNodes,
    );
  }

  // group top-level text and inline elements inside a paragraph
  // so they don't become separate blocks
  elements = groupInlineNodes(elements, {
    isInline,
    createParent: (child) => {
      const parent = document.createElement('P');
      parent.appendChild(child);
      return parent;
    },
    appendChild: (parent, child) => parent.appendChild(child),
  });

  // Initialize variables for accordion processing
  let isInsideAccordion = false;
  let currentAccordion = null;
  let currentAccordionPanel = null;
  let contentOfCurrentAccordionPanel = [];
  let generateId = () => Math.random().toString(36).substr(2, 9);

  // Process elements
  let i = 0;
  while (i < elements.length) {
    let blocks = [];
    const el = elements[i];
    const href = el.getAttribute ? el.getAttribute('href') : null;
    const children = Array.from(el.childNodes);

    // Check for accordion title
    if (el.tagName === 'P' && el.classList.contains('tiny_accordeon_title')) {
      // Start or continue an accordion
      if (!isInsideAccordion) {
        isInsideAccordion = true;
        currentAccordion = {
          '@type': 'accordion',
          collapsed: false,
          data: {
            blocks: {},
            blocks_layout: { items: [] },
          },
          filtering: false,
          non_exclusive: false,
          right_arrows: true,
        };
      } else if (currentAccordionPanel) {
        // Close previous panel
        currentAccordion.data.blocks[currentAccordionPanel.id] =
          currentAccordionPanel;
        currentAccordion.data.blocks_layout.items.push(
          currentAccordionPanel.id,
        );
      }
      // Start new panel
      currentAccordionPanel = {
        '@type': 'accordionPanel',
        title: el.textContent,
        blocks: {},
        blocks_layout: { items: [] },
        id: generateId(),
      };
    } else {
      // Handle images and captions
      if (el.tagName === 'IMG') {
        const nextEl = elements[i + 1];
        blocks.push(blockFromElement(el, defaultTextBlock, href, nextEl));
        if (
          nextEl &&
          nextEl.tagName === 'P' &&
          nextEl.classList.contains('richtext__imagelegend')
        ) {
          i++; // Skip the caption element
        }
      } else {
        for (const child of children) {
          // With children nodes, we keep the wrapper only
          // if at least one child is not in elementsWithConverters
          const tmpResult = extractElementsWithConverters(
            child,
            defaultTextBlock,
            href,
          );
          if (tmpResult.length > 0) {
            blocks.push(...tmpResult);
          }
        }
        if (shouldKeepWrapper(el)) {
          blocks.push(blockFromElement(el, defaultTextBlock));
        }
      }

      if (isInsideAccordion && currentAccordionPanel) {
        // Add block to current accordion panel
        const blockIds = blocks.map(() => generateId());
        currentAccordionPanel.blocks = {
          ...currentAccordionPanel.blocks,
          ...Object.fromEntries(
            blocks.map((block, index) => [blockIds[index], block]),
          ),
        };
        currentAccordionPanel.blocks_layout.items.push(...blockIds);
      } else {
        // Add block to result
        result.push(...blocks);
      }
    }
    i++;
  }

  // Close any remaining accordion panel
  if (isInsideAccordion && currentAccordionPanel) {
    currentAccordion.data.blocks[currentAccordionPanel.id] =
      currentAccordionPanel;
    currentAccordion.data.blocks_layout.items.push(currentAccordionPanel.id);
    // Add accordion to result
    result.push(currentAccordion);
  }

  return result;
};

export default convertFromHTML;
