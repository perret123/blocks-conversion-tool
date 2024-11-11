import request from 'supertest';
import app from '../app.js';

describe('when accessing the /html endpoint', () => {
  const endpoint = '/html';
  const html = '<h2>Would you like to help with this effort?</h2>';

  describe('and passing draftjs as converter', () => {
    test('should return 200 status code', async () => {
      const response = await request(app).post(endpoint).send({
        html: html,
        converter: 'draftjs',
      });
      expect(response.statusCode).toBe(200);
    });
    test('should contain one block', async () => {
      const response = await request(app).post(endpoint).send({
        html: html,
        converter: 'draftjs',
      });
      const data = response.body.data;
      expect(data).toHaveLength(1);
      const firstBlock = data[0];
      expect(firstBlock['@type']).toBe('heading');
      expect(firstBlock.heading).toBe(
        'Would you like to help with this effort?',
      );
      //expect(firstBlock.text.blocks[0]['type']).toBe('header-two');
    });
  });

  describe('and passing slate as converter', () => {
    test('should return 200 status code', async () => {
      const response = await request(app).post(endpoint).send({
        html: html,
        converter: 'slate',
      });
      expect(response.statusCode).toBe(200);
    });
    test('should contain one block', async () => {
      const response = await request(app).post(endpoint).send({
        html: html,
        converter: 'slate',
      });
      const data = response.body.data;
      expect(data).toHaveLength(1);
      const firstBlock = data[0];
      expect(firstBlock['@type']).toBe('heading');
      expect(firstBlock.heading).toBe(
        'Would you like to help with this effort?',
      );
      // expect(firstBlock.value[0].type).toBe('h2');
    });
  });

  describe('FHNW Case 1: Accordion with Buttons and Tables', () => {
    test('should return the correct blocks', async () => {
      var newHtml = `<p class="tiny_accordeon_title">Gross ohne Umlauf</p>
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
      const response = await request(app).post(endpoint).send({
        html: newHtml,
        converter: 'slate',
      });
      const data = response.body.data;

      // Expected output
      expect(data).toHaveLength(1);
      console.log(data);
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

      const accordionBlock = data[0];
      const accordionItems = accordionBlock.data.blocks;
      const accordionLayoutItems = accordionBlock.data.blocks_layout.items;

      // Check that there are 3 accordion items
      expect(Object.keys(accordionItems)).toHaveLength(3);
      expect(accordionLayoutItems).toHaveLength(3);

      // Helper function to find accordion item by title
      const findAccordionItemByTitle = (title) => {
        const itemId = Object.keys(accordionItems).find(
          (id) => accordionItems[id].title === title,
        );
        return accordionItems[itemId];
      };

      // Accordion Item 1: "Gross ohne Umlauf"
      const accordionItem1 = findAccordionItemByTitle('Gross ohne Umlauf');
      expect(accordionItem1).toMatchObject({
        '@type': 'accordionPanel',
        title: 'Gross ohne Umlauf',
        blocks: expect.any(Object),
        blocks_layout: {
          items: expect.any(Array),
        },
      });

      // Check blocks in Accordion Item 1
      const item1Blocks = accordionItem1.blocks;
      const item1LayoutItems = accordionItem1.blocks_layout.items;
      expect(item1LayoutItems).toHaveLength(4);

      const block1 = item1Blocks[item1LayoutItems[0]];
      expect(block1).toMatchObject({
        '@type': 'image',
        url: '../../../../resolveuid/daa75bd0f5d141ab8e32bdeb9f228587',
        alt: '',
        title: '',
        format: 'large',
        size: 'l',
      });

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

      const block3 = item1Blocks[item1LayoutItems[2]];
      expect(block3).toMatchObject({
        '@type': 'slate',
        plaintext: 'Bildlegende',
        value: [
          {
            type: 'p',
            children: [{ text: 'Bildlegende' }],
          },
        ],
      });

      const block4 = item1Blocks[item1LayoutItems[3]];
      expect(block4).toMatchObject({
        '@type': 'slate',
        plaintext: 'Mehr Text',
        value: [
          {
            type: 'p',
            children: [{ text: 'Mehr Text' }],
          },
        ],
      });

      const accordionItem2 = findAccordionItemByTitle('Buttons');
      expect(accordionItem2).toMatchObject({
        '@type': 'accordionPanel',
        title: 'Buttons',
        blocks: expect.any(Object),
        blocks_layout: {
          items: expect.any(Array),
        },
      });

      const item2Blocks = accordionItem2.blocks;
      const item2LayoutItems = accordionItem2.blocks_layout.items;
      expect(item2LayoutItems).toHaveLength(4);

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

      const block6 = item2Blocks[item2LayoutItems[1]];
      expect(block6).toMatchObject({
        '@type': '__button',
        title: 'This is a button!',
        href: [
          {
            '@id': 'https://www.google.ch',
            title: 'This is a button!',
          },
        ],
        inneralign: 'left',
        styles: {
          variation: 'black',
        },
      });

      const block7 = item2Blocks[item2LayoutItems[2]];
      expect(block7).toMatchObject({
        '@type': '__button',
        title: 'This is a secondary button - white instead of black',
        href: [
          {
            '@id': 'https://www.google.ch',
            title: 'This is a secondary button - white instead of black',
          },
        ],
        inneralign: 'left',
        styles: {
          variation: 'white',
        },
      });

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

      const accordionItem3 = findAccordionItemByTitle('Tabelle');
      expect(accordionItem3).toMatchObject({
        '@type': 'accordionPanel',
        title: 'Tabelle',
        blocks: expect.any(Object),
        blocks_layout: {
          items: expect.any(Array),
        },
      });

      const item3Blocks = accordionItem3.blocks;
      const item3LayoutItems = accordionItem3.blocks_layout.items;
      expect(item3LayoutItems).toHaveLength(1);

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
        type: 'p',
        children: [{ text: 'Tabelle Reihe 1 Feld 1' }],
      });

      const dataRow = tableRows[1];
      expect(dataRow.cells).toHaveLength(3);
      expect(dataRow.cells[0].type).toBe('data');
      expect(dataRow.cells[0].value[0]).toMatchObject({
        type: 'p',
        children: [{ text: 'Normale Reihe' }],
      });

      expect(Object.keys(item1Blocks)).toHaveLength(4);
      expect(Object.keys(item2Blocks)).toHaveLength(4);
      expect(Object.keys(item3Blocks)).toHaveLength(1);
    });
  });
});
