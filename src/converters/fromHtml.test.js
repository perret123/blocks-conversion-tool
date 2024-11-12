import convertFromHTML from './fromHtml.js';

describe('convertFromHTML function', () => {
  describe('FHNW Example 1: Text Styles', () => {
    const html = `
      <p>This is a normal richtext field.<br />It is possible to make linebreaks too inside a paragraph.</p>
      <p>This is the second paragraph.</p>
      <ul>
        <li>This is a unordered list item</li>
        <li>This one has sub items
          <ul>
            <li>One subitem</li>
            <li>Two subitems
              <ul>
                <li>And this is even a third level.</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
      <ol>
        <li>The same list is also possible ordered</li>
        <li>Also with subitems
          <ol>
            <li>This is a subitem</li>
          </ol>
        </li>
      </ol>
      <p>The text can also be formated <strong>bold</strong> or <em>cursive</em>. And
        it is possible to mark a <a href="https://www.google.ch"
          data-linktype="external" data-val="https://www.google.ch">link</a>.</p>
      <p>We can also have headlines which should be in a separate Heading-Block:</p>
      <h2>This is a headline (h2)</h2>
      <p>And below it is a smaller headline</p>
      <h3>This is a smaller headline (h3)</h3>
      <p>There could be more headlines in the same style (h4-h6).</p>
    `;

    describe('with slate converter', () => {
      const result = convertFromHTML(html, 'slate');

      test('result should be an array', () => {
        expect(result).toBeInstanceOf(Array);
      });

      test('should return an array of 10 blocks', () => {
        expect(result).toHaveLength(10);
      });

      test('Block 1: should be a slate block with line breaks', () => {
        const block = result[0];
        expect(block['@type']).toBe('slate');
        expect(block.value[0].children[0].text).toContain(
          'This is a normal richtext field.\nIt is possible to make linebreaks too inside a paragraph.',
        );
        const valueElement = block.value[0];
        expect(valueElement['type']).toBe('p');
        expect(valueElement['children'][0]['text']).toContain(
          'This is a normal richtext field.\nIt is possible to make linebreaks too inside a paragraph.',
        );
      });

      test('Block 2: should be a slate block with second paragraph', () => {
        const block = result[1];
        expect(block['@type']).toBe('slate');
        expect(block.plaintext).toBe('This is the second paragraph.');
      });

      test('Block 3: should be a slate block with unordered list', () => {
        const block = result[2];
        expect(block['@type']).toBe('slate');
        expect(block.value[0]['type']).toBe('ul');
        // Check for nested list items
        const firstLevelItems = block.value[0]['children'];
        expect(firstLevelItems.length).toBe(2);
        expect(firstLevelItems[0]['type']).toBe('li');
      });

      test('Block 4: should be a slate block with ordered list', () => {
        const block = result[3];
        expect(block['@type']).toBe('slate');
        expect(block.value[0]['type']).toBe('ol');
      });

      test('Block 5: should be a slate block with formatted text', () => {
        const block = result[4];
        expect(block['@type']).toBe('slate');
        const children = block.value[0]['children'];
        expect(children.some((child) => child.type === 'strong')).toBe(true);
        expect(children.some((child) => child.type === 'em')).toBe(true);
        expect(children.some((child) => child.type === 'link')).toBe(true);
      });

      test('Block 6: should be a slate block before heading', () => {
        const block = result[5];
        expect(block['@type']).toBe('slate');
        expect(block.plaintext).toContain(
          'We can also have headlines which should be in a separate Heading-Block:',
        );
      });

      test('Block 7: should be a heading block (h2)', () => {
        const block = result[6];
        expect(block['@type']).toBe('heading');
        expect(block.heading).toBe('This is a headline (h2)');
        expect(block.tag).toBe('h2');
      });

      test('Block 8: should be a slate block after heading', () => {
        const block = result[7];
        expect(block['@type']).toBe('slate');
        expect(block.plaintext).toContain('And below it is a smaller headline');
      });

      test('Block 9: should be a heading block (h3)', () => {
        const block = result[8];
        expect(block['@type']).toBe('heading');
        expect(block.heading).toBe('This is a smaller headline (h3)');
        expect(block.tag).toBe('h3');
      });

      test('Block 10: should be a slate block with final paragraph', () => {
        const block = result[9];
        expect(block['@type']).toBe('slate');
        expect(block.plaintext).toContain(
          'There could be more headlines in the same style (h4-h6).',
        );
      });
    });
  });

  describe('FHNW Example 2: Accordion with Buttons and Tables', () => {
    const html = `<p class="tiny_accordeon_title">Gross ohne Umlauf</p>
    <p>Lorem ipsum dolor sit amet. <img src="../../../../resolveuid/daa75bd0f5d141ab8e32bdeb9f228587" class="fhnw-tiny-large" data-linktype="image" data-val="daa75bd0f5d141ab8e32bdeb9f228587" /></p>
    <p class="richtext__imagelegend">Bildlegende</p>
    <p>Mehr Text</p>
    <p class="tiny_accordeon_title">Buttons</p>
    <p>Text</p>
    <p><a href="https://www.google.ch" class="button button__primary tiny_link_button_primary" data-linktype="external" data-val="https://www.google.ch">This is a button!</a></p>
    <p><a href="https://www.google.ch" class="button button__secondary tiny_link_button_secondary" data-linktype="external" data-val="https://www.google.ch">This is a secondary button - white instead of black</a></p>
    <p>Mehr Text</p>
    <p class="tiny_accordeon_title">Tabelle</p>
    <table border="1" style="border-collapse: collapse; width: 56.25%;">
    <tbody>
    <tr>
    <th style="width: 25%;">Tabelle Reihe 1 Feld 1</th>
    <th style="width: 25%;">Tabelle Reihe 1 Feld 2</th>
    <th style="width: 25%;">Tabelle Reihe 1 Feld 3</th>
    </tr>
    <tr>
    <td style="width: 25%;">Normale Reihe</td>
    <td style="width: 25%;">Noramle</td>
    <td style="width: 25%;">Reihe</td>
    </tr>
    </tbody>
    </table>`;

    describe('with slate converter', () => {
      const data = convertFromHTML(html, 'slate');

      test('should return the correct blocks', () => {
        expect(data).toHaveLength(1);
        expect(data[0]).toMatchObject({
          '@type': 'accordion',
          right_arrows: true,
          collapsed: false,
          non_exclusive: false,
          filtering: false,
          data: {
            blocks: expect.any(Object),
            blocks_layout: {
              items: expect.any(Array),
            },
          },
        });
      });

      test('should contain 3 accordion items', () => {
        const accordionBlock = data[0];
        const accordionItems = accordionBlock.data.blocks;
        const accordionLayoutItems = accordionBlock.data.blocks_layout.items;

        expect(Object.keys(accordionItems)).toHaveLength(3);
        expect(accordionLayoutItems).toHaveLength(3);
      });

      describe('Accordion Item 1: "Gross ohne Umlauf"', () => {
        let accordionItem1;
        let item1Blocks;
        let item1LayoutItems;

        beforeAll(() => {
          const accordionBlock = data[0];
          const accordionItems = accordionBlock.data.blocks;
          const findAccordionItemByTitle = (title) => {
            const itemId = Object.keys(accordionItems).find(
              (id) => accordionItems[id].title === title,
            );
            return accordionItems[itemId];
          };
          accordionItem1 = findAccordionItemByTitle('Gross ohne Umlauf');
          item1Blocks = accordionItem1.blocks;
          item1LayoutItems = accordionItem1.blocks_layout.items;
        });

        test('should have correct structure', () => {
          expect(accordionItem1).toMatchObject({
            '@type': 'accordionPanel',
            title: 'Gross ohne Umlauf',
            blocks: expect.any(Object),
            blocks_layout: {
              items: expect.any(Array),
            },
          });
        });

        test('should contain 4 blocks', () => {
          expect(item1LayoutItems).toHaveLength(3);
        });

        test('Block 1: should be an image block', () => {
          const block1 = item1Blocks[item1LayoutItems[0]];
          expect(block1).toMatchObject({
            '@type': 'image',
            url: '../../../../resolveuid/daa75bd0f5d141ab8e32bdeb9f228587',
            alt: '',
            title: '',
            format: 'large',
            size: 'l',
            description: 'Bildlegende',
          });
        });

        test('Block 2: should be a slate block with text', () => {
          const block2 = item1Blocks[item1LayoutItems[1]];
          expect(block2).toMatchObject({
            '@type': 'slate',
            plaintext: 'Lorem ipsum dolor sit amet. ',
            value: [
              {
                type: 'p',
                children: [{ text: 'Lorem ipsum dolor sit amet. ' }],
              },
            ],
          });
        });

        test('Block 3: should be a slate block with more text', () => {
          const block3 = item1Blocks[item1LayoutItems[2]];
          expect(block3).toMatchObject({
            '@type': 'slate',
            plaintext: 'Mehr Text',
            value: [
              {
                type: 'p',
                children: [{ text: 'Mehr Text' }],
              },
            ],
          });
        });
      });

      describe('Accordion Item 2: "Buttons"', () => {
        let accordionItem2;
        let item2Blocks;
        let item2LayoutItems;

        beforeAll(() => {
          const accordionBlock = data[0];
          const accordionItems = accordionBlock.data.blocks;
          const findAccordionItemByTitle = (title) => {
            const itemId = Object.keys(accordionItems).find(
              (id) => accordionItems[id].title === title,
            );
            return accordionItems[itemId];
          };
          accordionItem2 = findAccordionItemByTitle('Buttons');
          item2Blocks = accordionItem2.blocks;
          item2LayoutItems = accordionItem2.blocks_layout.items;
        });

        test('should have correct structure', () => {
          expect(accordionItem2).toMatchObject({
            '@type': 'accordionPanel',
            title: 'Buttons',
            blocks: expect.any(Object),
            blocks_layout: {
              items: expect.any(Array),
            },
          });
        });

        test('should contain 4 blocks', () => {
          expect(item2LayoutItems).toHaveLength(4);
        });

        test('Block 1: should be a slate block with text', () => {
          const block5 = item2Blocks[item2LayoutItems[0]];
          expect(block5).toMatchObject({
            '@type': 'slate',
            plaintext: 'Text',
            value: [
              {
                type: 'p',
                children: [{ text: 'Text' }],
              },
            ],
          });
        });

        test('Block 2: should be a button block', () => {
          const block6 = item2Blocks[item2LayoutItems[1]];
          expect(block6).toMatchObject({
            '@type': '__button',
            title: 'This is a button!',
            href: [
              {
                '@id': 'https://www.google.ch/',
                title: 'This is a button!',
              },
            ],
            inneralign: 'left',
            styles: {
              variation: 'black',
            },
          });
        });

        test('Block 3: should be a secondary button block', () => {
          const block7 = item2Blocks[item2LayoutItems[2]];
          expect(block7).toMatchObject({
            '@type': '__button',
            title: 'This is a secondary button - white instead of black',
            href: [
              {
                '@id': 'https://www.google.ch/',
                title: 'This is a secondary button - white instead of black',
              },
            ],
            inneralign: 'left',
            styles: {
              variation: 'white',
            },
          });
        });

        test('Block 4: should be a slate block with more text', () => {
          const block8 = item2Blocks[item2LayoutItems[3]];
          expect(block8).toMatchObject({
            '@type': 'slate',
            plaintext: 'Mehr Text',
            value: [
              {
                type: 'p',
                children: [{ text: 'Mehr Text' }],
              },
            ],
          });
        });
      });

      describe('Accordion Item 3: "Tabelle"', () => {
        let accordionItem3;
        let item3Blocks;
        let item3LayoutItems;

        beforeAll(() => {
          const accordionBlock = data[0];
          const accordionItems = accordionBlock.data.blocks;
          const findAccordionItemByTitle = (title) => {
            const itemId = Object.keys(accordionItems).find(
              (id) => accordionItems[id].title === title,
            );
            return accordionItems[itemId];
          };
          accordionItem3 = findAccordionItemByTitle('Tabelle');
          item3Blocks = accordionItem3.blocks;
          item3LayoutItems = accordionItem3.blocks_layout.items;
        });

        test('should have correct structure', () => {
          expect(accordionItem3).toMatchObject({
            '@type': 'accordionPanel',
            title: 'Tabelle',
            blocks: expect.any(Object),
            blocks_layout: {
              items: expect.any(Array),
            },
          });
        });

        test('should contain 1 block', () => {
          expect(item3LayoutItems).toHaveLength(1);
        });

        test('Block 1: should be a slateTable block', () => {
          const block9 = item3Blocks[item3LayoutItems[0]];
          expect(block9).toMatchObject({
            '@type': 'slateTable',
            table: {
              basic: false,
              celled: true,
              compact: false,
              fixed: true,
              inverted: false,
              striped: false,
              rows: expect.any(Array),
            },
          });

          const tableRows = block9.table.rows;
          expect(tableRows).toHaveLength(2); // Header row and one data row

          // Header row
          const headerRow = tableRows[0];
          expect(headerRow.cells).toHaveLength(3);
          expect(headerRow.cells[0].type).toBe('header');
          expect(headerRow.cells[0].value[0]).toMatchObject({
            type: 'div',
            children: [{ text: 'Tabelle Reihe 1 Feld 1' }],
          });

          const dataRow = tableRows[1];
          expect(dataRow.cells).toHaveLength(3);
          expect(dataRow.cells[0].type).toBe('data');
          expect(dataRow.cells[0].value[0]).toMatchObject({
            type: 'div',
            children: [{ text: 'Normale Reihe' }],
          });
        });
      });
    });
  });
});

describe('convertFromHTML function', () => {
  describe('FHNW Example 3: Images with Various Formats', () => {
    const html = `
      <p>We had many different image formats:</p>
      <h3>Big, no text wrap</h3>
      <p><img title="Title of the Image" class="fhnw-tiny-large"
          src="../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466"
          alt="Alternative text of the image" data-linktype="image"
          data-val="f9bf126e6be649de8a8fa02bf20d3466" /> </p>
      <p class="richtext__imagelegend">Image legend text! Should belong to the image.</p>
      <h3>Big, with text wrap</h3>
      <p><img title="Title of the Image" class="fhnw-tiny-large-float"
          src="../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466"
          alt="Alternative text of the image" data-linktype="image"
          data-val="f9bf126e6be649de8a8fa02bf20d3466" /></p>
      <p>Example text in between</p>
      <h3>Third, no text wrap</h3>
      <p><img title="Title of the Image" class="fhnw-tiny-onethird-no-float"
          src="../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466"
          alt="Alternative text of the image" data-linktype="image"
          data-val="f9bf126e6be649de8a8fa02bf20d3466" /> </p>
      <h3>Third, with text wrap</h3>
      <p><img title="Title of the Image" class="fhnw-tiny-onethird"
          src="../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466"
          alt="Alternative text of the image" data-linktype="image"
          data-val="f9bf126e6be649de8a8fa02bf20d3466" /></p>
      <p class="richtext__imagelegend">Image legend text! Should belong to the image.</p>
      <h3>Half, no text wrap</h3>
      <p><img title="Title of the Image" class="fhnw-tiny-square"
          src="../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466"
          alt="Alternative text of the image" data-linktype="image"
          data-val="f9bf126e6be649de8a8fa02bf20d3466" /> </p>
      <h3>Half, with text wrap</h3>
      <p><img title="Title of the Image" class="fhnw-tiny-square-float"
          src="../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466"
          alt="Alternative text of the image" data-linktype="image"
          data-val="f9bf126e6be649de8a8fa02bf20d3466" /></p>
      <h3>Portrait, with text wrap</h3>
      <p><img title="Title of the Image" class="fhnw-tiny-portrait"
          src="../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466"
          alt="Alternative text of the image" data-linktype="image"
          data-val="f9bf126e6be649de8a8fa02bf20d3466" /></p>
    `;

    describe('with slate converter', () => {
      const result = convertFromHTML(html, 'slate');

      test('result should be an array', () => {
        expect(result).toBeInstanceOf(Array);
      });

      test('should return an array of 16 blocks', () => {
        expect(result).toHaveLength(16);
      });

      test('Block 0: should be a slate block with introductory text', () => {
        const block = result[0];
        expect(block['@type']).toBe('slate');
        expect(block.plaintext).toBe('We had many different image formats:');
        expect(block.value[0].type).toBe('p');
        expect(block.value[0].children[0].text).toBe(
          'We had many different image formats:',
        );
      });

      test('Block 1: should be a heading block with heading "Big, no text wrap"', () => {
        const block = result[1];
        expect(block['@type']).toBe('heading');
        expect(block.heading).toBe('Big, no text wrap');
        expect(block.tag).toBe('h3');
        expect(block.alignment).toBe('left');
      });

      test('Block 2: should be an image block with format "large" and description', () => {
        const block = result[2];
        expect(block['@type']).toBe('image');
        expect(block.format).toBe('large');
        expect(block.size).toBe('l');
        expect(block.align).toBe('center');
        expect(block.description).toBe(
          'Image legend text! Should belong to the image.',
        );
        expect(block.url).toBe(
          '../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466',
        );
      });

      test('Block 3: should be a heading block with heading "Big, with text wrap"', () => {
        const block = result[3];
        expect(block['@type']).toBe('heading');
        expect(block.heading).toBe('Big, with text wrap');
        expect(block.tag).toBe('h3');
        expect(block.alignment).toBe('left');
      });

      test('Block 4: should be an image block with format "large"', () => {
        const block = result[4];
        expect(block['@type']).toBe('image');
        expect(block.format).toBe('large');
        expect(block.size).toBe('l');
        expect(block.align).toBe('left');
        expect(block.url).toBe(
          '../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466',
        );
      });

      test('Block 5: should be a slate block with text "Example text in between"', () => {
        const block = result[5];
        expect(block['@type']).toBe('slate');
        expect(block.plaintext).toBe('Example text in between');
        expect(block.value[0].type).toBe('p');
        expect(block.value[0].children[0].text).toBe('Example text in between');
      });

      test('Block 6: should be a heading block with heading "Third, no text wrap"', () => {
        const block = result[6];
        expect(block['@type']).toBe('heading');
        expect(block.heading).toBe('Third, no text wrap');
        expect(block.tag).toBe('h3');
        expect(block.alignment).toBe('left');
      });

      test('Block 7: should be an image block with format "third"', () => {
        const block = result[7];
        expect(block['@type']).toBe('image');
        expect(block.format).toBe('third');
        expect(block.size).toBe('l');
        expect(block.align).toBe('center');
        expect(block.url).toBe(
          '../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466',
        );
      });

      test('Block 8: should be a heading block with heading "Third, with text wrap"', () => {
        const block = result[8];
        expect(block['@type']).toBe('heading');
        expect(block.heading).toBe('Third, with text wrap');
        expect(block.tag).toBe('h3');
        expect(block.alignment).toBe('left');
      });

      test('Block 9: should be an image block with format "third" and description', () => {
        const block = result[9];
        expect(block['@type']).toBe('image');
        expect(block.format).toBe('third');
        expect(block.size).toBe('l');
        expect(block.align).toBe('left');
        expect(block.description).toBe(
          'Image legend text! Should belong to the image.',
        );
        expect(block.url).toBe(
          '../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466',
        );
      });

      test('Block 10: should be a heading block with heading "Half, no text wrap"', () => {
        const block = result[10];
        expect(block['@type']).toBe('heading');
        expect(block.heading).toBe('Half, no text wrap');
        expect(block.tag).toBe('h3');
        expect(block.alignment).toBe('left');
      });

      test('Block 11: should be an image block with format "half"', () => {
        const block = result[11];
        expect(block['@type']).toBe('image');
        expect(block.format).toBe('half');
        expect(block.size).toBe('l');
        expect(block.align).toBe('center');
        expect(block.url).toBe(
          '../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466',
        );
      });

      test('Block 12: should be a heading block with heading "Half, with text wrap"', () => {
        const block = result[12];
        expect(block['@type']).toBe('heading');
        expect(block.heading).toBe('Half, with text wrap');
        expect(block.tag).toBe('h3');
        expect(block.alignment).toBe('left');
      });

      test('Block 13: should be an image block with format "half"', () => {
        const block = result[13];
        expect(block['@type']).toBe('image');
        expect(block.format).toBe('half');
        expect(block.size).toBe('l');
        expect(block.align).toBe('left');
        expect(block.url).toBe(
          '../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466',
        );
      });

      test('Block 14: should be a heading block with heading "Portrait, with text wrap"', () => {
        const block = result[14];
        expect(block['@type']).toBe('heading');
        expect(block.heading).toBe('Portrait, with text wrap');
        expect(block.tag).toBe('h3');
        expect(block.alignment).toBe('left');
      });

      test('Block 15: should be an image block with format "portrait"', () => {
        const block = result[15];
        expect(block['@type']).toBe('image');
        expect(block.format).toBe('portrait');
        expect(block.size).toBe('l');
        expect(block.align).toBe('left');
        expect(block.url).toBe(
          '../../../../resolveuid/f9bf126e6be649de8a8fa02bf20d3466',
        );
      });
    });
  });
});

describe('convertFromHTML function', () => {
  describe('FHNW Example 4: Tabs with Content', () => {
    const html = `
      <p class="tiny_tabnavigation_title">Tab 1 Titel</p>
      <p>Das ist ein Text im ersten Tab des Tabulators.</p>
      <p>Mehr gibt es nicht.</p>
      <p class="tiny_tabnavigation_title">Das ist der zweite Tab</p>
      <ul>
        <li>Hier haben wir eine Auflistung</li>
        <li>mit 3</li>
        <li>Elementen</li>
      </ul>
      <p>Und dazu ein Bild:</p>
      <p><img alt="Ein Bild mit einem coolen alt-Text sogar!" src="../../../../../resolveuid/77e8730c812f4fac973e021b47ec9b1b" class="fhnw-tiny-onethird" data-linktype="image" data-val="77e8730c812f4fac973e021b47ec9b1b" /></p>
      <p>Dieses Bild hat Textumlauf aktiv, also sollte dieser Text um das Bild herum laufen.</p>
      <p class="tiny_tabnavigation_title">Und hier ist der dritte Tab Titel</p>
      <table border="1" style="border-collapse: collapse; width: 100%;">
      <tbody>
      <tr>
      <td style="width: 20%;">Mit einer Tabelle</td>
      <td style="width: 20%;">ohne Headers</td>
      <td style="width: 20%;">und ohne sonst was</td>
      <td style="width: 20%;">sondern einfach</td>
      <td style="width: 20%;">fünf Spalten</td>
      </tr>
      <tr>
      <td style="width: 20%;">und </td>
      <td style="width: 20%;">vier</td>
      <td style="width: 20%;">Reihen.</td>
      <td style="width: 20%;">1</td>
      <td style="width: 20%;">2</td>
      </tr>
      <tr>
      <td style="width: 20%;">3</td>
      <td style="width: 20%;">4</td>
      <td style="width: 20%;">5</td>
      <td style="width: 20%;">6</td>
      <td style="width: 20%;">7</td>
      </tr>
      <tr>
      <td style="width: 20%;">8</td>
      <td style="width: 20%;">9</td>
      <td style="width: 20%;">10</td>
      <td style="width: 20%;">11</td>
      <td style="width: 20%;">12</td>
      </tr>
      </tbody>
      </table>
    `;

    describe('with slate converter', () => {
      const result = convertFromHTML(html, 'slate');

      test('result should be an array', () => {
        expect(result).toBeInstanceOf(Array);
      });

      test('should return an array with 1 block', () => {
        expect(result).toHaveLength(1);
      });

      test('Block 0: should be a tabs_block with the correct structure', () => {
        const block = result[0];
        expect(block['@type']).toBe('tabs_block');
        expect(block.data).toBeDefined();
        expect(block.data.blocks).toBeDefined();
        expect(block.data.blocks_layout).toBeDefined();
        expect(block.data.blocks_layout.items).toBeInstanceOf(Array);
      });

      test('Tabs block should contain 3 tabs', () => {
        const tabsBlock = result[0];
        const tabs = tabsBlock.data.blocks;
        const tabsLayout = tabsBlock.data.blocks_layout.items;
        expect(tabsLayout).toHaveLength(3);
        expect(Object.keys(tabs)).toHaveLength(3);
      });

      describe('Tab 1: "Tab 1 Titel"', () => {
        let tabId, tabBlock;
        beforeAll(() => {
          const tabsBlock = result[0];
          const tabs = tabsBlock.data.blocks;
          tabId = tabsBlock.data.blocks_layout.items.find(
            (id) => tabs[id].title === 'Tab 1 Titel',
          );
          tabBlock = tabs[tabId];
        });

        test('Tab should be of type "tab" with correct title', () => {
          expect(tabBlock['@type']).toBe('tab');
          expect(tabBlock.title).toBe('Tab 1 Titel');
        });

        test('Tab should contain 2 content blocks', () => {
          expect(tabBlock.blocks_layout.items).toHaveLength(2);
          expect(Object.keys(tabBlock.blocks)).toHaveLength(2);
        });

        test('First block should be a slate block with text "Das ist ein Text im ersten Tab des Tabulators."', () => {
          const blockId = tabBlock.blocks_layout.items[0];
          const block = tabBlock.blocks[blockId];
          expect(block['@type']).toBe('slate');
          expect(block.plaintext).toBe(
            'Das ist ein Text im ersten Tab des Tabulators.',
          );
        });

        test('Second block should be a slate block with text "Mehr gibt es nicht."', () => {
          const blockId = tabBlock.blocks_layout.items[1];
          const block = tabBlock.blocks[blockId];
          expect(block['@type']).toBe('slate');
          expect(block.plaintext).toBe('Mehr gibt es nicht.');
        });
      });

      describe('Tab 2: "Das ist der zweite Tab"', () => {
        let tabId, tabBlock;
        beforeAll(() => {
          const tabsBlock = result[0];
          const tabs = tabsBlock.data.blocks;
          tabId = tabsBlock.data.blocks_layout.items.find(
            (id) => tabs[id].title === 'Das ist der zweite Tab',
          );
          tabBlock = tabs[tabId];
        });

        test('Tab should be of type "tab" with correct title', () => {
          expect(tabBlock['@type']).toBe('tab');
          expect(tabBlock.title).toBe('Das ist der zweite Tab');
        });

        test('Tab should contain 4 content blocks', () => {
          expect(tabBlock.blocks_layout.items).toHaveLength(4);
          expect(Object.keys(tabBlock.blocks)).toHaveLength(4);
        });

        test('First block should be a slate block with unordered list', () => {
          const blockId = tabBlock.blocks_layout.items[0];
          const block = tabBlock.blocks[blockId];
          expect(block['@type']).toBe('slate');
          expect(block.value[0].type).toBe('ul');
          const listItems = block.value[0].children;
          expect(listItems).toHaveLength(3);
          expect(listItems[0].children[0].text).toBe(
            'Hier haben wir eine Auflistung',
          );
          expect(listItems[1].children[0].text).toBe('mit 3');
          expect(listItems[2].children[0].text).toBe('Elementen');
        });

        test('Second block should be a slate block with text "Und dazu ein Bild:"', () => {
          const blockId = tabBlock.blocks_layout.items[1];
          const block = tabBlock.blocks[blockId];
          expect(block['@type']).toBe('slate');
          expect(block.plaintext).toBe('Und dazu ein Bild:');
        });

        test('Third block should be an image block', () => {
          const blockId = tabBlock.blocks_layout.items[2];
          const block = tabBlock.blocks[blockId];
          expect(block['@type']).toBe('image');
          expect(block.url).toBe(
            '../../../../../resolveuid/77e8730c812f4fac973e021b47ec9b1b',
          );
          expect(block.align).toBe('left');
          expect(block.format).toBe('third');
          expect(block.alt).toBe('Ein Bild mit einem coolen alt-Text sogar!');
        });

        test('Fourth block should be a slate block with text about the image', () => {
          const blockId = tabBlock.blocks_layout.items[3];
          const block = tabBlock.blocks[blockId];
          expect(block['@type']).toBe('slate');
          expect(block.plaintext).toBe(
            'Dieses Bild hat Textumlauf aktiv, also sollte dieser Text um das Bild herum laufen.',
          );
        });
      });

      describe('Tab 3: "Und hier ist der dritte Tab Titel"', () => {
        let tabId, tabBlock;
        beforeAll(() => {
          const tabsBlock = result[0];
          const tabs = tabsBlock.data.blocks;
          tabId = tabsBlock.data.blocks_layout.items.find(
            (id) => tabs[id].title === 'Und hier ist der dritte Tab Titel',
          );
          tabBlock = tabs[tabId];
        });

        test('Tab should be of type "tab" with correct title', () => {
          expect(tabBlock['@type']).toBe('tab');
          expect(tabBlock.title).toBe('Und hier ist der dritte Tab Titel');
        });

        test('Tab should contain 1 content block', () => {
          expect(tabBlock.blocks_layout.items).toHaveLength(1);
          expect(Object.keys(tabBlock.blocks)).toHaveLength(1);
        });

        test('First block should be a slateTable block', () => {
          const blockId = tabBlock.blocks_layout.items[0];
          const block = tabBlock.blocks[blockId];
          expect(block['@type']).toBe('slateTable');
          expect(block.table).toBeDefined();
          expect(block.table.rows).toBeInstanceOf(Array);
          expect(block.table.rows).toHaveLength(5); // Four data rows, one invisible header
          expect(block.table.hideHeaders).toBe(true);
        });

        test('Table should have correct data', () => {
          const blockId = tabBlock.blocks_layout.items[0];
          const block = tabBlock.blocks[blockId];
          const rows = block.table.rows;

          // First row cells (row 0 is invisible header)
          expect(rows[1].cells[0].value[0].children[0].text).toBe(
            'Mit einer Tabelle',
          );
          expect(rows[1].cells[1].value[0].children[0].text).toBe(
            'ohne Headers',
          );
          expect(rows[1].cells[2].value[0].children[0].text).toBe(
            'und ohne sonst was',
          );
          expect(rows[1].cells[3].value[0].children[0].text).toBe(
            'sondern einfach',
          );
          expect(rows[1].cells[4].value[0].children[0].text).toBe(
            'fünf Spalten',
          );

          // Second row cells
          expect(rows[2].cells[0].value[0].children[0].text).toBe('und ');
          expect(rows[2].cells[1].value[0].children[0].text).toBe('vier');
          expect(rows[2].cells[2].value[0].children[0].text).toBe('Reihen.');
          expect(rows[2].cells[3].value[0].children[0].text).toBe('1');
          expect(rows[2].cells[4].value[0].children[0].text).toBe('2');

          // Third row cells
          expect(rows[3].cells[0].value[0].children[0].text).toBe('3');
          expect(rows[3].cells[1].value[0].children[0].text).toBe('4');
          expect(rows[3].cells[2].value[0].children[0].text).toBe('5');
          expect(rows[3].cells[3].value[0].children[0].text).toBe('6');
          expect(rows[3].cells[4].value[0].children[0].text).toBe('7');

          // Fourth row cells
          expect(rows[4].cells[0].value[0].children[0].text).toBe('8');
          expect(rows[4].cells[1].value[0].children[0].text).toBe('9');
          expect(rows[4].cells[2].value[0].children[0].text).toBe('10');
          expect(rows[4].cells[3].value[0].children[0].text).toBe('11');
          expect(rows[4].cells[4].value[0].children[0].text).toBe('12');
        });
      });
    });
  });
});

describe('convertFromHTML parsing html', () => {
  const html = `
  <p>Years have passed since the 2016 sprint at Penn State where a team of community members worked on a new theme and madly reorganized content on the Plone 5 version of plone.org. The site dates back to 2002 and the Plone 1 days, and the software and content had been upgraded in place over the years with only minor theme changes - to Plone 2 and 2.5, then Plone 3, then Plone 4, and finally Plone 4.3. It served us well, but because Plone 5 brought many changes, including a new out-of-the-box theme (Barceloneta), we mounted a major effort to refresh the design as well as upgrade the content and software.</p>
  <p>What was new then is now looking old, and the <a href="https://plone.org/community/communications-and-marketing">marketing team</a> has embarked on a modernization effort. The ultimate goal is to upgrade to Plone 6 and create a React-based theme using the new front end. But meanwhile we've been having a series of mini-sprints to improve what we have now.</p>
  <p>Our first major initiative was to improve the News section, which holds an amazing collection of content. Browsing it can take you back in time - to the <a href="https://plone.org/news/2002/plone-rc1-announce">Plone 1.0 RC1 release announcement</a> for example, or <a href="https://plone.org/news/2002/News%20Item%2C2002-03-09%2C1015704695057735977">Alan's 2002 thoughts on what Plone should be</a>, or <a href="https://plone.org/news/2006/plone-foundation-501c3">approval of the Plone Foundation as a 501(c)(3) organization</a>. It was already possible to <a href="https://plone.org/news/plone-news-by-year">browse news items by year</a>, but we thought categorization by topic would also be useful. So we tagged every news item, and now you can <a href="https://plone.org/news/plone-news-by-category">browse news items by category</a>. Fulvio Casali chronicled this effort in his 2020 Plone Conference talk <a href="https://www.youtube.com/watch?v=6OV0_E5sU5k">Oh the Places We've Been</a>!</p>
  <p>A not very attractive display of news items and listings was another issue. So we sketched out a cleaner look, with a standardized lead image aspect ratio and a more useful byline. Then the more technically adventurous members of the marketing team (Norbert, Fulvio, Érico) strapped on helmets and figured out how to make changes to the site's theme. You are looking at our initial improvements, and there's more to come.</p>
  <p>Our other major initiative is to move the contents of the plone.com site over to plone.org. Over the years plone.com became very difficult to maintain, so we have discontinued it. (Contact the marketing team if you need to retrieve any plone.com content.) With that in mind, we created a <a href="https://plone.org/what-is-plone">What is Plone?</a> section on plone.org which is oriented towards the plone.com audience. It is also a place for us to describe all the pieces of the Plone ecosystem and how they fit together.</p>
  <p>In addition to these bigger jobs we've been making lots of little improvements during our mini-sprints, including fixing bugs old and new as recorded on the <a href="https://github.com/plone/ploneorg.core/issues">plone.org issue tracker</a>.</p>
  <h2>Would you like to help with this effort?</h2>
  <p>We'd love to have you!</p>
  <ul>
  <li>Join our effort to <strong>promote Plone by publishing regular plone.org news items</strong> - successes, new developments, controversies, generally telling a broad audience what's happening in the Plone world</li>
  <li>Do you have design skills? We don't and we need <strong>help with design improvements</strong> and eventually a <strong>new theme for Plone 6</strong></li>
  <li>If you are a theming wizard please help us <strong>modernize the site styles</strong> - more 2021 and less 2016</li>
  <li>Show off Plone's built in search by creating a <strong>beautiful search results listing</strong></li>
  <li>Help us with our ongoing efforts to <strong>fix bugs</strong> and <strong>curate content</strong></li>
  <li>Help us <strong>migrate plone.org to Plone 6</strong></li>
  </ul>
  <p>Please <a href="mailto:marketing@plone.org?subject=Helping with plone.org">contact the marketing team</a> to get involved. Anyone with technical, design or content editor skills is welcome.</p>
  <p><strong> </strong></p>`;

  /* no need fixing draftjs
  describe('with draftjs converter', () => {
    const result = convertFromHTML(html, 'draftjs');

    test('will return an array of blocks', () => {
      expect(result).toHaveLength(11);
    });

    test('will have a first block with text content', () => {
      const block = result[0];
      expect(block['@type']).toBe('text');
      const valueElement = block.text;
      expect(valueElement.blocks).toHaveLength(1);
      const firstBlock = valueElement.blocks[0];
      expect(firstBlock['text']).toContain(
        'Years have passed since the 2016 sprint at Penn State where a team of community members worked',
      );
      expect(firstBlock['type']).toBe('unstyled');
      expect(firstBlock['depth']).toBe(0);
    });
  });
  */

  describe('with slate converter', () => {
    const result = convertFromHTML(html, 'slate');

    test('will return an array of blocks', () => {
      expect(result).toHaveLength(10);
    });

    test('will have a first block with text content', () => {
      const block = result[0];
      expect(block['@type']).toBe('slate');
      expect(block.plaintext).toContain(
        'Years have passed since the 2016 sprint at Penn State where a team of community members worked',
      );
      const valueElement = block.value[0];
      expect(valueElement['type']).toBe('p');
      expect(valueElement['children'][0]['text']).toContain(
        'Years have passed since the 2016 sprint at Penn State where a team of community members worked',
      );
    });
  });
});

describe('convertFromHTML parsing html with images nested in h2', () => {
  const html = `
  <div>
    <h2 id="chrissy"><img src="https://plone.org/foundation/meetings/membership/2019-membership-meeting/nominations/img4_08594.jpg/@@images/7a07f0e5-0fd7-4366-a32d-6b033c8dfce7.jpeg" title="Chrissy Wainwright 2019" alt="Chrissy Wainwright 2019" class="image-right">Chrissy Wainwright</h2>
    <p><strong>President</strong>, (Springdale, Arkansas, USA)</p>
    <p>Chrissy started at Six Feet Up as a front-end developer building Plone themes and has since moved to the back-end doing Python development and Plone migrations. She has given talks and training classes at many Plone Symposia and Conferences. This is her seventh term on the board, second as President.</p>
    <hr>
    <h2 id="erico"><img src="https://plone.org/foundation/board/github.jpg/@@images/1135c449-bf22-4011-b128-ab50c62e03b1.jpeg" title="ericof" alt="ericof" class="image-right">Érico Andrei</h2>
    <p><strong>Vice President</strong>, (Berlin, DE)</p>
    <p>Érico Andrei worked for more than 10 years with content management projects using Plone. During that period he co-founded Simples Consultoria, hosted 2 Plone Symposiums, co-organized a Plone Conference and in 2011 he was PythonBrasil (local Pycon) chair. Currently CTO for a German startup. He still uses Plone and Python every day. This is Érico's sixth term on the board.</p>
    <hr>
  </div>
  `;

  describe('with draftjs converter', () => {
    const result = convertFromHTML(html, 'draftjs');

    test('will return an array of blocks', () => {
      expect(result).toHaveLength(10);
    });

    test('will have a first block with an image', () => {
      const block = result[0];
      expect(block['@type']).toBe('image');
      expect(block['align']).toBe('right');
      expect(block['alt']).toBe('Chrissy Wainwright 2019');
      expect(block['title']).toBe('Chrissy Wainwright 2019');
      expect(block['size']).toBe('m');
      expect(block['url']).toBe(
        'https://plone.org/foundation/meetings/membership/2019-membership-meeting/nominations/img4_08594.jpg',
      );
    });

    test('will have a second block with text content', () => {
      const block = result[1];
      expect(block['@type']).toBe('heading');
      expect(block['heading']).toContain('Chrissy Wainwright');
    });
  });

  describe('with slate converter', () => {
    const result = convertFromHTML(html, 'slate');

    test('will return an array of blocks', () => {
      expect(result).toHaveLength(10);
    });

    test('will have a first block with an image', () => {
      const block = result[0];
      expect(block['@type']).toBe('image');
      expect(block['align']).toBe('right');
      expect(block['alt']).toBe('Chrissy Wainwright 2019');
      expect(block['title']).toBe('Chrissy Wainwright 2019');
      expect(block['size']).toBe('m');
      expect(block['url']).toBe(
        'https://plone.org/foundation/meetings/membership/2019-membership-meeting/nominations/img4_08594.jpg',
      );
    });

    test('will have a second block with text content', () => {
      const block = result[1];

      expect(block['@type']).toBe('heading');
      // no plaintext for heading
      // expect(block.plaintext).toContain('Chrissy Wainwright');
      // content is directly on the block
      expect(block['tag']).toBe('h2');
      expect(block['heading']).toContain('Chrissy Wainwright');
    });
  });
});

describe('convertFromHTML parsing html with definition lists', () => {
  const html = `
  <div>
    <dl>
    <dt>Problem A1: Injection</dt>
    <dd>How Plone handles this: This is usually found in connections with databases as SQL Injection. As Plone does not use a SQL based database this is not possible. The database that Plone uses is not vulnerable to injection as it uses a binary format that cannot have user data inserted.</dd>
    <dt>Problem A2: Broken Authentication and Session Management</dt>
    <dd>How Plone handles this: Plone authenticates users in its own database using a SSHA hash of their password. Using its modular authentication system Plone can also authenticate users against common authentication systems such as LDAP and SQL as well as any other system for which a plugin is available (Gmail, OpenID, etc.). After authentication, Plone creates a session using a SHA-256 hash of a secret stored on the server, the userid and the current time. This is based on the Apache auth_tkt cookie format, but with a more secure hash function. Secrets can be refreshed on a regular basis to add extra security where needed.</dd>
    <dt>Problem A3: Cross Site Scripting (XSS)</dt>
    <dd>How Plone handles this: Plone has strong filtering in place to make sure that no potentially malicious code can ever be entered into the system. All content that is inserted is stripped of malicious tags like <code>&lt;script&gt;</code>, <code>&lt;embed&gt;</code> and <code>&lt;object&gt;</code>, as well as removing all <code>&lt;form&gt;</code> related tags, stopping users from impersonating any kind of HTTP POST requests. On an infrastructure level, the template language used to create pages in Plone quotes all HTML by default, effectively preventing cross site scripting.</dd>
    </dl>
  </div>
  `;

  describe('with slate converter', () => {
    const result = convertFromHTML(html, 'slate');

    test('will return an array of blocks', () => {
      expect(result).toHaveLength(1);
    });

    test('will have a block with the definition list', () => {
      const block = result[0];
      expect(block['@type']).toBe('slate');
      expect(block.plaintext).toContain('Problem A1: Injection');
      expect(block.plaintext).toContain(
        'Problem A3: Cross Site Scripting (XSS)',
      );
      expect(block['value'][0]['children']).toHaveLength(6);
    });

    test('will have the first definition in the list', () => {
      const definitionList = result[0].value[0];
      const term = definitionList.children[0];
      expect(term['type']).toBe('dt');
      expect(term['children'][0]['text']).toContain('Problem A1: Injection');
      const definition = definitionList.children[1];
      expect(definition['type']).toBe('dd');
      expect(definition['children'][0]['text']).toContain(
        'usually found in connections with databases as SQL Injection',
      );
    });
  });
});

describe('convertFromHTML parsing html with nested divs', () => {
  const html = `
  <div>
    <p><strong>The Plone Conference 2021 will be held as an online event on October 23 - 31, 2021. <br></strong></p>
    <p>The platform for this virtual event is <a href="https://loudswarm.com/" title="LoudSwarm">LoudSwarm</a>.</p>
    <p>The conference website can be found at <a href="https://2021.ploneconf.org/" title="Ploneconf 2021">https://2021.ploneconf.org/</a></p>
    <div class="intro-preliminary">
    <div>
      <p>Conference information (subject due to change):</p>
      <ul>
        <li>Training</li>
        <li>4 days of talks + 1 of open spaces -</li>
        <li>Sprint</li>
      </ul>
    </div>
    </div>
    <div class="cooked">
      <h3><strong>Important dates</strong></h3>
      <ul>
        <li><strong>Call for papers: Now open - <a href="https://docs.google.com/forms/d/1PAZwkO7GDNnSJLr_V6hvTCy6zK4j4PgxnTZDwuOQI1E/viewform?edit_requested=true" title="Submit talks">submit your talk now</a>!</strong></li>
        <li>Early bird registrations: <strong><a href="https://tickets.ploneconf.org/" title="Tickets">Get your tickets now</a></strong>!</li>
        <li>Regular registrations:&nbsp;To be announced</li>
      </ul>
    </div>
    <p><strong>&nbsp;</strong></p>
    <p><strong>Follow Plone and Plone Conference on Twitter <a href="https://twitter.com/plone" title="Plone Twitter">@plone</a> and <a href="https://twitter.com/ploneconf" title="Twitter">@ploneconf</a> and hastag #ploneconf2021</strong></p>
    <p><strong>Stay tuned for more information! </strong></p>
  </div>
  `;

  describe('with slate converter', () => {
    const result = convertFromHTML(html, 'slate');

    test('will return an array of blocks', () => {
      expect(result).toHaveLength(8);
    });

    test('will have a paragraph with a nested p', () => {
      const block = result[0];
      expect(block['@type']).toBe('slate');
      expect(block.plaintext).toContain('The Plone Conference 2021 will be');
      // strong inside a p
      const valueElement = block.value[0];
      const strongElement = valueElement['children'][0];
      expect(strongElement['children'][0]['text']).toContain(
        'The Plone Conference 2021 will be',
      );
    });

    test('will have a paragraph with p and a ul', () => {
      const block = result[3];
      const slateSubTypes = Array.from(block.value)
        .map((item) => item['type'])
        .flat();
      expect(slateSubTypes).toHaveLength(7);
      expect(slateSubTypes[0]).toBe('p');
      expect(slateSubTypes[1]).toBe('p');
      expect(slateSubTypes[2]).toBe('p');
      expect(slateSubTypes[3]).toBe('p');
      expect(slateSubTypes[4]).toBe('ul');
      expect(slateSubTypes[5]).toBe('p');
      expect(slateSubTypes[6]).toBe('p');
    });
  });
});

describe('convertFromHTML parsing unwrapped text', () => {
  const html = 'text with an <b>inline element</b> and more text';

  describe('with slate converter', () => {
    const result = convertFromHTML(html, 'slate');

    test('will return a block with the text in a paragraph', () => {
      expect(result).toHaveLength(1);
      expect(result[0].value).toEqual([
        {
          type: 'p',
          children: [
            { text: 'text with an ' },
            { type: 'strong', children: [{ text: 'inline element' }] },
            { text: ' and more text' },
          ],
        },
      ]);
    });
  });
});

describe('convertFromHTML parsing unwrapped text with blocks', () => {
  const html = 'text with a <div>block element</div> and more text';

  describe('with slate converter', () => {
    const result = convertFromHTML(html, 'slate');

    test('will return 3 blocks with the text in paragraphs', () => {
      expect(result).toHaveLength(3);
      expect(result[0].value).toEqual([
        { type: 'p', children: [{ text: 'text with a ' }] },
      ]);
      expect(result[1].value).toEqual([
        { type: 'p', children: [{ text: 'block element' }] },
      ]);
      expect(result[2].value).toEqual([
        { type: 'p', children: [{ text: ' and more text' }] },
      ]);
    });
  });
});

describe('convertFromHTML parsing div with br tags', () => {
  const html = '<div><b>Foo</b> <br /><br />Bar</div>';

  describe('with slate converter', () => {
    const result = convertFromHTML(html, 'slate');

    test('will return a block with the text in a paragraph', () => {
      expect(result).toHaveLength(1);
      expect(result[0].value).toEqual([
        {
          type: 'p',
          children: [
            { type: 'strong', children: [{ text: 'Foo' }] },
            { text: '\n\nBar' },
          ],
        },
      ]);
    });
  });
});

describe('convertFromHTML parsing whitespace inside unknown tags', () => {
  const html = '<center>\n<strong>text</strong>\n</center>';

  test('returns valid result preserving the whitespace', () => {
    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(1);
    expect(result[0].value).toEqual([
      { text: ' ' },
      { type: 'strong', children: [{ text: 'text' }] },
      { text: ' ' },
    ]);
  });
});

describe('convertFromHTML parsing image', () => {
  // https://github.com/plone/blocks-conversion-tool/issues/21

  test('on its own', () => {
    const html = '<img src="image.jpeg">';

    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        '@type': 'image',
        align: 'center',
        alt: '',
        format: 'large', // default FHNW format
        size: 'l',
        title: '',
        url: 'image.jpeg',
      },
    ]);
  });

  test('inside a block element with another image', () => {
    const html = '<div><img src="image1.jpg"><img src="image2.jpg"></div>';

    const result = convertFromHTML(html, 'slate');
    expect(result).toEqual([
      {
        '@type': 'image',
        align: 'center',
        alt: '',
        format: 'large', // default FHNW format
        size: 'l',
        title: '',
        url: 'image1.jpg',
      },
      {
        '@type': 'image',
        align: 'center',
        alt: '',
        format: 'large', // default FHNW format
        size: 'l',
        title: '',
        url: 'image2.jpg',
      },
    ]);
  });

  test('inside a p element', () => {
    const html = '<p><img src="image.jpeg"></p>';

    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        '@type': 'image',
        align: 'center',
        alt: '',
        format: 'large', // default FHNW format
        size: 'l',
        title: '',
        url: 'image.jpeg',
      },
    ]);
  });

  test('inside a span element', () => {
    const html = '<p><span><img src="image.jpeg"></span></p>';

    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        '@type': 'image',
        align: 'center',
        alt: '',
        format: 'large', // default FHNW format
        size: 'l',
        title: '',
        url: 'image.jpeg',
      },
    ]);
  });

  test('inside a div element', () => {
    // https://github.com/plone/blocks-conversion-tool/issues/21#issuecomment-1455176066
    const html = '<div><img src="image.jpeg"></div>';

    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        '@type': 'image',
        align: 'center',
        alt: '',
        format: 'large', // default FHNW format
        size: 'l',
        title: '',
        url: 'image.jpeg',
      },
    ]);
  });

  test('inside a nested div element', () => {
    // https://github.com/plone/blocks-conversion-tool/issues/21#issuecomment-1455176066
    const html = '<div><div><img src="image.jpeg"></div></div>';

    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        '@type': 'image',
        align: 'center',
        alt: '',
        format: 'large', // default FHNW format
        size: 'l',
        title: '',
        url: 'image.jpeg',
      },
    ]);
  });

  test('inside a nested div element with line breaks', () => {
    const html = `<div>
    <div>
    <p><span><img src="image.jpeg"  /></span></p>
    </div>
    </div>
    `;

    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      '@type': 'image',
      align: 'center',
      alt: '',
      format: 'large', // default FHNW format
      size: 'l',
      title: '',
      url: 'image.jpeg',
    });
  });

  test('inside a nested span element containing valid text', () => {
    const html = '<p><span><img src="image.jpeg" />text</span></p>';

    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      '@type': 'image',
      align: 'center',
      alt: '',
      format: 'large', // default FHNW format
      size: 'l',
      title: '',
      url: 'image.jpeg',
    });
  });

  test('inside a nested span element, with a sibling containing valid text', () => {
    const html =
      '<p><span><img src="image.jpeg" /></span><span>text</span></p>';

    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      '@type': 'image',
      align: 'center',
      alt: '',
      format: 'large', // default FHNW format
      size: 'l',
      title: '',
      url: 'image.jpeg',
    });
  });

  test('inside a nested link element should add the href property', () => {
    const html =
      '<p><a href="https://plone.org"><img src="image.jpeg"></a></p>';

    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        '@type': 'image',
        align: 'center',
        alt: '',
        format: 'large', // default FHNW format
        href: [
          {
            '@id': 'https://plone.org',
            title: 'plone.org',
          },
        ],
        size: 'l',
        title: '',
        url: 'image.jpeg',
      },
    ]);
  });

  test('inside a table', () => {
    const html =
      '<table><tr><td><div><img src="image.jpeg" /></div></td></tr></table>';

    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      '@type': 'image',
      align: 'center',
      alt: '',
      format: 'large', // default FHNW
      size: 'l',
      title: '',
      url: 'image.jpeg',
    });
  });
});

describe('convertFromHTML parsing nested tags', () => {
  test('with a span inside a link', () => {
    const html = '<a href="link"><span>text</span></a>';
    const result = convertFromHTML(html, 'slate');
    expect(result).toEqual([
      {
        '@type': 'slate',
        plaintext: 'text',
        value: [
          {
            type: 'link',
            data: { url: 'link', target: null, title: null },
            children: [{ text: 'text' }],
          },
        ],
      },
    ]);
  });
  test('with an image and without line breaks', () => {
    const html = `<div>
    <div><p><span><img src="image.jpg"  /></span></p></div>
    <p ><span><a href="link"><span><span><span>Text</span></span></span></a>, </span><a href="link"><span>text</span></a>, <a href="link"><span><span>text</span></span> </a></p>
    </div>`;
    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(2);
  });
  test('with an image and with an additional line break', () => {
    const html = `<div>
    <div>
    <p><span><img src="image.jpg"  /></span></p>
    </div>
    <p ><span><a href="link"><span><span><span>Text</span></span></span></a>, </span><a href="link"><span>text</span></a>, <a href="link"><span><span>text</span></span> </a></p>
    </div>`;
    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(2);
  });
  test('with paragraph, table and image blocks', () => {
    const html = `<p>
    <table>
    <tbody>
    <tr>
    <td>
    <div><img src="image.png" /></div>
    </td>
    </tr>
    </tbody>
    </table>
    </p>`;
    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(1);
    expect(result[0]['@type']).toBe('image');
  });
  test('with paragraph, table and image blocks', () => {
    const html = `<div>
    <div>
    <p>
    <table>
    <tbody>
    <tr>
    <td>
    <div><img src="image.png"/></div>
    </td>
    </tr>
    </tbody>
    </table>
    </p>
    </div>
    <p></p>
    </div>`;
    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(1);
    expect(result[0]['@type']).toBe('image');
  });
  test('with paragraph, table, image blocks, and other paragraph', () => {
    const html = `<div>
    <p>
    <table>
    <tbody>
    <tr>
    <td>
    <div><img src="image.png"/></div>
    </td>
    </tr>
    </tbody>
    </table>
    </p>
    <p></p>
    <p>A text</p>
    </div>`;
    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(2);
    expect(result[0]['@type']).toBe('image');
    expect(result[1]['@type']).toBe('slate');
  });
  test('with paragraph, and text and image in table', () => {
    const html = `<p>
    <table>
    <tbody>
    <tr>
    <td>text in table<img src="image.png" /></td>
    </tr>
    </tbody>
    </table>
    </p>`;
    const result = convertFromHTML(html, 'slate');
    expect(result).toHaveLength(2);
    expect(result[0]['@type']).toBe('image');
    expect(result[1]['@type']).toBe('slateTable');
  });
});
