import { v4 as uuidv4 } from 'uuid';

const EDITABLE_ELEMENTS = [
  'div', 'nav', 'ul', 'li', 'a', 'main', 'h1', 'p', 'input',
  'span', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'footer',
  'section', 'article', 'button', 'form', 'label', 'img',
  'table', 'tr', 'td', 'th'
];

const convertToEditable = (code: string): string => {
  let result = code;

  EDITABLE_ELEMENTS.forEach((element) => {
    const openingRegex = new RegExp(`<(${element})(\\s+[^>]*)?>`, 'g');
    const closingRegex = new RegExp(`</(${element})>`, 'g');

    result = result
      .replace(openingRegex, (_, tagName, attributes) => {
        // Generate a unique ID
        const uniqueId = uuidv4();

        // Check if the element already has an id attribute
        if (attributes && /id\s*=\s*['"]\w+['"]/.test(attributes)) {
          return `<Editable.${tagName}${attributes}>`;
        }

        // Inject a unique ID if not present
        return `<Editable.${tagName} id="${uniqueId}"${attributes || ''}>`;
      })
      .replace(closingRegex, `</Editable.$1>`);
  });

  return result;
};

// Test case
const code = `
<div className="container">
  <p>Hello World</p>
</div>
`;

const ans = convertToEditable(code);
console.log(ans);
